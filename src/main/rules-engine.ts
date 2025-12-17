import type {
  IntentType,
  IntentClassification,
  ActionType,
  ScriptureReference,
  QueueItem,
  PastorProfile,
  AggressivenessLevel,
} from '../shared/types'
import { ScriptureDatabase } from './database'
import { v4 as uuidv4 } from 'uuid'

// Intent signal patterns
const STRONG_POSITIVE_SIGNALS = [
  'turn with me to',
  "let's read",
  'put up',
  'open your bibles to',
  'can we show',
  "let's look at",
  'go to',
  'read from',
  'turn to',
  "let's go to",
  'please turn to',
  'if you have your bibles',
  'the bible says in',
]

const WEAK_SIGNALS = [
  'in romans',
  'paul says',
  'the bible tells us',
  'scripture says',
  'we read that',
  'as it says in',
  'according to',
  'it says in',
]

const NEGATIVE_SIGNALS = [
  'paul told them',
  'in essence',
  'basically',
  'so to speak',
  'as they say',
  'metaphorically',
  'like when',
  'similar to',
]

// Cooldown tracking
interface CooldownEntry {
  key: string
  timestamp: number
}

// Chapter context for verse-only references
interface ChapterContext {
  book: string
  chapter: number
  translation: string
  timestamp: number
}

export class RulesEngine {
  private database: ScriptureDatabase
  private cooldownMap: Map<string, number> = new Map()
  private chapterContext: ChapterContext | null = null
  private debounceMap: Map<string, number> = new Map()
  private activeProfile: PastorProfile | null = null

  // Configurable settings
  private cooldownSeconds: number = 30
  private contextTimeoutSeconds: number = 20
  private debounceMs: number = 2000
  private aggressiveness: AggressivenessLevel = 'balanced'

  constructor(database: ScriptureDatabase) {
    this.database = database
  }

  /**
   * Set the active pastor profile for tuning.
   */
  setProfile(profile: PastorProfile | null): void {
    this.activeProfile = profile
    if (profile) {
      this.aggressiveness = profile.aggressiveness
      this.contextTimeoutSeconds = profile.contextTimeoutSeconds
    }
  }

  /**
   * Configure engine settings.
   */
  configure(settings: {
    cooldownSeconds?: number
    contextTimeoutSeconds?: number
    debounceMs?: number
    aggressiveness?: AggressivenessLevel
  }): void {
    if (settings.cooldownSeconds !== undefined) {
      this.cooldownSeconds = settings.cooldownSeconds
    }
    if (settings.contextTimeoutSeconds !== undefined) {
      this.contextTimeoutSeconds = settings.contextTimeoutSeconds
    }
    if (settings.debounceMs !== undefined) {
      this.debounceMs = settings.debounceMs
    }
    if (settings.aggressiveness !== undefined) {
      this.aggressiveness = settings.aggressiveness
    }
  }

  /**
   * Process a transcript segment and determine if action is needed.
   */
  processTranscript(
    text: string,
    sttConfidence: number = 1.0
  ): QueueItem | null {
    // Step 1: Normalize the text
    const normalized = this.normalizeText(text)

    // Step 2: Check debounce
    const debounceKey = this.getDebounceKey(normalized)
    if (this.isDebounced(debounceKey)) {
      return null
    }

    // Step 3: Classify intent
    const intent = this.classifyIntent(normalized)

    // Step 4: If no intent to display, ignore
    if (
      intent.type === 'contextual_reference' ||
      intent.type === 'rhetorical_thematic'
    ) {
      return null
    }

    // Step 5: Extract scripture reference
    const reference = this.extractReference(normalized)
    if (!reference) {
      return null
    }

    // Step 6: Check cooldown
    const cooldownKey = this.getCooldownKey(reference)
    if (this.isOnCooldown(cooldownKey)) {
      return null
    }

    // Step 7: Resolve passage from database
    const passage = this.database.getPassage(reference)
    if (!passage) {
      return null
    }

    // Step 8: Calculate confidence score
    const confidence = this.calculateConfidence(intent, sttConfidence, reference)

    // Step 9: Determine action
    const action = this.classifyAction(intent, confidence)

    // Step 10: Update state
    this.updateCooldown(cooldownKey)
    this.updateChapterContext(reference)
    this.updateDebounce(debounceKey)

    // Step 11: Build queue item
    return {
      id: uuidv4(),
      reference,
      displayReference: passage.displayReference,
      text: passage.text,
      source: 'voice',
      action,
      status: 'pending',
      createdAt: Date.now(),  // Unix timestamp for IPC safety
      confidence,
      intentType: intent.type,
    }
  }

  /**
   * Normalize transcript text for processing.
   */
  private normalizeText(text: string): string {
    let normalized = text.toLowerCase().trim()

    // Convert spoken numbers to digits
    const numberWords: Record<string, string> = {
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
      ten: '10',
      eleven: '11',
      twelve: '12',
      thirteen: '13',
      fourteen: '14',
      fifteen: '15',
      sixteen: '16',
      seventeen: '17',
      eighteen: '18',
      nineteen: '19',
      twenty: '20',
      thirty: '30',
      forty: '40',
      fifty: '50',
      first: '1',
      second: '2',
      third: '3',
    }

    for (const [word, digit] of Object.entries(numberWords)) {
      normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
    }

    // Remove filler words
    const fillers = ['um', 'uh', 'er', 'ah', 'like', 'you know']
    for (const filler of fillers) {
      normalized = normalized.replace(new RegExp(`\\b${filler}\\b`, 'g'), '')
    }

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim()

    return normalized
  }

  /**
   * Classify the intent of the transcript.
   */
  private classifyIntent(text: string): IntentClassification {
    const signals: string[] = []
    let positiveScore = 0
    let negativeScore = 0

    // Check profile-specific phrases first
    if (this.activeProfile) {
      for (const phrase of this.activeProfile.wakePhrases) {
        if (text.includes(phrase.toLowerCase())) {
          positiveScore += 3
          signals.push(`profile:${phrase}`)
        }
      }
      for (const phrase of this.activeProfile.ignorePhrases) {
        if (text.includes(phrase.toLowerCase())) {
          negativeScore += 3
          signals.push(`profile-ignore:${phrase}`)
        }
      }
    }

    // Check strong positive signals
    for (const signal of STRONG_POSITIVE_SIGNALS) {
      if (text.includes(signal)) {
        positiveScore += 2
        signals.push(signal)
      }
    }

    // Check weak signals
    for (const signal of WEAK_SIGNALS) {
      if (text.includes(signal)) {
        positiveScore += 1
        signals.push(signal)
      }
    }

    // Check negative signals
    for (const signal of NEGATIVE_SIGNALS) {
      if (text.includes(signal)) {
        negativeScore += 2
        signals.push(`negative:${signal}`)
      }
    }

    // Adjust based on aggressiveness
    const aggressivenessMultiplier =
      this.aggressiveness === 'conservative'
        ? 0.8
        : this.aggressiveness === 'responsive'
        ? 1.2
        : 1.0

    const netScore =
      (positiveScore - negativeScore) * aggressivenessMultiplier

    // Determine intent type
    let type: IntentType
    let confidence: number

    if (netScore >= 2) {
      type = 'explicit_display'
      confidence = Math.min(0.95, 0.7 + netScore * 0.1)
    } else if (netScore >= 1) {
      type = 'implicit_display'
      confidence = Math.min(0.8, 0.5 + netScore * 0.1)
    } else if (negativeScore > 0) {
      type = 'rhetorical_thematic'
      confidence = 0.3
    } else {
      type = 'contextual_reference'
      confidence = 0.4
    }

    return { type, confidence, signals }
  }

  /**
   * Extract scripture reference from text.
   */
  private extractReference(text: string): ScriptureReference | null {
    // Try full reference pattern first
    const fullRef = this.database.parseReference(text)
    if (fullRef) {
      return fullRef
    }

    // Try to find book name with chapter/verse
    const bookPattern =
      /(\d?\s*[a-z]+(?:\s+[a-z]+)?)\s+(?:chapter\s+)?(\d+)(?:\s*[,:]\s*(?:verse\s+)?(\d+)(?:\s*[-–]\s*(\d+))?)?/i
    const match = text.match(bookPattern)

    if (match) {
      const [, bookPart, chapter, verseStart, verseEnd] = match
      return {
        book: bookPart.trim(),
        chapter: parseInt(chapter, 10),
        verseStart: verseStart ? parseInt(verseStart, 10) : undefined,
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
        translation: 'KJV',
      }
    }

    // Check for verse-only reference with chapter context
    const verseOnlyPattern = /(?:verse|v\.?)\s*(\d+)(?:\s*[-–]\s*(\d+))?/i
    const verseMatch = text.match(verseOnlyPattern)

    if (verseMatch && this.chapterContext) {
      const now = Date.now()
      const contextAge =
        (now - this.chapterContext.timestamp) / 1000

      if (contextAge <= this.contextTimeoutSeconds) {
        return {
          book: this.chapterContext.book,
          chapter: this.chapterContext.chapter,
          verseStart: parseInt(verseMatch[1], 10),
          verseEnd: verseMatch[2] ? parseInt(verseMatch[2], 10) : undefined,
          translation: this.chapterContext.translation,
          bookFromContext: true,  // Flag that book was inferred from context
        }
      }
    }

    return null
  }

  /**
   * Calculate overall confidence score.
   */
  private calculateConfidence(
    intent: IntentClassification,
    sttConfidence: number,
    reference: ScriptureReference
  ): number {
    let confidence = intent.confidence * sttConfidence

    // Boost for complete references
    if (reference.verseStart) {
      confidence *= 1.1
    }

    // Penalty for using chapter context (book was inferred, not explicitly stated)
    if (reference.bookFromContext) {
      confidence *= 0.9
    }

    return Math.min(1.0, Math.max(0, confidence))
  }

  /**
   * Classify the action to take based on intent and confidence.
   */
  private classifyAction(
    intent: IntentClassification,
    confidence: number
  ): ActionType {
    if (intent.type === 'explicit_display' && confidence >= 0.7) {
      return 'QUEUE'
    }

    if (intent.type === 'implicit_display' && confidence >= 0.6) {
      return confidence >= 0.8 ? 'QUEUE' : 'QUEUE_WITH_WARNING'
    }

    if (confidence >= 0.5) {
      return 'SUGGEST'
    }

    return 'IGNORE'
  }

  /**
   * Generate a cooldown key for a reference.
   */
  private getCooldownKey(ref: ScriptureReference): string {
    const parts = [
      ref.translation,
      ref.book,
      ref.chapter.toString(),
      ref.verseStart?.toString() || '',
      ref.verseEnd?.toString() || '',
    ]
    return parts.join(':').toLowerCase()
  }

  /**
   * Check if a reference is on cooldown.
   */
  private isOnCooldown(key: string): boolean {
    const lastTime = this.cooldownMap.get(key)
    if (!lastTime) return false

    const elapsed = (Date.now() - lastTime) / 1000
    return elapsed < this.cooldownSeconds
  }

  /**
   * Update cooldown for a reference and clean up stale entries.
   */
  private updateCooldown(key: string): void {
    this.cooldownMap.set(key, Date.now())

    // Clean up stale entries to prevent memory leak
    const now = Date.now()
    const cooldownMs = this.cooldownSeconds * 1000
    for (const [k, timestamp] of this.cooldownMap.entries()) {
      if (now - timestamp > cooldownMs) {
        this.cooldownMap.delete(k)
      }
    }
  }

  /**
   * Update chapter context for verse-only references.
   */
  private updateChapterContext(ref: ScriptureReference): void {
    this.chapterContext = {
      book: ref.book,
      chapter: ref.chapter,
      translation: ref.translation,
      timestamp: Date.now(),
    }
  }

  /**
   * Generate debounce key for text.
   */
  private getDebounceKey(text: string): string {
    // Use first 50 chars as key
    return text.substring(0, 50)
  }

  /**
   * Check if text is debounced.
   */
  private isDebounced(key: string): boolean {
    const lastTime = this.debounceMap.get(key)
    if (!lastTime) return false

    const elapsed = Date.now() - lastTime
    return elapsed < this.debounceMs
  }

  /**
   * Update debounce for text.
   */
  private updateDebounce(key: string): void {
    this.debounceMap.set(key, Date.now())

    // Clean up old entries
    const now = Date.now()
    for (const [k, v] of this.debounceMap) {
      if (now - v > this.debounceMs * 2) {
        this.debounceMap.delete(k)
      }
    }
  }

  /**
   * Clear all state.
   */
  reset(): void {
    this.cooldownMap.clear()
    this.debounceMap.clear()
    this.chapterContext = null
  }
}

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type {
  Translation,
  Book,
  Verse,
  ScriptureReference,
  ScripturePassage,
  BookAlias,
} from '../shared/types'

// Book aliases for fuzzy matching
const BOOK_ALIASES: Record<string, string[]> = {
  Genesis: ['Gen', 'Gn'],
  Exodus: ['Exod', 'Ex', 'Exo'],
  Leviticus: ['Lev', 'Lv'],
  Numbers: ['Num', 'Nm', 'Nu'],
  Deuteronomy: ['Deut', 'Dt'],
  Joshua: ['Josh', 'Jos'],
  Judges: ['Judg', 'Jdg', 'Jg'],
  Ruth: ['Ru', 'Rth'],
  '1 Samuel': ['1 Sam', '1 Sa', 'First Samuel', '1st Samuel'],
  '2 Samuel': ['2 Sam', '2 Sa', 'Second Samuel', '2nd Samuel'],
  '1 Kings': ['1 Kgs', '1 Ki', 'First Kings', '1st Kings'],
  '2 Kings': ['2 Kgs', '2 Ki', 'Second Kings', '2nd Kings'],
  '1 Chronicles': ['1 Chr', '1 Ch', 'First Chronicles', '1st Chronicles'],
  '2 Chronicles': ['2 Chr', '2 Ch', 'Second Chronicles', '2nd Chronicles'],
  Ezra: ['Ezr'],
  Nehemiah: ['Neh', 'Ne'],
  Esther: ['Est', 'Esth'],
  Job: ['Jb'],
  Psalms: ['Psalm', 'Ps', 'Psa', 'Pss'],
  Proverbs: ['Prov', 'Pr', 'Prv'],
  Ecclesiastes: ['Eccl', 'Ecc', 'Ec', 'Qoh'],
  'Song of Solomon': ['Song', 'SoS', 'Song of Songs', 'Canticles', 'Cant'],
  Isaiah: ['Isa', 'Is'],
  Jeremiah: ['Jer', 'Je'],
  Lamentations: ['Lam', 'La'],
  Ezekiel: ['Ezek', 'Eze', 'Ez'],
  Daniel: ['Dan', 'Da', 'Dn'],
  Hosea: ['Hos', 'Ho'],
  Joel: ['Joe', 'Jl'],
  Amos: ['Am'],
  Obadiah: ['Obad', 'Ob'],
  Jonah: ['Jon', 'Jnh'],
  Micah: ['Mic', 'Mi'],
  Nahum: ['Nah', 'Na'],
  Habakkuk: ['Hab', 'Hb'],
  Zephaniah: ['Zeph', 'Zep', 'Zp'],
  Haggai: ['Hag', 'Hg'],
  Zechariah: ['Zech', 'Zec', 'Zc'],
  Malachi: ['Mal', 'Ml'],
  Matthew: ['Matt', 'Mt'],
  Mark: ['Mk', 'Mr'],
  Luke: ['Lk', 'Lu'],
  John: ['Jn', 'Jhn'],
  Acts: ['Act', 'Ac'],
  Romans: ['Rom', 'Ro', 'Rm'],
  '1 Corinthians': ['1 Cor', '1 Co', 'First Corinthians', '1st Corinthians', 'one Corinthians', 'won Corinthians'],
  '2 Corinthians': ['2 Cor', '2 Co', 'Second Corinthians', '2nd Corinthians'],
  Galatians: ['Gal', 'Ga'],
  Ephesians: ['Eph', 'Ephes'],
  Philippians: ['Phil', 'Php', 'Philippines', 'Phillipians'],
  Colossians: ['Col', 'Co'],
  '1 Thessalonians': ['1 Thess', '1 Th', 'First Thessalonians', '1st Thessalonians'],
  '2 Thessalonians': ['2 Thess', '2 Th', 'Second Thessalonians', '2nd Thessalonians'],
  '1 Timothy': ['1 Tim', '1 Ti', 'First Timothy', '1st Timothy'],
  '2 Timothy': ['2 Tim', '2 Ti', 'Second Timothy', '2nd Timothy'],
  Titus: ['Tit', 'Ti'],
  Philemon: ['Phlm', 'Phm'],
  Hebrews: ['Heb'],
  James: ['Jas', 'Jm'],
  '1 Peter': ['1 Pet', '1 Pe', 'First Peter', '1st Peter'],
  '2 Peter': ['2 Pet', '2 Pe', 'Second Peter', '2nd Peter'],
  '1 John': ['1 Jn', 'First John', '1st John'],
  '2 John': ['2 Jn', 'Second John', '2nd John'],
  '3 John': ['3 Jn', 'Third John', '3rd John'],
  Jude: ['Jud', 'Jd'],
  Revelation: ['Rev', 'Re', 'Revelations', 'The Revelation', 'Apocalypse'],
}

export class ScriptureDatabase {
  private db: Database.Database

  constructor(dbPath: string) {
    // Ensure directory exists
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
  }

  async initialize(): Promise<void> {
    this.createTables()
    await this.seedDefaultData()
  }

  private createTables(): void {
    // Translations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'en',
        copyright TEXT
      )
    `)

    // Books table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        translation_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        testament TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
        position INTEGER NOT NULL,
        FOREIGN KEY (translation_id) REFERENCES translations(id),
        UNIQUE(translation_id, position)
      )
    `)

    // Book aliases table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS book_aliases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        alias TEXT NOT NULL,
        is_stt_correction INTEGER DEFAULT 0,
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE(book_id, alias)
      )
    `)

    // Verses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE(book_id, chapter, verse)
      )
    `)

    // FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
        text,
        content='verses',
        content_rowid='id'
      )
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_books_translation ON books(translation_id);
      CREATE INDEX IF NOT EXISTS idx_verses_book ON verses(book_id);
      CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(book_id, chapter);
      CREATE INDEX IF NOT EXISTS idx_book_aliases_alias ON book_aliases(alias COLLATE NOCASE);
    `)
  }

  private async seedDefaultData(): Promise<void> {
    // Check if KJV already exists
    const existingTranslation = this.db
      .prepare('SELECT id FROM translations WHERE code = ?')
      .get('KJV')

    if (existingTranslation) {
      return // Already seeded
    }

    // Insert KJV translation
    const insertTranslation = this.db.prepare(`
      INSERT INTO translations (code, name, language, copyright)
      VALUES (?, ?, ?, ?)
    `)

    const result = insertTranslation.run(
      'KJV',
      'King James Version',
      'en',
      'Public Domain'
    )

    const translationId = result.lastInsertRowid as number

    // Insert books and aliases
    const insertBook = this.db.prepare(`
      INSERT INTO books (translation_id, name, abbreviation, testament, position)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertAlias = this.db.prepare(`
      INSERT OR IGNORE INTO book_aliases (book_id, alias, is_stt_correction)
      VALUES (?, ?, ?)
    `)

    const books = this.getBookList()
    const insertBooks = this.db.transaction(() => {
      for (const book of books) {
        const bookResult = insertBook.run(
          translationId,
          book.name,
          book.abbreviation,
          book.testament,
          book.position
        )
        const bookId = bookResult.lastInsertRowid as number

        // Insert aliases
        const aliases = BOOK_ALIASES[book.name] || []
        for (const alias of aliases) {
          insertAlias.run(bookId, alias.toLowerCase(), 0)
        }
        // Also insert lowercase name as alias
        insertAlias.run(bookId, book.name.toLowerCase(), 0)
      }
    })

    insertBooks()

    // Seed sample verses for common references
    await this.seedSampleVerses(translationId)
  }

  private async seedSampleVerses(translationId: number): Promise<void> {
    const insertVerse = this.db.prepare(`
      INSERT OR IGNORE INTO verses (book_id, chapter, verse, text)
      VALUES (?, ?, ?, ?)
    `)

    const getBookId = this.db.prepare(`
      SELECT id FROM books WHERE translation_id = ? AND name = ?
    `)

    // Sample verses to demonstrate the app
    const sampleVerses = [
      // John 3:16
      { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { book: 'John', chapter: 3, verse: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
      // Psalm 23
      { book: 'Psalms', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { book: 'Psalms', chapter: 23, verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { book: 'Psalms', chapter: 23, verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
      // Romans 8:28
      { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      // Philippians 4:13
      { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ which strengtheneth me.' },
      // Jeremiah 29:11
      { book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
      // Isaiah 41:10
      { book: 'Isaiah', chapter: 41, verse: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
      // Matthew 11:28
      { book: 'Matthew', chapter: 11, verse: 28, text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
      { book: 'Matthew', chapter: 11, verse: 29, text: 'Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.' },
      { book: 'Matthew', chapter: 11, verse: 30, text: 'For my yoke is easy, and my burden is light.' },
      // Romans 15:13
      { book: 'Romans', chapter: 15, verse: 13, text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.' },
      // Hebrews 11:1
      { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
      // Proverbs 3:5-6
      { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
      { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
    ]

    const transaction = this.db.transaction(() => {
      for (const verse of sampleVerses) {
        const book = getBookId.get(translationId, verse.book) as { id: number } | undefined
        if (book) {
          insertVerse.run(book.id, verse.chapter, verse.verse, verse.text)
        }
      }
    })

    transaction()

    // Rebuild FTS index
    this.db.exec(`
      INSERT INTO verses_fts(verses_fts) VALUES('rebuild');
    `)
  }

  private getBookList(): Array<{ name: string; abbreviation: string; testament: 'OT' | 'NT'; position: number }> {
    return [
      // Old Testament
      { name: 'Genesis', abbreviation: 'Gen', testament: 'OT', position: 1 },
      { name: 'Exodus', abbreviation: 'Exod', testament: 'OT', position: 2 },
      { name: 'Leviticus', abbreviation: 'Lev', testament: 'OT', position: 3 },
      { name: 'Numbers', abbreviation: 'Num', testament: 'OT', position: 4 },
      { name: 'Deuteronomy', abbreviation: 'Deut', testament: 'OT', position: 5 },
      { name: 'Joshua', abbreviation: 'Josh', testament: 'OT', position: 6 },
      { name: 'Judges', abbreviation: 'Judg', testament: 'OT', position: 7 },
      { name: 'Ruth', abbreviation: 'Ruth', testament: 'OT', position: 8 },
      { name: '1 Samuel', abbreviation: '1 Sam', testament: 'OT', position: 9 },
      { name: '2 Samuel', abbreviation: '2 Sam', testament: 'OT', position: 10 },
      { name: '1 Kings', abbreviation: '1 Kgs', testament: 'OT', position: 11 },
      { name: '2 Kings', abbreviation: '2 Kgs', testament: 'OT', position: 12 },
      { name: '1 Chronicles', abbreviation: '1 Chr', testament: 'OT', position: 13 },
      { name: '2 Chronicles', abbreviation: '2 Chr', testament: 'OT', position: 14 },
      { name: 'Ezra', abbreviation: 'Ezra', testament: 'OT', position: 15 },
      { name: 'Nehemiah', abbreviation: 'Neh', testament: 'OT', position: 16 },
      { name: 'Esther', abbreviation: 'Esth', testament: 'OT', position: 17 },
      { name: 'Job', abbreviation: 'Job', testament: 'OT', position: 18 },
      { name: 'Psalms', abbreviation: 'Ps', testament: 'OT', position: 19 },
      { name: 'Proverbs', abbreviation: 'Prov', testament: 'OT', position: 20 },
      { name: 'Ecclesiastes', abbreviation: 'Eccl', testament: 'OT', position: 21 },
      { name: 'Song of Solomon', abbreviation: 'Song', testament: 'OT', position: 22 },
      { name: 'Isaiah', abbreviation: 'Isa', testament: 'OT', position: 23 },
      { name: 'Jeremiah', abbreviation: 'Jer', testament: 'OT', position: 24 },
      { name: 'Lamentations', abbreviation: 'Lam', testament: 'OT', position: 25 },
      { name: 'Ezekiel', abbreviation: 'Ezek', testament: 'OT', position: 26 },
      { name: 'Daniel', abbreviation: 'Dan', testament: 'OT', position: 27 },
      { name: 'Hosea', abbreviation: 'Hos', testament: 'OT', position: 28 },
      { name: 'Joel', abbreviation: 'Joel', testament: 'OT', position: 29 },
      { name: 'Amos', abbreviation: 'Amos', testament: 'OT', position: 30 },
      { name: 'Obadiah', abbreviation: 'Obad', testament: 'OT', position: 31 },
      { name: 'Jonah', abbreviation: 'Jonah', testament: 'OT', position: 32 },
      { name: 'Micah', abbreviation: 'Mic', testament: 'OT', position: 33 },
      { name: 'Nahum', abbreviation: 'Nah', testament: 'OT', position: 34 },
      { name: 'Habakkuk', abbreviation: 'Hab', testament: 'OT', position: 35 },
      { name: 'Zephaniah', abbreviation: 'Zeph', testament: 'OT', position: 36 },
      { name: 'Haggai', abbreviation: 'Hag', testament: 'OT', position: 37 },
      { name: 'Zechariah', abbreviation: 'Zech', testament: 'OT', position: 38 },
      { name: 'Malachi', abbreviation: 'Mal', testament: 'OT', position: 39 },
      // New Testament
      { name: 'Matthew', abbreviation: 'Matt', testament: 'NT', position: 40 },
      { name: 'Mark', abbreviation: 'Mark', testament: 'NT', position: 41 },
      { name: 'Luke', abbreviation: 'Luke', testament: 'NT', position: 42 },
      { name: 'John', abbreviation: 'John', testament: 'NT', position: 43 },
      { name: 'Acts', abbreviation: 'Acts', testament: 'NT', position: 44 },
      { name: 'Romans', abbreviation: 'Rom', testament: 'NT', position: 45 },
      { name: '1 Corinthians', abbreviation: '1 Cor', testament: 'NT', position: 46 },
      { name: '2 Corinthians', abbreviation: '2 Cor', testament: 'NT', position: 47 },
      { name: 'Galatians', abbreviation: 'Gal', testament: 'NT', position: 48 },
      { name: 'Ephesians', abbreviation: 'Eph', testament: 'NT', position: 49 },
      { name: 'Philippians', abbreviation: 'Phil', testament: 'NT', position: 50 },
      { name: 'Colossians', abbreviation: 'Col', testament: 'NT', position: 51 },
      { name: '1 Thessalonians', abbreviation: '1 Thess', testament: 'NT', position: 52 },
      { name: '2 Thessalonians', abbreviation: '2 Thess', testament: 'NT', position: 53 },
      { name: '1 Timothy', abbreviation: '1 Tim', testament: 'NT', position: 54 },
      { name: '2 Timothy', abbreviation: '2 Tim', testament: 'NT', position: 55 },
      { name: 'Titus', abbreviation: 'Titus', testament: 'NT', position: 56 },
      { name: 'Philemon', abbreviation: 'Phlm', testament: 'NT', position: 57 },
      { name: 'Hebrews', abbreviation: 'Heb', testament: 'NT', position: 58 },
      { name: 'James', abbreviation: 'Jas', testament: 'NT', position: 59 },
      { name: '1 Peter', abbreviation: '1 Pet', testament: 'NT', position: 60 },
      { name: '2 Peter', abbreviation: '2 Pet', testament: 'NT', position: 61 },
      { name: '1 John', abbreviation: '1 John', testament: 'NT', position: 62 },
      { name: '2 John', abbreviation: '2 John', testament: 'NT', position: 63 },
      { name: '3 John', abbreviation: '3 John', testament: 'NT', position: 64 },
      { name: 'Jude', abbreviation: 'Jude', testament: 'NT', position: 65 },
      { name: 'Revelation', abbreviation: 'Rev', testament: 'NT', position: 66 },
    ]
  }

  getTranslations(): Translation[] {
    return this.db.prepare('SELECT * FROM translations').all() as Translation[]
  }

  getBooks(translationId: number): Book[] {
    return this.db
      .prepare('SELECT * FROM books WHERE translation_id = ? ORDER BY position')
      .all(translationId) as Book[]
  }

  resolveBookName(name: string, translationId: number): Book | null {
    // Try exact match first
    let book = this.db
      .prepare('SELECT * FROM books WHERE translation_id = ? AND LOWER(name) = LOWER(?)')
      .get(translationId, name) as Book | undefined

    if (book) return book

    // Try alias match
    const alias = this.db
      .prepare(`
        SELECT b.* FROM books b
        JOIN book_aliases ba ON ba.book_id = b.id
        WHERE b.translation_id = ? AND LOWER(ba.alias) = LOWER(?)
      `)
      .get(translationId, name) as Book | undefined

    return alias || null
  }

  getPassage(ref: ScriptureReference): ScripturePassage | null {
    // Get translation
    const translation = this.db
      .prepare('SELECT * FROM translations WHERE code = ?')
      .get(ref.translation) as Translation | undefined

    if (!translation) return null

    // Resolve book name
    const book = this.resolveBookName(ref.book, translation.id)
    if (!book) return null

    // Get verses
    let verses: Verse[]
    if (ref.verseStart && ref.verseEnd) {
      verses = this.db
        .prepare(`
          SELECT * FROM verses
          WHERE book_id = ? AND chapter = ? AND verse >= ? AND verse <= ?
          ORDER BY verse
        `)
        .all(book.id, ref.chapter, ref.verseStart, ref.verseEnd) as Verse[]
    } else if (ref.verseStart) {
      verses = this.db
        .prepare('SELECT * FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?')
        .all(book.id, ref.chapter, ref.verseStart) as Verse[]
    } else {
      // Entire chapter
      verses = this.db
        .prepare('SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse')
        .all(book.id, ref.chapter) as Verse[]
    }

    if (verses.length === 0) return null

    // Build display reference
    let displayReference = `${book.name} ${ref.chapter}`
    if (ref.verseStart) {
      displayReference += `:${ref.verseStart}`
      if (ref.verseEnd && ref.verseEnd !== ref.verseStart) {
        displayReference += `-${ref.verseEnd}`
      }
    }

    // Build text
    const text = verses.map((v) => v.text).join(' ')

    return {
      reference: { ...ref, book: book.name },
      displayReference,
      text,
      verses,
    }
  }

  searchScripture(query: string, limit: number = 20): ScripturePassage[] {
    // Handle empty/whitespace-only input
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return []
    }

    // First try to parse as a reference
    const refMatch = this.parseReference(trimmedQuery)
    if (refMatch) {
      const passage = this.getPassage(refMatch)
      if (passage) return [passage]
    }

    // Sanitize query for FTS5 by wrapping in double quotes (phrase search)
    // and escaping any embedded double quotes
    const sanitizedQuery = '"' + trimmedQuery.replace(/"/g, '""') + '"'

    // Fall back to full-text search
    const results = this.db
      .prepare(`
        SELECT v.*, b.name as book_name, t.code as translation_code
        FROM verses_fts fts
        JOIN verses v ON v.id = fts.rowid
        JOIN books b ON b.id = v.book_id
        JOIN translations t ON t.id = b.translation_id
        WHERE verses_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `)
      .all(sanitizedQuery, limit) as Array<Verse & { book_name: string; translation_code: string }>

    return results.map((row) => ({
      reference: {
        book: row.book_name,
        chapter: row.chapter,
        verseStart: row.verse,
        translation: row.translation_code,
      },
      displayReference: `${row.book_name} ${row.chapter}:${row.verse}`,
      text: row.text,
      verses: [row],
    }))
  }

  parseReference(input: string): ScriptureReference | null {
    // Normalize input
    const normalized = input.trim().toLowerCase()

    // Pattern: Book Chapter:Verse-Verse or Book Chapter:Verse or Book Chapter
    const patterns = [
      // "John 3:16-17" or "1 Corinthians 13:1-13"
      /^(\d?\s*[a-z]+(?:\s+[a-z]+)*)\s+(\d+):(\d+)-(\d+)$/i,
      // "John 3:16" or "1 Corinthians 13:1"
      /^(\d?\s*[a-z]+(?:\s+[a-z]+)*)\s+(\d+):(\d+)$/i,
      // "John 3" or "1 Corinthians 13"
      /^(\d?\s*[a-z]+(?:\s+[a-z]+)*)\s+(\d+)$/i,
    ]

    for (const pattern of patterns) {
      const match = normalized.match(pattern)
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
    }

    return null
  }

  close(): void {
    this.db.close()
  }
}

import React, { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import type { ScripturePassage, Book } from '../../shared/types'

export default function Scripture() {
  const { selectedTranslation, stageContent, showContent } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<ScripturePassage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [books, setBooks] = useState<Book[]>([])

  // Load books when translation changes
  useEffect(() => {
    const loadBooks = async () => {
      try {
        // Get all translations to find the ID for the selected translation code
        const translations = await window.electronAPI?.getTranslations()
        const translationList = (translations as { id: number; code: string }[]) || []
        const translation = translationList.find((t) => t.code === selectedTranslation)
        const translationId = translation?.id ?? 1 // Fall back to ID 1 if not found

        const result = await window.electronAPI?.getBooks(translationId)
        setBooks((result as Book[]) || [])
      } catch (error) {
        console.error('Failed to load books:', error)
      }
    }
    loadBooks()
  }, [selectedTranslation])

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setIsLoading(true)
      try {
        const searchResults = await window.electronAPI?.searchScripture(searchQuery)
        setResults((searchResults as ScripturePassage[]) || [])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleProject = (passage: ScripturePassage) => {
    stageContent(passage)
    showContent()
  }

  // Group books by testament
  const oldTestament = books.filter((b) => b.testament === 'OT')
  const newTestament = books.filter((b) => b.testament === 'NT')

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Book Browser */}
      <div className="w-[280px] bg-background-dark border-r border-border-dark p-4 flex flex-col overflow-hidden">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-2 mb-3">
          Bible Books
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Old Testament */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary px-2 mb-2">Old Testament</h4>
            <div className="space-y-0.5">
              {oldTestament.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedBook === book.name
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface-dark hover:text-white'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>

          {/* New Testament */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary px-2 mb-2">New Testament</h4>
            <div className="space-y-0.5">
              {newTestament.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedBook === book.name
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface-dark hover:text-white'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                {isLoading ? (
                  <span className="material-symbols-outlined text-primary animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-text-secondary">search</span>
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference (e.g., John 3:16) or text..."
                className="w-full h-14 pl-12 pr-4 bg-surface-dark border border-border-dark rounded-xl text-white placeholder-text-secondary text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-4">
                {results.length} Results for "{searchQuery}"
              </h2>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-surface-dark rounded-xl border border-border-dark p-5 hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
                        {result.displayReference}
                      </span>
                      <span className="text-xs text-text-secondary bg-background-dark px-2 py-1 rounded">
                        {selectedTranslation}
                      </span>
                    </div>
                    <p className="text-white leading-relaxed mb-4">{result.text}</p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => stageContent(result)}
                        className="px-4 py-2 rounded-lg bg-background-dark border border-border-dark text-white text-sm font-medium hover:border-primary transition-colors"
                      >
                        Stage
                      </button>
                      <button
                        onClick={() => handleProject(result)}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Project Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Verses */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Popular Verses</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { ref: 'John 3:16', text: 'For God so loved the world...' },
                  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd...' },
                  { ref: 'Romans 8:28', text: 'And we know that all things...' },
                  { ref: 'Philippians 4:13', text: 'I can do all things...' },
                  { ref: 'Jeremiah 29:11', text: 'For I know the plans...' },
                  { ref: 'Proverbs 3:5', text: 'Trust in the Lord...' },
                ].map((verse, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(verse.ref)}
                    className="text-left p-4 bg-surface-dark rounded-xl border border-border-dark hover:border-primary/50 transition-colors"
                  >
                    <span className="text-primary font-bold text-sm">{verse.ref}</span>
                    <p className="text-text-secondary text-sm mt-1">{verse.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

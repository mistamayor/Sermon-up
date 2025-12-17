import React, { useState, useEffect, useRef } from 'react'
import type { ScripturePassage } from '../../shared/types'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSelect?: (passage: ScripturePassage) => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search scripture...',
  onSelect,
}: SearchBarProps) {
  const [results, setResults] = useState<ScripturePassage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (value.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const searchResults = await window.electronAPI?.searchScripture(value)
        setResults((searchResults as ScripturePassage[]) || [])
        setIsOpen(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value])

  const handleSelect = (passage: ScripturePassage) => {
    onSelect?.(passage)
    setIsOpen(false)
    onChange('')
  }

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {isLoading ? (
          <span className="material-symbols-outlined text-primary text-2xl animate-spin">
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full h-16 pl-14 pr-32 bg-surface-dark border border-border-dark rounded-xl text-white placeholder-text-secondary text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-2 flex items-center gap-2">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-secondary bg-background-dark border border-border-dark rounded">
          ⌘K
        </kbd>
        <button className="h-12 px-6 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          Search
        </button>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex flex-col gap-1 border-b border-border-dark last:border-0"
            >
              <span className="text-primary font-bold text-sm">{result.displayReference}</span>
              <span className="text-white text-sm line-clamp-2">{result.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

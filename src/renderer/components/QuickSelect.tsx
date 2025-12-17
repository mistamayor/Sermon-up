import React, { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import type { ScripturePassage } from '../../shared/types'

interface QuickSelectProps {
  searchQuery: string
}

// Sample quick select items for demo
const defaultItems: ScripturePassage[] = [
  {
    reference: { book: 'Romans', chapter: 15, verse: 13, translation: 'KJV' },
    displayReference: 'Romans 15:13',
    text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
    verses: [],
  },
  {
    reference: { book: 'Hebrews', chapter: 11, verse: 1, translation: 'KJV' },
    displayReference: 'Hebrews 11:1',
    text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    verses: [],
  },
  {
    reference: { book: 'Psalms', chapter: 23, verse: 1, translation: 'KJV' },
    displayReference: 'Psalm 23:1',
    text: 'The Lord is my shepherd; I shall not want.',
    verses: [],
  },
]

export default function QuickSelect({ searchQuery }: QuickSelectProps) {
  const { stageContent, showContent } = useAppStore()
  const [items, setItems] = useState<ScripturePassage[]>(defaultItems)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setItems(defaultItems)
      return
    }

    const searchScripture = async () => {
      setIsSearching(true)
      try {
        const results = await window.electronAPI?.searchScripture(searchQuery)
        if (results && results.length > 0) {
          setItems(results as ScripturePassage[])
        } else {
          setItems(defaultItems)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchScripture, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleProject = (item: ScripturePassage) => {
    stageContent(item)
    showContent()
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 pt-0 gap-3 flex flex-col">
      <h4 className="text-xs font-bold uppercase text-text-secondary tracking-wider mt-2 mb-1 px-1">
        {searchQuery ? 'Search Results' : 'Quick Select'}
      </h4>

      {isSearching ? (
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined text-primary animate-spin">
            progress_activity
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          No results found
        </div>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            className="group p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <h5 className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">
                {item.displayReference}
              </h5>
            </div>
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {item.text}
            </p>
            <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300 mt-0 group-hover:mt-2">
              <button
                onClick={() => handleProject(item)}
                className="w-full py-1.5 text-xs font-bold text-white bg-primary hover:bg-blue-600 rounded transition-colors"
              >
                Project
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

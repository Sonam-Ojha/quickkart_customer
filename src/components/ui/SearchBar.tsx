import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

const hints = [
  'Search "milk"',
  'Search "eggs"',
  'Search "bread"',
  'Search "tomato"',
  'Search "butter"',
  'Search "onion"',
]

interface Props {
  onFocus?: () => void
  placeholder?: string
}

export default function SearchBar({ onFocus, placeholder }: Props) {
  const [hint, setHint] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setHint((h) => (h + 1) % hints.length), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <button
      onClick={onFocus}
      className="w-full flex items-center gap-3 bg-white rounded-btn px-3 h-11 shadow-sm text-left"
    >
      <Search size={17} className="text-muted shrink-0" />
      <span
        key={hint}
        className="font-jakarta text-sm text-muted animate-fade-in transition-all"
      >
        {placeholder ?? hints[hint]}
      </span>
    </button>
  )
}

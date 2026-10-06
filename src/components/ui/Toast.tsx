import { X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export default function Toast() {
  const message = useToastStore((s) => s.message)
  const hide = useToastStore((s) => s.hide)
  if (!message) return null
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-md" role="status">
      <div className="flex items-start gap-3 bg-ink text-white rounded-card shadow-lg px-4 py-3">
        <p className="font-jakarta text-sm flex-1">{message}</p>
        <button onClick={hide} aria-label="Dismiss" className="text-white/70 hover:text-white shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

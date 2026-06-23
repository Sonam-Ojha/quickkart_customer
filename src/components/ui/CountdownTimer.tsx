import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

const EIGHT_HOURS = 8 * 60 * 60

export default function CountdownTimer() {
  const [secs, setSecs] = useState(() => {
    const now = new Date()
    const elapsed = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    return EIGHT_HOURS - (elapsed % EIGHT_HOURS)
  })

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 1 ? EIGHT_HOURS : s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const h  = Math.floor(secs / 3600)
  const m  = Math.floor((secs % 3600) / 60)
  const s  = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 bg-errorBg px-2.5 py-1 rounded-full">
      <Clock size={11} className="text-error" />
      <span className="font-inter font-bold text-error text-xs">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  )
}

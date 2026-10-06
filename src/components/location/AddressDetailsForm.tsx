import { useState } from 'react'
import { Home, Briefcase, MapPin, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { SavedLocation } from '@/store/locationStore'

type AddrType = 'Home' | 'Work' | 'Other'
const TYPES: { key: AddrType; icon: typeof Home }[] = [
  { key: 'Home',  icon: Home },
  { key: 'Work',  icon: Briefcase },
  { key: 'Other', icon: MapPin },
]

interface Props {
  location: SavedLocation
  /** Called with the location to save once the details are filled in. */
  onSaved: (loc: SavedLocation) => void
}

/** Second step of the location picker (same as the app's "Enter address
 *  details" sheet): name, phone, house/flat, area and landmark for the picked
 *  spot. Saved to the customer's account when logged in. */
export default function AddressDetailsForm({ location, onSaved }: Props) {
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [type, setType]         = useState<AddrType>('Home')
  const [name, setName]         = useState(user?.name ?? '')
  const [phone, setPhone]       = useState((user?.phone ?? user?.mobile ?? '').replace(/\D/g, '').slice(-10))
  const [house, setHouse]       = useState('')
  const [area, setArea]         = useState(location.area || location.label || '')
  const [landmark, setLandmark] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const save = async () => {
    if (!name.trim())                     return setError('Please enter your name')
    if (!/^\d{10}$/.test(phone.trim()))   return setError('Please enter a valid 10-digit phone number')
    if (!house.trim())                    return setError('Please enter your house / flat number')
    if (!area.trim())                     return setError('Please enter your area')

    const line1 = `${house.trim()}, ${area.trim()}`
    const line2 = landmark.trim() || undefined
    setSaving(true); setError('')
    try {
      if (token) {
        await api.post('/addresses', {
          label:   type,
          line1,
          line2,
          city:    location.city || location.label,
          pincode: location.pincode || '',
          lat:     location.lat,
          lng:     location.lng,
          phone:   phone.trim(),
        })
      }
      onSaved({
        ...location,
        formattedAddress: [line1, line2].filter(Boolean).join(', '),
      })
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't save the address. Try again.")
      setSaving(false)
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string, opts: { type?: string; inputMode?: 'numeric' } = {}) => (
    <label className="block">
      <span className="font-inter text-xs font-semibold text-textSecondary">{label}</span>
      <input
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        type={opts.type ?? 'text'}
        inputMode={opts.inputMode}
        className="mt-1 w-full h-11 px-3 rounded-btn border border-border bg-white font-jakarta text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primaryOrange"
      />
    </label>
  )

  return (
    <div className="space-y-3">
      {/* Picked spot */}
      <div className="flex items-start gap-2.5 p-3 rounded-card bg-orangeTint/60 border border-orange-100">
        <MapPin size={16} className="text-primaryOrange mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-inter font-bold text-ink text-sm truncate">{location.label}</p>
          {location.area && <p className="font-jakarta text-xs text-textSecondary truncate">{location.area}</p>}
        </div>
      </div>

      {/* Save as */}
      <div>
        <span className="font-inter text-xs font-semibold text-textSecondary">Save as</span>
        <div className="mt-1 flex gap-2">
          {TYPES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`h-9 px-3 rounded-full border flex items-center gap-1.5 font-inter text-xs font-semibold transition-colors ${
                type === key ? 'bg-orangeTint border-primaryOrange text-primaryOrange' : 'border-border text-textSecondary hover:border-muted'
              }`}
            >
              <Icon size={14} /> {key}
            </button>
          ))}
        </div>
      </div>

      {field('Your name', name, setName, 'Full name')}
      {field('Phone number', phone, (v) => setPhone(v.replace(/\D/g, '').slice(0, 10)), '10-digit mobile number', { type: 'tel', inputMode: 'numeric' })}
      {field('House / Flat / Floor no.', house, setHouse, 'e.g. H-12, Floor 3')}
      {field('Area / Sector / Locality', area, setArea, 'e.g. Sector 45, Faridabad')}
      {field('Landmark (optional)', landmark, setLandmark, 'e.g. Near Metro Station')}

      {error && <p className="font-jakarta text-sm text-error bg-errorBg rounded-btn px-3 py-2">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full h-11 bg-primaryOrange hover:bg-orangeDark disabled:opacity-60 text-white rounded-btn font-inter font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        Save &amp; Continue
      </button>
    </div>
  )
}

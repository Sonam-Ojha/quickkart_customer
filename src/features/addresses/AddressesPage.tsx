import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Home, Briefcase, Plus, Trash2, Edit2, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useLoginUi } from '@/store/loginUiStore'

interface Address {
  id: number
  label: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  pincode: string
  phone: string | null
  isDefault: boolean
  lat: number | null
  lng: number | null
}

const LABEL_ICON: Record<string, typeof Home> = {
  Home: Home,
  Work: Briefcase,
}

function labelIcon(label: string) {
  const Icon = LABEL_ICON[label] ?? MapPin
  return <Icon size={16} />
}

interface AddressFormProps {
  initial?: Partial<Address>
  onSave: (data: Partial<Address>) => Promise<void>
  onCancel: () => void
}

function AddressForm({ initial = {}, onSave, onCancel }: AddressFormProps) {
  const [label,    setLabel]    = useState(initial.label    ?? 'Home')
  const [line1,    setLine1]    = useState(initial.line1    ?? '')
  const [line2,    setLine2]    = useState(initial.line2    ?? '')
  const [city,     setCity]     = useState(initial.city     ?? '')
  const [pincode,  setPincode]  = useState(initial.pincode  ?? '')
  const [phone,    setPhone]    = useState(initial.phone    ?? '')
  const [isDefault, setIsDefault] = useState(initial.isDefault ?? false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!line1.trim()) { setError('Enter house/flat/street'); return }
    if (!city.trim())  { setError('Enter city'); return }
    setSaving(true); setError('')
    try {
      await onSave({ label, line1: line1.trim(), line2: line2.trim(), city: city.trim(), pincode: pincode.trim(), phone: phone.trim(), is_default: isDefault } as any)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save address')
    } finally { setSaving(false) }
  }

  const LABELS = ['Home', 'Work', 'Other']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div>
        <p className="text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-2">Type</p>
        <div className="flex gap-2">
          {LABELS.map(l => (
            <button key={l} type="button" onClick={() => setLabel(l)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-inter font-semibold border transition-colors ${label === l ? 'bg-primaryOrange text-white border-primaryOrange' : 'bg-inputFill text-ink border-transparent'}`}>
              {labelIcon(l)} {l}
            </button>
          ))}
        </div>
      </div>

      {/* Line 1 */}
      <div>
        <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">House / Flat / Street *</label>
        <input
          className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
          placeholder="e.g. 12A, Green Park"
          value={line1} onChange={e => setLine1(e.target.value)} />
      </div>

      {/* Line 2 */}
      <div>
        <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">Area / Landmark</label>
        <input
          className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
          placeholder="e.g. Near Metro Station"
          value={line2} onChange={e => setLine2(e.target.value)} />
      </div>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">City *</label>
          <input
            className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
            placeholder="City"
            value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">Pincode</label>
          <input
            className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
            placeholder="000000"
            inputMode="numeric" maxLength={6}
            value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">Phone (optional)</label>
        <input
          className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
          placeholder="10-digit mobile"
          inputMode="tel" maxLength={10}
          value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
      </div>

      {/* Default toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsDefault(v => !v)}
          className={`w-11 h-6 rounded-full transition-colors relative ${isDefault ? 'bg-primaryOrange' : 'bg-inputFill'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isDefault ? 'left-5' : 'left-0.5'}`} />
        </div>
        <span className="font-jakarta text-sm text-ink">Set as default address</span>
      </label>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 h-12 rounded-btn border border-border font-inter font-semibold text-ink text-sm">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 h-12 rounded-btn bg-primaryOrange text-white font-inter font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Save Address
        </button>
      </div>
    </form>
  )
}

export default function AddressesPage() {
  const navigate  = useNavigate()
  const token     = useAuthStore(s => s.token)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState<Address | null>(null)
  const [deleting,  setDeleting]  = useState<number | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) { useLoginUi.getState().open('/addresses'); navigate('/home', { replace: true }); return }
    fetchAddresses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hasHydrated])

  const fetchAddresses = () => {
    setLoading(true)
    api.get('/addresses')
      .then(r => setAddresses(r.data))
      .catch(() => setError('Failed to load addresses'))
      .finally(() => setLoading(false))
  }

  const handleAdd = async (data: Partial<Address>) => {
    const r = await api.post('/addresses', data)
    setAddresses(prev => [r.data, ...prev])
    setShowForm(false)
  }

  const handleEdit = async (data: Partial<Address>) => {
    if (!editing) return
    const r = await api.put(`/addresses/${editing.id}`, data)
    setAddresses(prev => prev.map(a => a.id === editing.id ? r.data : a))
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {}
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-white sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
            <ChevronLeft size={18} className="text-ink" />
          </button>
          <h1 className="flex-1 text-center font-inter font-bold text-ink text-base">Saved Addresses</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="w-9 h-9 rounded-full bg-primaryOrange flex items-center justify-center"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Add / Edit Form */}
          {(showForm || editing) && (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-inter font-bold text-ink text-sm mb-4">
                {editing ? 'Edit Address' : 'Add New Address'}
              </h2>
              <AddressForm
                initial={editing ?? undefined}
                onSave={editing ? handleEdit : handleAdd}
                onCancel={() => { setShowForm(false); setEditing(null) }}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-10">
              <p className="font-jakarta text-muted text-sm">{error}</p>
              <button onClick={fetchAddresses} className="mt-3 h-9 px-5 bg-primaryOrange text-white rounded-btn font-inter font-semibold text-sm">
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && addresses.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-orangeTint rounded-full flex items-center justify-center mb-4">
                <MapPin size={28} className="text-primaryOrange" />
              </div>
              <p className="font-inter font-bold text-ink text-lg mb-1">No saved addresses</p>
              <p className="font-jakarta text-muted text-sm mb-5">Add an address for faster checkout</p>
              <button
                onClick={() => setShowForm(true)}
                className="h-10 px-6 bg-primaryOrange text-white rounded-btn font-inter font-semibold text-sm flex items-center gap-2">
                <Plus size={16} /> Add Address
              </button>
            </div>
          )}

          {/* Address list */}
          {!loading && addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-orange-50 text-primaryOrange' : 'bg-inputFill text-muted'}`}>
                  {labelIcon(addr.label)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter font-bold text-ink text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-primaryOrange text-[10px] font-inter font-semibold">
                        <Star size={9} fill="currentColor" /> Default
                      </span>
                    )}
                  </div>
                  <p className="font-jakarta text-sm text-ink leading-snug">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                  </p>
                  <p className="font-jakarta text-xs text-muted mt-0.5">
                    {[addr.city, addr.pincode].filter(Boolean).join(' – ')}
                  </p>
                  {addr.phone && (
                    <p className="font-jakarta text-xs text-muted mt-0.5">{addr.phone}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setShowForm(false); setEditing(addr) }}
                    className="w-8 h-8 rounded-lg bg-inputFill flex items-center justify-center hover:bg-orange-50 hover:text-primaryOrange transition-colors">
                    <Edit2 size={14} className="text-muted" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleting === addr.id}
                    className="w-8 h-8 rounded-lg bg-inputFill flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                    {deleting === addr.id
                      ? <Loader2 size={14} className="animate-spin text-muted" />
                      : <Trash2 size={14} className="text-muted" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

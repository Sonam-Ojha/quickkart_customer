import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, Mail, Edit3, Check, AlertCircle, Loader2, ShoppingBag, MapPin, LogOut } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Profile {
  id: string
  name: string
  phone: string   // normalized from mobile by backend
  mobile: string  // raw field
  email: string | null
  wallet_balance: number
}

export default function ProfilePage() {
  const navigate   = useNavigate()
  const storeUser  = useAuthStore(s => s.user)
  const storeToken = useAuthStore(s => s.token)
  const setAuth    = useAuthStore(s => s.setAuth)
  const logout     = useAuthStore(s => s.logout)

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!storeToken) { navigate('/login?redirect=/profile'); return }
    api.get('/profile').then(({ data }) => {
      setProfile(data)
      setName(data.name ?? '')
      setEmail(data.email ?? '')
    }).catch(() => {
      setError('Could not load profile')
    }).finally(() => setLoading(false))
  }, [storeToken, navigate])

  const save = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true); setError(''); setSuccess(false)
    try {
      const { data } = await api.put('/profile', { name: name.trim(), email: email.trim() || null })
      setProfile(p => p ? { ...p, name: data.name, email: data.email } : p)
      // Update authStore so Navbar reflects the new name
      if (storeUser && storeToken)
        setAuth({ ...storeUser, name: data.name, email: data.email }, storeToken)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/home') }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primaryOrange" />
      </div>
    )
  }

  const initial = (profile?.name ?? storeUser?.name ?? 'U')[0].toUpperCase()

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primaryOrange to-deepTeal flex items-center justify-center text-white font-inter font-black text-3xl mb-3 shadow-md">
          {initial}
        </div>
        <h1 className="font-inter font-bold text-ink text-2xl">{profile?.name}</h1>
        <p className="font-jakarta text-sm text-muted mt-1">+91 {profile?.phone || profile?.mobile || '—'}</p>
        {profile?.wallet_balance != null && profile.wallet_balance > 0 && (
          <span className="mt-2 px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full font-inter font-semibold text-sm">
            Wallet: ₹{profile.wallet_balance}
          </span>
        )}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-inter font-bold text-ink text-base">Personal Info</h2>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setSuccess(false); setError('') }}
              className="flex items-center gap-1.5 text-sm font-inter font-semibold text-primaryOrange hover:underline"
            >
              <Edit3 size={14} /> Edit
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-4">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 mb-4">
            <Check size={14} className="shrink-0" /> Profile updated successfully
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-1.5">
              <User size={12} /> Full Name
            </label>
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-11 bg-inputFill border border-border rounded-xl px-4 font-jakarta text-sm text-ink outline-none focus:border-primaryOrange focus:bg-white transition-all"
                autoFocus
              />
            ) : (
              <p className="font-jakarta text-ink text-sm py-2.5 px-4 bg-inputFill rounded-xl">{profile?.name}</p>
            )}
          </div>

          {/* Mobile (read-only) */}
          <div>
            <label className="flex items-center gap-1.5 font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-1.5">
              <Phone size={12} /> Mobile Number
            </label>
            <p className="font-jakarta text-ink text-sm py-2.5 px-4 bg-inputFill rounded-xl flex items-center justify-between">
              +91 {profile?.phone || profile?.mobile || '—'}
              <span className="text-xs text-muted font-jakarta">Cannot change</span>
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 font-inter font-semibold text-xs text-muted uppercase tracking-wide mb-1.5">
              <Mail size={12} /> Email (optional)
            </label>
            {editing ? (
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 bg-inputFill border border-border rounded-xl px-4 font-jakarta text-sm text-ink outline-none focus:border-primaryOrange focus:bg-white transition-all"
              />
            ) : (
              <p className="font-jakarta text-sm py-2.5 px-4 bg-inputFill rounded-xl text-ink">
                {profile?.email || <span className="text-muted">Not added</span>}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setEditing(false); setName(profile?.name ?? ''); setEmail(profile?.email ?? ''); setError('') }}
              className="flex-1 h-11 border border-border rounded-xl font-inter font-semibold text-sm text-ink hover:bg-inputFill transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 h-11 bg-primaryOrange hover:bg-orangeDark text-white rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save</>}
            </button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
        {[
          { icon: ShoppingBag, label: 'My Orders',        to: '/orders'    },
          { icon: MapPin,      label: 'Saved Addresses',  to: '/addresses' },
        ].map(({ icon: Icon, label, to }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-inputFill transition-colors border-b border-border last:border-0"
          >
            <div className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
              <Icon size={16} className="text-ink" />
            </div>
            <span className="flex-1 font-jakarta text-sm text-ink">{label}</span>
            <span className="text-muted text-lg">›</span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 h-11 border border-red-200 text-red-500 font-inter font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  )
}

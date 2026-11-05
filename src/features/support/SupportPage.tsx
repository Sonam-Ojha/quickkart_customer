import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, MessageCircle, Send, Loader2, Plus, Phone, Mail, ChevronRight } from 'lucide-react'
import { supportApi, SupportTicket, SupportMessage } from './supportApi'
import { useAuthStore } from '@/store/authStore'
import { useLoginUi } from '@/store/loginUiStore'

const CATEGORIES = [
  { value: 'delivery', label: 'Delivery Issue' },
  { value: 'payment',  label: 'Payment Issue' },
  { value: 'product',  label: 'Product Issue' },
  { value: 'account',  label: 'Account Issue' },
  { value: 'other',    label: 'Other' },
]

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: 'text-orange-600 bg-orange-50' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 bg-blue-50' },
  resolved:    { label: 'Resolved',    color: 'text-green-600 bg-green-50' },
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── New Request Form ───────────────────────────────────────
function NewRequestForm({ onCreated }: { onCreated: (t: SupportTicket) => void }) {
  const navigate = useNavigate()
  const [subject,  setSubject]  = useState('')
  const [category, setCategory] = useState('other')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Please write a message'); return }
    setLoading(true); setError('')
    try {
      const ticket = await supportApi.create({ subject: subject.trim() || undefined, category, message })
      onCreated(ticket)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to submit. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <h1 className="flex-1 text-center font-inter font-bold text-ink text-base">New Request</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="px-4 py-1.5 bg-primaryOrange text-white rounded-full font-inter font-semibold text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Send'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{error}</div>}

        {/* Subject */}
        <div>
          <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">Subject</label>
          <div className="flex items-center gap-2 bg-inputFill rounded-xl px-4 py-3">
            <span className="text-muted text-base">?</span>
            <input
              className="flex-1 bg-transparent outline-none font-jakarta text-sm text-ink placeholder:text-muted"
              placeholder="e.g. My order is late"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={120}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-1.5">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink outline-none"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-inter font-semibold text-muted uppercase tracking-wide">Message</label>
            <span className="text-xs text-muted">{message.length}/5000</span>
          </div>
          <textarea
            className="w-full bg-inputFill rounded-xl px-4 py-3 font-jakarta text-sm text-ink placeholder:text-muted outline-none resize-none min-h-[140px]"
            placeholder="What happened, and what did you expect? Steps to repeat it help us fix it faster."
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={5000}
          />
        </div>
      </div>
    </div>
  )
}

// ── Chat Thread ────────────────────────────────────────────
function ChatThread({ ticket: init, onBack }: { ticket: SupportTicket; onBack: () => void }) {
  const [ticket,   setTicket]  = useState(init)
  const [messages, setMessages] = useState<SupportMessage[]>(init.messages ?? [])
  const [text,     setText]    = useState('')
  const [sending,  setSending] = useState(false)
  const [loading,  setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supportApi.get(init.id).then(t => {
      setTicket(t)
      setMessages(t.messages ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [init.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const msg = await supportApi.sendMessage(ticket.id, text.trim())
      setMessages(prev => [...prev, msg])
      setText('')
    } catch {}
    finally { setSending(false) }
  }

  const st = STATUS_META[ticket.status]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-inter font-bold text-ink text-sm truncate">{ticket.subject || `Ticket #${ticket.id}`}</p>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <p className="text-center text-xs text-muted">{st.label} · started {formatTime(ticket.created_at)}</p>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${m.senderType === 'user' ? 'bg-primaryOrange text-white rounded-tr-sm' : 'bg-inputFill text-ink rounded-tl-sm'}`}>
              <p className="font-jakarta text-sm leading-relaxed">{m.message}</p>
              <p className={`text-[10px] mt-1 ${m.senderType === 'user' ? 'text-orange-200' : 'text-muted'}`}>{formatTime(m.createdAt ?? (m as any).created_at)}</p>
            </div>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <p className="text-center text-xs text-muted py-6">We have your message and will reply here.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar */}
      {ticket.status !== 'resolved' ? (
        <div className="px-4 py-3 border-t border-border shrink-0 flex items-center gap-2">
          <input
            className="flex-1 bg-inputFill rounded-full px-4 py-2.5 font-jakarta text-sm text-ink placeholder:text-muted outline-none"
            placeholder="Write a reply..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-full bg-primaryOrange flex items-center justify-center disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border shrink-0 text-center text-xs text-muted">
          This ticket is resolved.
        </div>
      )}
    </div>
  )
}

// ── Help Landing ───────────────────────────────────────────
const FAQS = [
  { q: 'Where is my order?',           a: 'You can track your order in My Orders section. Each order shows real-time delivery status.' },
  { q: 'How do I get a refund?',        a: 'Refunds are initiated within 24 hours of cancellation and credited to your wallet within 2–3 business days.' },
  { q: 'Can I change my delivery address?', a: 'You can change the address before the order is confirmed. Once confirmed, please contact support.' },
  { q: 'What are the delivery charges?', a: 'Delivery charges depend on your order total. Orders above the minimum threshold get free delivery.' },
]

function HelpLanding({ onNewRequest, onViewTickets }: { onNewRequest: () => void; onViewTickets: () => void }) {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <h1 className="flex-1 text-center font-inter font-bold text-ink text-base">Help & Support</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Contact us */}
        <div>
          <p className="text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-2">Contact us</p>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            <button
              onClick={onNewRequest}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-inputFill transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <MessageCircle size={18} className="text-deepTeal" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-inter font-semibold text-ink text-sm">Chat with us</p>
                <p className="text-xs text-muted">Typically replies in a few minutes</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <a href="tel:1800-123-4567" className="w-full flex items-center gap-3 px-4 py-4 hover:bg-inputFill transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Phone size={18} className="text-deepTeal" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-inter font-semibold text-ink text-sm">Call support</p>
                <p className="text-xs text-muted">1800-123-4567 · 8am–11pm</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </a>

            <a href="mailto:help@jhatpats.app" className="w-full flex items-center gap-3 px-4 py-4 hover:bg-inputFill transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Mail size={18} className="text-deepTeal" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-inter font-semibold text-ink text-sm">Email us</p>
                <p className="text-xs text-muted">help@jhatpats.app</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </a>
          </div>
        </div>

        {/* My tickets */}
        <button
          onClick={onViewTickets}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-border hover:bg-inputFill transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <MessageCircle size={18} className="text-primaryOrange" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-inter font-semibold text-ink text-sm">My support requests</p>
            <p className="text-xs text-muted">View your previous conversations</p>
          </div>
          <ChevronRight size={16} className="text-muted" />
        </button>

        {/* FAQs */}
        <div>
          <p className="text-xs font-inter font-semibold text-muted uppercase tracking-wide mb-2">Frequently asked</p>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            {FAQS.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left"
                >
                  <span className="font-jakarta text-sm text-ink font-medium pr-4">{f.q}</span>
                  <ChevronRight size={16} className={`text-muted shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-sm text-muted font-jakarta leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ticket List ────────────────────────────────────────────
function TicketList({ onBack, onSelect, onNew }: { onBack: () => void; onSelect: (t: SupportTicket) => void; onNew: () => void }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supportApi.list().then(setTickets).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-inputFill flex items-center justify-center">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <h1 className="flex-1 text-center font-inter font-bold text-ink text-base">My Requests</h1>
        <button onClick={onNew} className="w-9 h-9 rounded-full bg-primaryOrange flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={40} className="mx-auto text-muted mb-3" />
            <p className="font-inter font-semibold text-ink text-sm">No requests yet</p>
            <p className="text-xs text-muted mt-1">Tap + to start a new conversation</p>
          </div>
        ) : tickets.map(t => {
          const st = STATUS_META[t.status]
          return (
            <button key={t.id} onClick={() => onSelect(t)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-border hover:bg-inputFill transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-inputFill flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter font-semibold text-ink text-sm truncate">{t.subject || `Ticket #${t.id}`}</p>
                <p className="text-xs text-muted capitalize">{t.category} · {formatTime(t.created_at)}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────
type View = 'help' | 'new' | 'list' | 'chat'

export default function SupportPage() {
  const token       = useAuthStore(s => s.token)
  const hasHydrated = useAuthStore(s => s._hasHydrated)
  const navigate    = useNavigate()
  const [searchParams] = useSearchParams()

  const [view,           setView]           = useState<View>('help')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) { useLoginUi.getState().open('/support'); navigate('/home', { replace: true }) }
  }, [token, hasHydrated, navigate])

  useEffect(() => {
    if (searchParams.get('new') === '1') setView('new')
  }, [searchParams])

  const handleCreated = (ticket: SupportTicket) => {
    setSelectedTicket({ ...ticket, messages: [] })
    setView('chat')
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {view === 'help' && (
          <HelpLanding
            onNewRequest={() => setView('new')}
            onViewTickets={() => setView('list')}
          />
        )}
        {view === 'new' && (
          <NewRequestForm onCreated={handleCreated} />
        )}
        {view === 'list' && (
          <TicketList
            onBack={() => setView('help')}
            onNew={() => setView('new')}
            onSelect={t => { setSelectedTicket(t); setView('chat') }}
          />
        )}
        {view === 'chat' && selectedTicket && (
          <ChatThread
            ticket={selectedTicket}
            onBack={() => setView('list')}
          />
        )}
      </div>
    </div>
  )
}

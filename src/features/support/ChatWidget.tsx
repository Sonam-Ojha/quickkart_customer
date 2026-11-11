import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react'
import { supportApi, SupportTicket, SupportMessage } from './supportApi'
import { useAuthStore } from '@/store/authStore'
import { useLoginUi } from '@/store/loginUiStore'

const QUICK_MSGS = [
  'I have an issue with my order',
  'Payment not processed correctly',
  'I want to cancel my order',
  'Product quality issue',
  'Need help with my account',
]

const BOT_WELCOME: SupportMessage = {
  id: 0,
  ticketId: 0,
  senderType: 'admin',
  message: 'Hi! 👋 Welcome to Jhatpats Support. How can we help you today? You can pick a quick option below or type your issue.',
  createdAt: new Date().toISOString(),
}

export default function ChatWidget() {
  const token       = useAuthStore(s => s.token)
  const [open, setOpen]           = useState(false)
  const [ticket, setTicket]       = useState<SupportTicket | null>(null)
  const [messages, setMessages]   = useState<SupportMessage[]>([BOT_WELCOME])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [creating, setCreating]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    if (!token) { useLoginUi.getState().open(); return }

    const userMsg: SupportMessage = {
      id: Date.now(),
      ticketId: ticket?.id ?? 0,
      senderType: 'user',
      message: text.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      if (!ticket) {
        // Create ticket with first message
        setCreating(true)
        const t = await supportApi.create({ message: text.trim(), category: 'other' })
        setTicket(t)
        setCreating(false)
        // Auto admin ack message
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          ticketId: t.id,
          senderType: 'admin',
          message: `Thanks for reaching out! Your ticket #${t.id} has been created. Our team will respond shortly. ⏱️`,
          createdAt: new Date().toISOString(),
        }])
      } else {
        await supportApi.sendMessage(ticket.id, text.trim())
        // Refresh messages
        const updated = await supportApi.get(ticket.id)
        setMessages([BOT_WELCOME, ...(updated.messages ?? [])])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        ticketId: 0,
        senderType: 'admin',
        message: 'Sorry, something went wrong. Please try again.',
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primaryOrange text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all"
        aria-label="Chat with us"
      >
        {open
          ? <ChevronDown size={22} />
          : <>
              <MessageCircle size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </>
        }
      </button>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
             style={{ height: 460 }}>

          {/* Header */}
          <div className="bg-primaryOrange px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-inter font-bold text-white text-sm">Jhatpats Support</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-300 rounded-full" />
                <p className="font-jakarta text-white/80 text-xs">Online · Replies quickly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm font-jakarta leading-relaxed
                  ${msg.senderType === 'user'
                    ? 'bg-primaryOrange text-white rounded-br-sm'
                    : 'bg-inputFill text-ink rounded-bl-sm'
                  }`}>
                  {msg.message}
                </div>
              </div>
            ))}

            {/* Quick replies — only before first user message */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                {QUICK_MSGS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-primaryOrange/30 text-primaryOrange font-jakarta text-xs hover:bg-orangeTint transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {(sending || creating) && (
              <div className="flex justify-start">
                <div className="bg-inputFill px-4 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Type your message…"
              className="flex-1 h-9 bg-inputFill rounded-full px-4 font-jakarta text-sm text-ink placeholder:text-muted outline-none focus:ring-1 focus:ring-primaryOrange/40"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
              className="w-9 h-9 bg-primaryOrange text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

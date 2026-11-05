import api from '@/lib/api'

export interface SupportTicket {
  id: number
  subject: string | null
  category: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  messages?: SupportMessage[]
}

export interface SupportMessage {
  id: number
  ticketId: number
  senderType: 'user' | 'admin'
  message: string
  createdAt: string
}

export const supportApi = {
  create: (body: { subject?: string; category?: string; message: string; orderId?: number }) =>
    api.post('/support', body).then(r => r.data.ticket as SupportTicket),

  list: () =>
    api.get('/support').then(r => r.data.tickets as SupportTicket[]),

  get: (id: number) =>
    api.get(`/support/${id}`).then(r => r.data.ticket as SupportTicket),

  sendMessage: (id: number, message: string) =>
    api.post(`/support/${id}/messages`, { message }).then(r => r.data.message as SupportMessage),
}

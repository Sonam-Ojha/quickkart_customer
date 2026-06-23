import { useState } from 'react'
import { Upload, Clock, Shield, Zap, X, Plus, Minus, CheckCircle, ChevronRight, FileText } from 'lucide-react'

type PrintColor = 'bw' | 'color'
type PaperSize  = 'A4' | 'A3' | 'Letter'
type Sides      = 'single' | 'double'

interface UploadedFile { name: string; size: string; pages: number }

const BW_RATE = 3, COLOR_RATE = 10, DELIVERY = 25

const faqs = [
  { q: 'How long does delivery take?',     a: 'Documents delivered within 25 minutes of order placement.' },
  { q: 'What file formats are supported?', a: 'PDF, DOC, DOCX, JPG, PNG — up to 20 files per order.' },
  { q: 'Is the first print really free?',  a: 'Yes! First order gets up to 10 B&W pages free.' },
  { q: 'What are the printing costs?',     a: 'B&W: ₹3/page · Color: ₹10/page · Delivery: ₹25 flat.' },
  { q: 'Can I get double-sided prints?',   a: 'Yes! Select "Double-sided" to save paper & cost (40% off).' },
  { q: 'What paper sizes are available?',  a: 'A4, A3, and Letter size for all print jobs.' },
]

export default function PrintPage() {
  const [files,    setFiles]    = useState<UploadedFile[]>([])
  const [color,    setColor]    = useState<PrintColor>('bw')
  const [paper,    setPaper]    = useState<PaperSize>('A4')
  const [sides,    setSides]    = useState<Sides>('single')
  const [copies,   setCopies]   = useState(1)
  const [openFaq,  setOpenFaq]  = useState<number | null>(null)
  const [success,  setSuccess]  = useState(false)

  const totalPages  = files.reduce((a, f) => a + f.pages, 0)
  const rate        = color === 'bw' ? BW_RATE : COLOR_RATE
  const sidesMul    = sides === 'double' ? 0.6 : 1
  const printCost   = Math.ceil(totalPages * rate * sidesMul * copies)
  const grandTotal  = files.length > 0 ? printCost + DELIVERY : 0

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const mapped = picked.map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      pages: 1,
    }))
    setFiles((p) => [...p, ...mapped].slice(0, 20))
  }

  if (success) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-sm mx-auto bg-cardSurface rounded-2xl border border-border p-10 shadow-card">
          <div className="w-20 h-20 bg-successBg rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={44} className="text-success" />
          </div>
          <h2 className="font-inter font-bold text-ink text-2xl mb-2">Print Order Placed!</h2>
          <p className="font-jakarta text-textSecondary mb-5">
            Delivery in <span className="text-primaryOrange font-semibold">25 minutes</span>
          </p>
          <div className="bg-inputFill rounded-xl px-6 py-4 mb-6">
            <p className="font-jakarta text-xs text-textSecondary">Total Paid</p>
            <p className="font-inter font-extrabold text-3xl text-ink mt-1">₹{grandTotal}</p>
          </div>
          <button
            onClick={() => { setFiles([]); setSuccess(false); setCopies(1) }}
            className="w-full h-12 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold hover:bg-orangeDark transition-colors"
          >
            Print More Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primaryOrange to-orangeDark text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-accentYellow/20 border border-accentYellow/40 rounded-full px-3 py-1 mb-4">
              <Clock size={13} className="text-accentYellow" />
              <span className="font-inter font-bold text-accentYellow text-xs">Delivered in 25 minutes</span>
            </div>
            <h1 className="font-inter font-black text-5xl mb-3">QuickPrints</h1>
            <p className="font-jakarta text-lg opacity-80 mb-6">Print anything — delivered to your door</p>
            <label className="inline-flex items-center gap-2 bg-white text-primaryOrange font-inter font-bold px-6 py-3 rounded-btn shadow-cta cursor-pointer hover:bg-orangeTint transition-colors">
              <Upload size={18} />
              Upload & Print
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFiles} />
            </label>
          </div>
          <span className="hidden lg:block text-9xl">🖨️</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: Upload + Config ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* First print FREE */}
            <div className="bg-successBg border border-success/20 rounded-2xl p-5 flex items-center gap-5">
              <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center shrink-0">
                <span className="font-inter font-black text-white text-xl">1st</span>
              </div>
              <div>
                <p className="font-inter font-bold text-ink">First print FREE!</p>
                <p className="font-jakarta text-sm text-textSecondary">Up to 10 B&W pages free on your first order</p>
              </div>
            </div>

            {/* Upload area */}
            <label className="flex flex-col items-center justify-center gap-3 w-full h-40 border-2 border-dashed border-primaryOrange rounded-2xl bg-orangeTint/20 cursor-pointer hover:bg-orangeTint/40 transition-colors">
              <div className="w-14 h-14 bg-primaryOrange rounded-full flex items-center justify-center">
                <Upload size={24} className="text-white" />
              </div>
              <div className="text-center">
                <p className="font-inter font-bold text-primaryOrange">Click to upload documents</p>
                <p className="font-jakarta text-sm text-textSecondary mt-0.5">PDF, DOC, DOCX, JPG, PNG · max 20 files</p>
              </div>
              <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFiles} />
            </label>

            {/* Uploaded files list */}
            {files.length > 0 && (
              <div className="bg-cardSurface rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-inter font-bold text-ink text-sm">Uploaded Files ({files.length})</h3>
                  <label className="text-primaryOrange text-xs font-inter font-semibold cursor-pointer flex items-center gap-1 hover:underline">
                    <Plus size={13} /> Add more
                    <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFiles} />
                  </label>
                </div>
                {files.map((f, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i < files.length - 1 ? 'border-b border-border' : ''}`}>
                    <FileText size={20} className="text-primaryOrange shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-jakarta text-sm text-ink truncate">{f.name}</p>
                      <p className="font-jakarta text-xs text-muted">{f.size}</p>
                    </div>
                    <button onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}>
                      <X size={16} className="text-muted hover:text-error transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Print config */}
            <div className="bg-cardSurface rounded-2xl border border-border p-6 space-y-6">
              <h3 className="font-inter font-bold text-ink text-base">Print Options</h3>

              {/* Color */}
              <div>
                <p className="font-inter font-semibold text-ink text-sm mb-3">Color</p>
                <div className="grid grid-cols-2 gap-3">
                  {([['bw', 'B&W', `₹${BW_RATE}/page`, '🖤'], ['color', 'Color', `₹${COLOR_RATE}/page`, '🌈']] as const).map(([val, label, price, emoji]) => (
                    <button
                      key={val}
                      onClick={() => setColor(val)}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${color === val ? 'border-primaryOrange bg-orangeTint' : 'border-border hover:border-primaryOrange/40'}`}
                    >
                      <p className="text-xl mb-1">{emoji}</p>
                      <p className={`font-inter font-bold text-sm ${color === val ? 'text-primaryOrange' : 'text-ink'}`}>{label}</p>
                      <p className="font-jakarta text-xs text-textSecondary">{price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper + Sides */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-inter font-semibold text-ink text-sm mb-3">Paper Size</p>
                  <div className="flex gap-2">
                    {(['A4', 'A3', 'Letter'] as PaperSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPaper(s)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-inter font-semibold transition-colors ${
                          paper === s ? 'border-primaryOrange bg-orangeTint text-primaryOrange' : 'border-border text-textSecondary hover:border-primaryOrange/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-inter font-semibold text-ink text-sm mb-3">Sides</p>
                  <div className="flex gap-2">
                    {([['single', 'Single'], ['double', 'Double']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setSides(val)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-inter font-semibold transition-colors ${
                          sides === val ? 'border-primaryOrange bg-orangeTint text-primaryOrange' : 'border-border text-textSecondary hover:border-primaryOrange/40'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copies */}
              <div>
                <p className="font-inter font-semibold text-ink text-sm mb-3">Number of Copies</p>
                <div className="flex items-center gap-4 w-40">
                  <button onClick={() => setCopies((c) => Math.max(1, c - 1))} className="w-10 h-10 rounded-btn bg-inputFill flex items-center justify-center">
                    <Minus size={16} className="text-ink" />
                  </button>
                  <span className="font-inter font-bold text-xl text-ink flex-1 text-center">{copies}</span>
                  <button onClick={() => setCopies((c) => c + 1)} className="w-10 h-10 rounded-btn bg-primaryOrange flex items-center justify-center">
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Promise cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: Zap,    label: 'Fast Delivery',    sub: 'In 25 minutes'             },
                { Icon: Shield, label: 'Secure & Private', sub: 'Auto-deleted after print'  },
                { Icon: Clock,  label: 'Available 24/7',   sub: 'Order anytime'             },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="bg-cardSurface rounded-2xl border border-border p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-orangeTint rounded-full flex items-center justify-center">
                    <Icon size={22} className="text-primaryOrange" />
                  </div>
                  <div>
                    <p className="font-inter font-bold text-ink text-sm">{label}</p>
                    <p className="font-jakarta text-xs text-muted mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <section>
              <h2 className="font-inter font-bold text-ink text-xl mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map(({ q, a }, i) => (
                  <div key={i} className="bg-cardSurface rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <span className="font-inter font-semibold text-ink text-sm">{q}</span>
                      <ChevronRight size={16} className={`text-muted transition-transform duration-200 ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4">
                        <p className="font-jakarta text-sm text-textSecondary leading-relaxed">{a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Price summary ── */}
          <div className="space-y-4">
            <div className="bg-cardSurface rounded-2xl border border-border overflow-hidden sticky top-28">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-inter font-bold text-ink">Price Estimate</h3>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Files</span>
                  <span className="font-inter text-ink">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Total pages</span>
                  <span className="font-inter text-ink">{totalPages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Print type</span>
                  <span className="font-inter text-ink">{color === 'bw' ? 'B&W' : 'Color'} · {paper} · {sides === 'single' ? 'Single' : 'Double'}-sided</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Copies</span>
                  <span className="font-inter text-ink">{copies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Print cost</span>
                  <span className="font-inter text-ink">₹{printCost}</span>
                </div>
                {sides === 'double' && (
                  <div className="flex justify-between">
                    <span className="font-jakarta text-textSecondary">Double-sided discount</span>
                    <span className="font-inter text-success">−40%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-jakarta text-textSecondary">Delivery</span>
                  <span className="font-inter text-ink">₹{DELIVERY}</span>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-border flex justify-between">
                <span className="font-inter font-bold text-ink">Total</span>
                <span className="font-inter font-bold text-ink text-lg">₹{grandTotal}</span>
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={() => files.length > 0 && setSuccess(true)}
                  disabled={files.length === 0}
                  className="w-full h-12 bg-primaryOrange text-white rounded-btn shadow-cta font-inter font-bold hover:bg-orangeDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {files.length === 0 ? 'Upload files to continue' : `Order Printout · ₹${grandTotal}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

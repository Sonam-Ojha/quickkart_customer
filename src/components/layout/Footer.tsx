import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { footerLinks } from '@/data/infoPages'

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white mt-16">
      <div className="max-w-screen-2xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/home" className="flex items-center gap-0.5 mb-3">
              <span className="font-inter font-black text-2xl text-primaryOrange">quick</span>
              <span className="font-inter font-black text-2xl text-white">kart</span>
            </Link>
            <p className="font-jakarta text-sm text-white/55 leading-relaxed">
              Groceries, essentials & documents delivered in minutes.
            </p>
            <div className="flex flex-col gap-2.5 mt-5">
              <a href="tel:+911800000000" className="flex items-center gap-2 text-white/55 text-xs font-jakarta hover:text-white transition-colors">
                <Phone size={13} /> 1800-XXX-XXXX (Toll Free)
              </a>
              <a href="mailto:help@quickkart.in" className="flex items-center gap-2 text-white/55 text-xs font-jakarta hover:text-white transition-colors">
                <Mail size={13} /> help@quickkart.in
              </a>
              <span className="flex items-center gap-2 text-white/55 text-xs font-jakarta">
                <MapPin size={13} /> Noida, Uttar Pradesh
              </span>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="font-jakarta text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="font-jakarta text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="font-jakarta text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-jakarta text-xs text-white/35">© 2026 QuickKart Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="font-jakarta text-xs text-white/35">10-minute delivery · 30,000+ products</p>
        </div>
      </div>
    </footer>
  )
}

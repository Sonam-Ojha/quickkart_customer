import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-inter font-black text-2xl text-primaryOrange">quick</span>
              <span className="font-inter font-black text-2xl text-white">kart</span>
            </div>
            <p className="font-jakarta text-sm text-white/60 leading-relaxed">
              Groceries, essentials & documents delivered in minutes.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <a href="tel:+91" className="flex items-center gap-2 text-white/60 text-xs font-jakarta hover:text-white transition-colors">
                <Phone size={13} /> 1800-XXX-XXXX
              </a>
              <a href="mailto:help@quickkart.in" className="flex items-center gap-2 text-white/60 text-xs font-jakarta hover:text-white transition-colors">
                <Mail size={13} /> help@quickkart.in
              </a>
              <span className="flex items-center gap-2 text-white/60 text-xs font-jakarta">
                <MapPin size={13} /> Noida, Uttar Pradesh
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Careers', 'Blog', 'Press'].map((l) => (
                <li key={l}>
                  <Link to="#" className="font-jakarta text-sm text-white/60 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Help</h4>
            <ul className="space-y-2.5">
              {['FAQ', 'Track Order', 'Returns', 'Contact Us', 'Partner with Us'].map((l) => (
                <li key={l}>
                  <Link to="#" className="font-jakarta text-sm text-white/60 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-inter font-bold text-white text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((l) => (
                <li key={l}>
                  <Link to="#" className="font-jakarta text-sm text-white/60 hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-jakarta text-xs text-white/40">© 2026 QuickKart. All rights reserved.</p>
          <p className="font-jakarta text-xs text-white/40">10-minute delivery · 30,000+ products</p>
        </div>
      </div>
    </footer>
  )
}

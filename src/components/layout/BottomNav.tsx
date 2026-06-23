import { NavLink } from 'react-router-dom'
import { Home, Grid2X2, RotateCcw, Leaf, Printer } from 'lucide-react'

const tabs = [
  { to: '/home',      label: 'Home',       Icon: Home },
  { to: '/category',  label: 'Category',   Icon: Grid2X2 },
  { to: '/buy-again', label: 'Buy Again',  Icon: RotateCcw },
  { to: '/fresh',     label: 'Fresh',      Icon: Leaf },
  { to: '/print',     label: 'Print',      Icon: Printer },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white rounded-t-2xl shadow-nav-top z-50">
      <ul className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-1 ${isActive ? 'text-primaryOrange' : 'text-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-colors ${isActive ? 'bg-orangeTint' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </span>
                  <span className={`text-2xs font-inter font-medium leading-none ${isActive ? 'text-primaryOrange' : 'text-muted'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm font-jakarta mb-6 flex-wrap">
      <Link to="/home" className="text-textSecondary hover:text-primaryOrange transition-colors flex items-center gap-1 shrink-0">
        <Home size={13} />
        <span>Home</span>
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-muted shrink-0" />
            {item.href && !isLast ? (
              <Link to={item.href} className="text-textSecondary hover:text-primaryOrange transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-ink font-semibold' : 'text-textSecondary'}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

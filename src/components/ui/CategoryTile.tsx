import { useNavigate } from 'react-router-dom'
import type { Category } from '@/hooks/useCategories'

// Shared grid classes so the home grid and the all-categories page line up
export const CATEGORY_GRID =
  'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-6'

const TILE =
  'w-full max-w-[7rem] aspect-square rounded-2xl overflow-hidden flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-[1.05] bg-orangeTint'
const LABEL =
  'font-inter text-xs sm:text-sm font-semibold text-ink text-center leading-tight line-clamp-2 w-full group-hover:text-primaryOrange transition-colors'

export default function CategoryTile({ cat }: { cat: Category }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(`/category/${cat.id}`)} className="flex flex-col items-center gap-2 group">
      {/* Icon tile */}
      <div className={TILE}>
        {cat.imageUrl ? (
          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
        ) : (
          <span className="text-4xl sm:text-5xl lg:text-6xl leading-none select-none">{cat.icon || '🛒'}</span>
        )}
      </div>
      {/* Name below — compact, two lines */}
      <p className={LABEL}>{cat.name}</p>
    </button>
  )
}

/** Last tile of a capped grid — previews the hidden categories and opens the full list. */
export function ViewAllTile({ hidden }: { hidden: Category[] }) {
  const navigate = useNavigate()
  const previews = hidden.slice(0, 4)
  return (
    <button onClick={() => navigate('/category')} className="flex flex-col items-center gap-2 group">
      <div className={`${TILE} p-2`}>
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {previews.map(c => (
            <div key={c.id} className="rounded-lg bg-white/70 flex items-center justify-center overflow-hidden">
              {c.imageUrl
                ? <img src={c.imageUrl} alt="" className="w-full h-full object-contain p-0.5 mix-blend-multiply" />
                : <span className="text-lg leading-none">{c.icon || '🛒'}</span>}
            </div>
          ))}
        </div>
      </div>
      <p className={`${LABEL} text-primaryOrange`}>
        View all
        <span className="block font-jakarta font-normal text-[11px] text-textSecondary">+{hidden.length} more</span>
      </p>
    </button>
  )
}

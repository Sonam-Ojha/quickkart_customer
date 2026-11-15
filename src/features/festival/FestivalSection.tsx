import { Link } from 'react-router-dom'
import ProductCard from '@/components/ui/ProductCard'
import { useFestivalTheme } from './useFestivalTheme'

/** Festival store at the top of Home: illustrated banner, "Shop by" tiles, festive picks. */
export default function FestivalSection({ rowClass, itemClass }: { rowClass: string; itemClass: string }) {
  const t = useFestivalTheme()
  if (!t?.section?.enabled) return null
  const s = t.section
  const products = s.products ?? []
  const tiles = s.tiles ?? []
  if (!products.length && !tiles.length && !s.bannerImage) return null
  return (
    <section className="relative rounded-3xl overflow-hidden border shadow-sm"
      style={{ background: s.bgColor, borderColor: `${t.accentColor}33` }}>
      {s.bgImage && <img src={s.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="relative">
        {s.bannerImage ? (
          <div className="relative aspect-[1200/420] max-h-[300px] w-full">
            <img src={s.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-y-0 left-0 w-[58%] px-5 sm:px-10 flex flex-col justify-center">
              <span className="self-start text-[10px] sm:text-xs font-inter font-extrabold tracking-widest text-white px-2 py-1 rounded-md"
                style={{ background: t.accentColor }}>FESTIVE STORE</span>
              <h2 className="font-inter font-black text-ink text-xl sm:text-3xl lg:text-4xl leading-tight mt-2">{s.title ?? 'Festival store'}</h2>
              {s.subtitle && <p className="font-jakarta text-textSecondary text-xs sm:text-base mt-1 line-clamp-2">{s.subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6 pt-5">
            <h2 className="font-inter font-extrabold text-ink text-xl">{s.title ?? 'Festival picks'}</h2>
            {s.subtitle && <p className="font-jakarta text-sm text-textSecondary mt-0.5">{s.subtitle}</p>}
          </div>
        )}

        {tiles.length > 0 && (
          <div className="px-4 sm:px-6 pt-5">
            <p className="font-inter text-xs font-extrabold tracking-wide text-textSecondary mb-3">SHOP BY NEED</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
              {tiles.map((tile) => (
                <Link key={tile.label} to={`/search?q=${encodeURIComponent(tile.query || tile.label)}`} className="group text-center">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                    <img src={tile.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-inter text-[11px] sm:text-sm font-bold text-ink leading-tight mt-1.5 line-clamp-2">{tile.label}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="px-4 sm:px-6 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-5 rounded" style={{ background: t.accentColor }} />
              <h3 className="font-inter font-extrabold text-ink text-lg">Festive picks</h3>
            </div>
            <div className={rowClass}>
              {products.map(p => <div key={p.id} className={itemClass}><ProductCard product={p} /></div>)}
            </div>
          </div>
        )}
        <div className="h-5" />
      </div>
    </section>
  )
}

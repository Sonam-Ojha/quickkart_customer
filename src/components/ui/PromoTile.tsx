import { useState } from 'react'

export interface PromoTileData {
  title: string
  sub: string
  cta: string
  emoji: string
  img: string
  /** tailwind gradient stops, e.g. 'from-blue-50 to-indigo-50' */
  gradient: string
  /** subtle ring colour, e.g. 'ring-blue-100' */
  ring: string
  /** CTA / accent text colour, e.g. 'text-blue-700' */
  accent: string
  to: string
}

export default function PromoTile({ tile, onClick }: { tile: PromoTileData; onClick: () => void }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <button
      onClick={onClick}
      className={`group relative isolate flex h-44 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${tile.gradient} p-4 text-left shadow-card ring-1 ${tile.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)]`}
    >
      {/* hero photo — bleeds off the right edge, fades into the card */}
      {imgOk ? (
        <img
          src={tile.img}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 object-cover [mask-image:linear-gradient(to_right,transparent,#000_62%)] transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <span className="pointer-events-none absolute bottom-1 right-3 text-7xl opacity-80">{tile.emoji}</span>
      )}

      {/* frosted emoji chip — brand accent */}
      <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 text-xl shadow-sm ring-1 ring-black/5 backdrop-blur">
        {tile.emoji}
      </span>

      {/* copy */}
      <div className="relative z-10 max-w-[64%]">
        <p className="font-inter text-15 font-bold leading-snug text-ink">{tile.title}</p>
        <p className="mt-0.5 font-jakarta text-xs text-textSecondary">{tile.sub}</p>
        <p className={`mt-2.5 inline-flex items-center gap-1 font-inter text-xs font-bold ${tile.accent}`}>
          {tile.cta}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      </div>
    </button>
  )
}

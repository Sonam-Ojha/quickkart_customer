import { useState, useEffect } from 'react'
import type { Banner } from '@/types/product'

interface Props {
  banners: Banner[]
  desktop?: boolean
}

export default function BannerCarousel({ banners, desktop }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % banners.length), 4000)
    return () => clearInterval(id)
  }, [banners.length])

  return (
    <div className="relative w-full overflow-hidden rounded-card">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className={`relative min-w-full rounded-card overflow-hidden flex-shrink-0 ${desktop ? 'h-64' : 'h-40'}`}
            style={{ background: b.bgColor }}
          >
            <img
              src={b.img}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="font-inter font-bold text-ink text-xl leading-tight">{b.title}</h3>
              {b.subtitle && (
                <p className="font-jakarta text-xs text-textSecondary mt-0.5">{b.subtitle}</p>
              )}
              {b.ctaText && (
                <button className="mt-3 self-start bg-primaryOrange text-white text-xs font-inter font-bold px-4 py-2 rounded-btn">
                  {b.ctaText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 right-3 flex gap-1">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-4 bg-primaryOrange' : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

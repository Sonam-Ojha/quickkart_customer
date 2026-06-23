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
            className={`relative min-w-full rounded-card overflow-hidden flex-shrink-0 ${desktop ? 'h-56 lg:h-64' : 'h-40'}`}
            style={{ background: b.bgColor }}
          >
            {/* Vivid image */}
            <img
              src={b.img}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            {/* Left-to-right color gradient for text readability */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(90deg, ${b.bgColor} 8%, ${b.bgColor}E6 42%, ${b.bgColor}00 78%)` }}
            />
            {/* Text */}
            <div className="relative h-full px-6 sm:px-8 lg:px-12 flex flex-col justify-center max-w-[68%] sm:max-w-[60%]">
              <h3 className="font-inter font-black text-white text-xl sm:text-2xl lg:text-4xl leading-tight drop-shadow-sm">
                {b.title}
              </h3>
              {b.subtitle && (
                <p className="font-jakarta text-white/90 text-xs sm:text-sm lg:text-base mt-1.5 lg:mt-2 leading-snug">
                  {b.subtitle}
                </p>
              )}
              {b.ctaText && (
                <button className="mt-3 lg:mt-5 self-start bg-white text-ink text-xs sm:text-sm font-inter font-bold px-5 py-2.5 rounded-btn shadow-cta hover:bg-orangeTint transition-colors">
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
            className={`h-1.5 rounded-full transition-all duration-300 drop-shadow ${
              i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

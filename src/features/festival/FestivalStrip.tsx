import { lazy, Suspense } from 'react'
import { useFestivalTheme, useLottie } from './useFestivalTheme'

const Lottie = lazy(() => import('lottie-react'))

/** Festive band across the top of the site while a theme is live. */
export default function FestivalStrip() {
  const t = useFestivalTheme()
  const anim = useLottie(t && t.animationMode === 'header' ? t.animationUrl : null)
  if (!t) return null
  const dark = t.headerTextColor === 'dark'
  return (
    <div className="relative overflow-hidden h-11 sm:h-12" style={{ background: t.headerColor }}>
      {t.headerImage && <img src={t.headerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {anim && (
        <div className="absolute inset-0 pointer-events-none">
          <Suspense fallback={null}><Lottie animationData={anim} loop className="w-full h-full" rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }} /></Suspense>
        </div>
      )}
      {t.decorationImage && (
        <img src={t.decorationImage} alt="" className="absolute top-0 inset-x-0 w-full h-full object-cover object-top pointer-events-none" />
      )}
      {t.greeting && (
        <div className="relative h-full flex items-center justify-center px-4">
          <span className={`font-inter font-extrabold text-sm sm:text-base tracking-tight px-3 py-1 rounded-full ${dark ? 'text-ink bg-white/60' : 'text-white bg-black/15'}`}>
            {t.greeting}
          </span>
        </div>
      )}
    </div>
  )
}

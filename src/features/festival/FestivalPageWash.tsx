import { useFestivalTheme } from './useFestivalTheme'

/** Festival colour + faint pattern fading in under the header (behind page content). */
export default function FestivalPageWash() {
  const t = useFestivalTheme()
  if (!t || (!t.pageTint && !t.pageImage)) return null
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-[480px] -z-10 pointer-events-none"
      style={{ background: `linear-gradient(${t.pageTint ?? 'transparent'}, transparent)` }}>
      {t.pageImage && (
        <img src={t.pageImage} alt="" className="w-full h-full object-cover opacity-60 [mask-image:linear-gradient(black,transparent)]" />
      )}
    </div>
  )
}

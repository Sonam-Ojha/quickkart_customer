import { lazy, Suspense, useState } from 'react'
import { useFestivalTheme, useLottie } from './useFestivalTheme'

const Lottie = lazy(() => import('lottie-react'))

/** Full-screen festival animation, played once per browser session. */
export default function FestivalOnceOverlay() {
  const t = useFestivalTheme()
  const key = t ? `qk-festival-played-${t.id}-${t.version}` : ''
  const already = (() => { try { return key ? sessionStorage.getItem(key) === '1' : true } catch { return false } })()
  const anim = useLottie(t && t.animationMode === 'once' && !already ? t.animationUrl : null)
  const [done, setDone] = useState(false)
  if (!t || !anim || done || already) return null
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <Suspense fallback={null}>
        <Lottie
          animationData={anim}
          loop={false}
          className="w-full h-full"
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
          onComplete={() => { try { sessionStorage.setItem(key, '1') } catch { /* ignore */ } setDone(true) }}
        />
      </Suspense>
    </div>
  )
}

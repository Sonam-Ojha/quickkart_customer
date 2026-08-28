import { useState, useCallback, useRef } from 'react'

// ── Configuration ─────────────────────────────────────────────────────────────
// Adjust these thresholds based on your delivery service area granularity.
// 300m is sufficient to identify the correct neighbourhood for delivery.
export const GPS_ACCURACY_GOOD_M      = 300   // Accept immediately
export const GPS_ACCURACY_ACCEPTABLE_M = 800  // Accept after retry attempts
export const GPS_TIMEOUT_MS           = 12000  // Per attempt timeout
export const GPS_MAX_AGE_MS           = 0      // Always get fresh position
export const GPS_WATCH_TIMEOUT_MS     = 10000  // How long to watch for improvement

// ── Types ─────────────────────────────────────────────────────────────────────

export type GpsCoords = {
  lat: number
  lng: number
  accuracy: number
}

export type GpsErrorCode =
  | 'unsupported'    // browser doesn't have geolocation
  | 'denied'         // user blocked permission
  | 'unavailable'    // device GPS unavailable
  | 'timeout'        // timed out
  | 'unknown'

export type GpsStatus =
  | { kind: 'idle' }
  | { kind: 'requesting' }                         // first request in flight
  | { kind: 'improving'; accuracy: number }        // got fix, trying to improve
  | { kind: 'success'; coords: GpsCoords }
  | { kind: 'error'; code: GpsErrorCode; message: string }

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGeoLocation() {
  const [status, setStatus] = useState<GpsStatus>({ kind: 'idle' })
  const watchIdRef    = useRef<number | null>(null)
  const watchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef     = useRef(false)

  const _stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (watchTimerRef.current !== null) {
      clearTimeout(watchTimerRef.current)
      watchTimerRef.current = null
    }
  }, [])

  const _mapError = (err: GeolocationPositionError): { code: GpsErrorCode; message: string } => {
    switch (err.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return {
          code: 'denied',
          message: 'Location access denied. To fix: open browser settings → Site settings → Location → Allow for this site.',
        }
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return {
          code: 'unavailable',
          message: 'GPS signal unavailable. Move to an open area or try searching manually.',
        }
      case GeolocationPositionError.TIMEOUT:
        return {
          code: 'timeout',
          message: 'Location timed out. Make sure GPS is enabled and try again.',
        }
      default:
        return { code: 'unknown', message: 'Could not get location. Try searching manually.' }
    }
  }

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({
        kind: 'error',
        code: 'unsupported',
        message: 'Your browser does not support location. Please search your area manually.',
      })
      return
    }

    _stopWatch()
    activeRef.current = true
    setStatus({ kind: 'requesting' })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!activeRef.current) return

        const coords: GpsCoords = {
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        }

        // Good enough — accept immediately
        if (coords.accuracy <= GPS_ACCURACY_GOOD_M) {
          setStatus({ kind: 'success', coords })
          return
        }

        // Poor accuracy — show warning and try watchPosition to improve
        setStatus({ kind: 'improving', accuracy: coords.accuracy })

        let bestCoords = coords

        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            if (!activeRef.current) { _stopWatch(); return }

            const candidate: GpsCoords = {
              lat:      watchPos.coords.latitude,
              lng:      watchPos.coords.longitude,
              accuracy: Math.round(watchPos.coords.accuracy),
            }

            // Keep best fix seen so far
            if (candidate.accuracy < bestCoords.accuracy) {
              bestCoords = candidate
              setStatus({ kind: 'improving', accuracy: candidate.accuracy })
            }

            // Good enough — stop watching
            if (candidate.accuracy <= GPS_ACCURACY_GOOD_M) {
              _stopWatch()
              setStatus({ kind: 'success', coords: bestCoords })
            }
          },
          (err) => {
            if (!activeRef.current) return
            _stopWatch()
            // If watch fails but we had an initial fix, accept it with a warning
            if (bestCoords.accuracy <= GPS_ACCURACY_ACCEPTABLE_M) {
              setStatus({ kind: 'success', coords: bestCoords })
            } else {
              setStatus({ kind: 'error', ..._mapError(err) })
            }
          },
          { enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS, maximumAge: GPS_MAX_AGE_MS },
        )

        // Hard timeout: stop watching after GPS_WATCH_TIMEOUT_MS
        watchTimerRef.current = setTimeout(() => {
          if (!activeRef.current) return
          _stopWatch()
          // Accept whatever best accuracy we achieved
          if (bestCoords.accuracy <= GPS_ACCURACY_ACCEPTABLE_M) {
            setStatus({ kind: 'success', coords: bestCoords })
          } else {
            setStatus({
              kind: 'error',
              code: 'timeout',
              message: `GPS accuracy is ${bestCoords.accuracy}m — too poor for delivery. Try moving outdoors or search manually.`,
            })
          }
        }, GPS_WATCH_TIMEOUT_MS)
      },
      (err) => {
        if (!activeRef.current) return
        setStatus({ kind: 'error', ..._mapError(err) })
      },
      { enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS, maximumAge: GPS_MAX_AGE_MS },
    )
  }, [_stopWatch])

  const reset = useCallback(() => {
    activeRef.current = false
    _stopWatch()
    setStatus({ kind: 'idle' })
  }, [_stopWatch])

  return { status, request, reset }
}

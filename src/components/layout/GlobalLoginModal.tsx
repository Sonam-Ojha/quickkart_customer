import { useNavigate } from 'react-router-dom'
import LoginOtpModal from '@/components/ui/LoginOtpModal'
import { useLoginUi } from '@/store/loginUiStore'

/** The one login modal for the whole site — opened via `useLoginUi().open()`. */
export default function GlobalLoginModal() {
  const navigate = useNavigate()
  const isOpen   = useLoginUi((s) => s.isOpen)
  const redirect = useLoginUi((s) => s.redirect)
  const close    = useLoginUi((s) => s.close)

  if (!isOpen) return null
  return (
    <LoginOtpModal
      onClose={close}
      onSuccess={() => {
        close()
        if (redirect) navigate(redirect)
      }}
    />
  )
}

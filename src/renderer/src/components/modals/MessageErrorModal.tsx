import { useTranslation } from 'react-i18next'

interface MessageErrorModalProps {
  message: string
  onClose: () => void
}

export default function MessageErrorModal({
  message,
  onClose
}: MessageErrorModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="font-ui fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex min-w-[420px] max-w-[calc(100vw-48px)] flex-col items-center gap-6 rounded-md border border-cyan-900/50 bg-[#050a12] p-10 text-center shadow-[0_0_35px_rgba(0,174,255,0.16)]">
        <h2 className="font-display max-w-sm text-2xl font-semibold leading-8 text-cyan-100/90">
          {message}
        </h2>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="hover-glow mt-8 cursor-pointer text-3xl font-bold text-cyan-500 transition-colors hover:text-cyan-200"
        >
          {t('components.modals.close')}
        </button>
      </div>
    </div>
  )
}

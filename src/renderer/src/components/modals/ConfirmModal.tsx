import { useTranslation } from 'react-i18next'

interface ConfirmModalProps {
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}: ConfirmModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="font-ui fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] max-w-[calc(100vw-48px)] border border-cyan-900/50 bg-[#05080d]/95 shadow-[0_0_35px_rgba(0,174,255,0.16)]">
        <div className="flex flex-col items-center px-8 pb-8 pt-6 text-center">
          <p className="font-display max-w-sm text-2xl font-semibold leading-8 text-cyan-100/90">
            {t('components.modals.confirmAction')}
          </p>

          <div className="mt-12 flex translate-y-2 items-center justify-center gap-12">
            <button
              type="button"
              autoFocus
              onClick={onCancel}
              className="hover-glow text-3xl font-bold text-cyan-500 transition-colors hover:text-cyan-200 cursor-pointer"
            >
              {cancelText ?? t('components.modals.no')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="hover-glow text-3xl font-bold text-cyan-500 transition-colors hover:text-cyan-200 cursor-pointer"
            >
              {confirmText ?? t('components.modals.yes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

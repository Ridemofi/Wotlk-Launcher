import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BackupModalProps {
  backupState: 'confirm' | 'loading'
  onConfirm: () => void
  onCancel: () => void
}

export default function BackupModal({
  backupState,
  onConfirm,
  onCancel
}: BackupModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="font-ui fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-10 min-w-[420px] bg-[#050a12] border border-cyan-900/50 rounded-md shadow-[0_0_35px_rgba(0,174,255,0.16)] text-center">
        {backupState === 'confirm' ? (
          <>
            <h2 className="font-display text-2xl font-semibold leading-8 text-cyan-100/90 max-w-sm">
              {t('components.modals.backupWtf')}
            </h2>
            <div className="mt-8 flex items-center justify-center gap-12">
              <button
                type="button"
                autoFocus
                onClick={onCancel}
                className="hover-glow text-3xl font-bold text-cyan-500 transition-all hover:text-cyan-300 cursor-pointer outline-none focus:outline-none focus:ring-0"
              >
                {t('components.modals.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="hover-glow text-3xl font-bold text-green-500 transition-all hover:text-green-300 cursor-pointer outline-none focus:outline-none focus:ring-0"
              >
                {t('components.modals.save')}
              </button>
            </div>
          </>
        ) : (
          <>
            <Loader2 size={48} className="text-cyan-500 animate-spin mb-2" />
            <h2 className="font-display text-xl text-cyan-400 font-bold">
              {t('components.modals.loading')}
            </h2>
            <p className="text-gray-400">{t('components.modals.backupLoading')}</p>
          </>
        )}
      </div>
    </div>
  )
}

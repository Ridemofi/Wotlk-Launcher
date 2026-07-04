import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DiskUsageSummary } from '../../../../preload/index.d'

interface DiskUsageModalProps {
  isLoading: boolean
  summary: DiskUsageSummary | null
  onClose: () => void
}

export default function DiskUsageModal({
  isLoading,
  summary,
  onClose
}: DiskUsageModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="font-ui fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex min-w-[420px] max-w-[calc(100vw-48px)] flex-col items-center gap-6 rounded-md border border-cyan-900/50 bg-[#050a12] p-10 text-center shadow-[0_0_35px_rgba(0,174,255,0.16)]">
        {isLoading ? (
          <>
            <Loader2 size={48} className="mb-2 animate-spin text-cyan-500" />
            <h2 className="font-display text-xl font-bold text-cyan-400">
              {t('components.modals.calculating')}
            </h2>
            <p className="text-gray-400">{t('components.modals.diskUsageLoading')}</p>
          </>
        ) : (
          <>
            <h2 className="font-display max-w-sm text-2xl font-semibold leading-8 text-cyan-100/90">
              {t('components.modals.diskUsageTitle')}
            </h2>

            <div className="flex w-full min-w-[340px] flex-col gap-2 text-sm">
              {summary?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-10 border-b border-cyan-950/60 py-1.5 text-left last:border-b-0"
                >
                  <span className={item.exists ? 'text-gray-300' : 'text-gray-600'}>
                    {item.label}
                  </span>
                  <span className={item.exists ? 'font-semibold text-cyan-200' : 'text-gray-600'}>
                    {item.formattedSize}
                  </span>
                </div>
              ))}

              <div className="mt-2 flex items-center justify-between gap-10 border-t border-cyan-800/60 pt-3 text-left">
                <span className="font-semibold text-cyan-300">{t('components.modals.total')}</span>
                <span className="font-bold text-cyan-100">{summary?.formattedTotal ?? '0 B'}</span>
              </div>
            </div>

            <button
              type="button"
              autoFocus
              onClick={onClose}
              className="hover-glow mt-2 cursor-pointer text-3xl font-bold text-cyan-500 transition-colors hover:text-cyan-200"
            >
              {t('components.modals.close')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

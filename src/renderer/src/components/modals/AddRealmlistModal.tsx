import type { FormEvent } from 'react'
import { X as XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AddRealmlistModalProps {
  title?: string
  serverName: string
  serverRealmlist: string
  onServerNameChange: (value: string) => void
  onServerRealmlistChange: (value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function AddRealmlistModal({
  title,
  serverName,
  serverRealmlist,
  onServerNameChange,
  onServerRealmlistChange,
  onClose,
  onSubmit
}: AddRealmlistModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="font-ui fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <form
        onSubmit={onSubmit}
        className="w-[520px] max-w-[calc(100vw-48px)] border border-cyan-900/50 bg-[#05080d]/95 shadow-[0_0_35px_rgba(0,174,255,0.16)]"
      >
        <div className="flex items-center justify-between border-b border-cyan-950/80 px-5 py-4">
          <h3 className="font-display text-2xl font-semibold tracking-[0.12em] text-cyan-300">
            {title ?? t('components.modals.newRealmlist')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-600 transition-colors hover:text-cyan-200 cursor-pointer"
          >
            <XIcon size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="server-title"
              className="block text-sm font-semibold uppercase tracking-[0.12em] text-cyan-500"
            >
              {t('components.modals.serverTitle')}
            </label>
            <input
              id="server-title"
              type="text"
              value={serverName}
              onChange={(e) => onServerNameChange(e.target.value)}
              className="h-11 w-full border border-cyan-900/60 bg-[#050a12] px-4 text-sm font-semibold text-cyan-100 outline-none transition-colors placeholder:text-cyan-900/60 focus:border-cyan-400/70"
              placeholder={t('components.modals.serverTitlePlaceholder')}
              spellCheck={false}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="server-realmlist"
              className="block text-sm font-semibold uppercase tracking-[0.12em] text-cyan-500"
            >
              {t('components.modals.realmlist')}
            </label>
            <input
              id="server-realmlist"
              type="text"
              value={serverRealmlist}
              onChange={(e) => onServerRealmlistChange(e.target.value)}
              className="h-11 w-full border border-cyan-900/60 bg-[#050a12] px-4 text-sm font-semibold text-cyan-100 outline-none transition-colors placeholder:text-cyan-900/60 focus:border-cyan-400/70"
              placeholder={t('components.modals.realmlistPlaceholder')}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex justify-end px-5 pb-6">
          <button
            type="submit"
            className="text-sm font-semibold text-cyan-500 transition-colors hover:text-cyan-200 cursor-pointer"
          >
            {t('components.modals.save')}
          </button>
        </div>
      </form>
    </div>
  )
}

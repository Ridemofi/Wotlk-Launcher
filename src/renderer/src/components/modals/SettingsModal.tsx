import { useEffect, useState } from 'react'
import { ChevronDown, X as XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SettingsModalProps {
  onClose: () => void
  onError: (message: string) => void
}

type LanguageCode = 'es' | 'en'

interface EditableSettings {
  language: LanguageCode
  minimizeOnGameOpen: boolean
  cleanCacheOnGameOpen: boolean
}

interface SettingsCheckboxProps {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

function CheckboxIcon(): React.JSX.Element {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="3.5" width="5" height="5" fill="white" />
    </svg>
  )
}

function SettingsCheckbox({ checked, label, onChange }: SettingsCheckboxProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`hover-glow flex cursor-pointer items-start gap-2 border-0 p-2 text-left text-gray-400 transition-colors hover:text-cyan-200 ${checked ? '' : '[&_*]:fill-none'}`}
    >
      <CheckboxIcon />
      <span className="cursor-pointer select-none tracking-wide text-inherit [font-size:_inherit]">
        {label}
      </span>
    </button>
  )
}

function SpainFlag(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6 shrink-0 overflow-hidden rounded-[1px]">
      <rect width="24" height="16" fill="#c60b1e" />
      <rect y="4" width="24" height="8" fill="#ffc400" />
    </svg>
  )
}

function UkFlag(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-6 shrink-0 overflow-hidden rounded-[1px]">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0L24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" />
    </svg>
  )
}

function getLanguageCode(language: string | undefined): LanguageCode {
  return language === 'en' ? 'en' : 'es'
}

export default function SettingsModal({ onClose, onError }: SettingsModalProps): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() =>
    getLanguageCode(i18n.resolvedLanguage)
  )
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false)
  const [minimizeOnGameOpen, setMinimizeOnGameOpen] = useState<boolean>(false)
  const [cleanCacheOnGameOpen, setCleanCacheOnGameOpen] = useState<boolean>(false)
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false)
  const [savedSettings, setSavedSettings] = useState<EditableSettings | null>(null)
  const languageOptions = [
    { value: 'es' as const, label: t('components.settings.spanish'), Flag: SpainFlag },
    { value: 'en' as const, label: t('components.settings.english'), Flag: UkFlag }
  ]
  const activeLanguage = languageOptions.find((option) => option.value === selectedLanguage)
  const hasSettingsChanged =
    savedSettings !== null &&
    (savedSettings.language !== selectedLanguage ||
      savedSettings.minimizeOnGameOpen !== minimizeOnGameOpen ||
      savedSettings.cleanCacheOnGameOpen !== cleanCacheOnGameOpen)

  useEffect(() => {
    let isCancelled = false

    async function loadSettings(): Promise<void> {
      try {
        const settings = await window.api.getLauncherSettings()
        if (isCancelled) return

        const loadedSettings: EditableSettings = {
          language: getLanguageCode(settings.language),
          minimizeOnGameOpen: settings.minimizeOnGameOpen ?? false,
          cleanCacheOnGameOpen: settings.cleanCacheOnGameOpen ?? false
        }

        setMinimizeOnGameOpen(loadedSettings.minimizeOnGameOpen)
        setCleanCacheOnGameOpen(loadedSettings.cleanCacheOnGameOpen)
        setSelectedLanguage(loadedSettings.language)
        setSavedSettings(loadedSettings)
      } catch {
        if (!isCancelled) onError(t('components.settings.loadError'))
      }
    }

    void loadSettings()

    return () => {
      isCancelled = true
    }
  }, [onError, t])

  const handleSaveSettings = async (): Promise<void> => {
    if (!hasSettingsChanged || isSavingSettings) return

    setIsSavingSettings(true)

    try {
      const settings = await window.api.saveLauncherSettings({
        minimizeOnGameOpen,
        cleanCacheOnGameOpen,
        language: selectedLanguage
      })

      const appliedSettings: EditableSettings = {
        language: getLanguageCode(settings.language),
        minimizeOnGameOpen: settings.minimizeOnGameOpen ?? false,
        cleanCacheOnGameOpen: settings.cleanCacheOnGameOpen ?? false
      }

      setMinimizeOnGameOpen(appliedSettings.minimizeOnGameOpen)
      setCleanCacheOnGameOpen(appliedSettings.cleanCacheOnGameOpen)
      setSelectedLanguage(appliedSettings.language)
      setSavedSettings(appliedSettings)
      await i18n.changeLanguage(appliedSettings.language)
    } catch {
      onError(t('components.settings.saveError'))
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="font-ui fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex w-[640px] max-w-[calc(100vw-48px)] flex-col gap-1 border border-cyan-900/50 bg-[#05080d]/95 p-3 text-gray-300 shadow-[0px_25px_20px_-20px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-cyan-600 transition-colors hover:text-cyan-200"
        >
          <XIcon size={22} />
        </button>

        <h3 className="font-display text-[32px] font-normal leading-[38px] tracking-[0.03em] text-cyan-300 uppercase">
          {t('components.settings.title')}
        </h3>
        <hr className="-mx-3 mb-1 border-cyan-900/50" />

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <h4 className="font-display text-[20px] font-normal leading-[26px] tracking-[0.03em] text-cyan-300 uppercase">
              {t('components.settings.languageSelector')}
            </h4>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageOpen((value) => !value)}
                className="flex h-9 w-full cursor-pointer items-center justify-between border border-cyan-900/50 bg-black/30 px-3 text-cyan-100 outline-none transition-colors hover:border-cyan-400/60"
              >
                <span className="flex items-center gap-3">
                  {activeLanguage && <activeLanguage.Flag />}
                  <span>{activeLanguage?.label}</span>
                </span>
                <ChevronDown size={16} className="text-cyan-500" />
              </button>

              {isLanguageOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 border border-cyan-900/50 bg-[#05080d] shadow-[0_0_20px_rgba(0,174,255,0.14)]">
                  {languageOptions.map(({ value, label, Flag }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(value)
                        setIsLanguageOpen(false)
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-cyan-100 transition-colors hover:bg-cyan-950/40"
                    >
                      <Flag />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h4 className="font-display text-[20px] font-normal leading-[26px] tracking-[0.03em] text-cyan-300 uppercase">
              {t('components.settings.onGameOpenSection')}
            </h4>
            <SettingsCheckbox
              checked={minimizeOnGameOpen}
              onChange={setMinimizeOnGameOpen}
              label={t('components.settings.minimizeOnGameOpen')}
            />

            <SettingsCheckbox
              checked={cleanCacheOnGameOpen}
              onChange={setCleanCacheOnGameOpen}
              label={t('components.settings.cleanCacheOnGameOpen')}
            />
          </section>
        </div>

        <button
          type="button"
          disabled={isSavingSettings || !hasSettingsChanged}
          onClick={() => {
            void handleSaveSettings()
          }}
          className={`${hasSettingsChanged ? 'hover-glow' : ''} mt-8 cursor-pointer self-end text-3xl font-bold text-green-500 transition-all hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-green-500`}
        >
          {t('components.settings.save')}
        </button>
      </div>
    </div>
  )
}

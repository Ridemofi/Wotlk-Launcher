import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import MessageErrorModal from '../components/modals/MessageErrorModal'
import SettingsModal from '../components/modals/SettingsModal'
import HomePage from '../pages/HomePage'
import wotlkVideo from '../assets/wotlk1.mp4'

function LauncherLayout(): React.JSX.Element {
  const { i18n } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadLanguage(): Promise<void> {
      try {
        const settings = await window.api.getLauncherSettings()
        if (isCancelled) return

        await i18n.changeLanguage(settings.language ?? 'es')
      } catch {
        if (!isCancelled) await i18n.changeLanguage('es')
      }
    }

    void loadLanguage()

    return () => {
      isCancelled = true
    }
  }, [i18n])

  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      <video
        className="h-full w-full object-cover"
        src={wotlkVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
      <HomePage />
      {isSettingsOpen &&
        createPortal(
          <SettingsModal onClose={() => setIsSettingsOpen(false)} onError={setSettingsError} />,
          document.body
        )}
      {settingsError &&
        createPortal(
          <MessageErrorModal message={settingsError} onClose={() => setSettingsError(null)} />,
          document.body
        )}
    </main>
  )
}

export default LauncherLayout

import { Minus, Settings, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import wotlkLogo from '../assets/World of Warcraft Wrath Of The Lich King Logo HD PNG - 1500x1500.png'

interface NavbarProps {
  onOpenSettings: () => void
}

function Navbar({ onOpenSettings }: NavbarProps): React.JSX.Element {
  const { t } = useTranslation()

  const minimizeWindow = (): void => {
    window.electron.ipcRenderer.send('minimize-window')
  }

  const closeWindow = (): void => {
    window.electron.ipcRenderer.send('close-window')
  }

  return (
    <>
      <div
        className="absolute left-0 right-0 top-0 z-10 h-9"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <div
        className="absolute right-4 top-2 z-20 flex items-center gap-2 text-white/45"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={onOpenSettings}
          className="flex h-6 w-6 cursor-pointer items-center justify-center transition hover:text-cyan-400"
        >
          <Settings size={17} />
        </button>
        <button
          className="flex h-6 w-6 cursor-pointer items-center justify-center transition hover:text-cyan-400"
          onClick={minimizeWindow}
        >
          <Minus size={18} />
        </button>
        <button
          className="flex h-6 w-6 cursor-pointer items-center justify-center transition hover:text-cyan-400"
          onClick={closeWindow}
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="absolute left-12 top-11 z-20 flex items-center gap-10 text-white"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <img
          className="h-[76px] w-auto object-contain"
          src={wotlkLogo}
          alt="Wrath of the Lich King"
        />
        <nav className="font-ui flex items-center gap-1 text-[20px] font-normal leading-[26px] uppercase">
          <button className="hover-glow cursor-pointer px-2 py-2 tracking-wide text-cyan-300 drop-shadow-[0px_0px_10px_white]">
            {t('components.nav.home')}
          </button>
          <button
            disabled
            className="hover-glow cursor-pointer px-2 py-2 tracking-wide hover:text-cyan-300"
          >
            {t('components.nav.addons')}
          </button>
          <button
            disabled
            className="hover-glow cursor-pointer px-2 py-2 tracking-wide hover:text-cyan-300"
          >
            {t('components.nav.mods')}
          </button>
        </nav>
      </div>
    </>
  )
}

export default Navbar

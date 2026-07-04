import { addons as esAddons } from './es/pages/addons'
import { home as esHome } from './es/pages/home'
import { mods as esMods } from './es/pages/mods'
import { modals as esModals } from './es/components/modals'
import { nav as esNav } from './es/components/nav'
import { settings as esSettings } from './es/components/settings'
import { toast as esToast } from './es/components/toast'
import { addons as enAddons } from './en/pages/addons'
import { home as enHome } from './en/pages/home'
import { mods as enMods } from './en/pages/mods'
import { modals as enModals } from './en/components/modals'
import { nav as enNav } from './en/components/nav'
import { settings as enSettings } from './en/components/settings'
import { toast as enToast } from './en/components/toast'

export const resources = {
  es: {
    translation: {
      pages: {
        home: esHome,
        addons: esAddons,
        mods: esMods
      },
      components: {
        nav: esNav,
        modals: esModals,
        settings: esSettings,
        toast: esToast
      }
    }
  },
  en: {
    translation: {
      pages: {
        home: enHome,
        addons: enAddons,
        mods: enMods
      },
      components: {
        nav: enNav,
        modals: enModals,
        settings: enSettings,
        toast: enToast
      }
    }
  }
} as const

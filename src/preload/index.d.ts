import { ElectronAPI } from '@electron-toolkit/preload'

export interface RealmServer {
  id: string
  name: string
  realmlist: string
  website?: string
  isCustom?: boolean
}

export interface ScreenshotsInfo {
  exists: boolean
  count: number
  path: string
}

export interface DiskUsageItem {
  id: string
  label: string
  path: string
  exists: boolean
  bytes: number
  formattedSize: string
}

export interface DiskUsageSummary {
  items: DiskUsageItem[]
  totalBytes: number
  formattedTotal: string
}

export interface LauncherSettings {
  gameDirectory?: string
  screenshots?: ScreenshotsInfo
  activeServerId?: string
  customServers?: RealmServer[]
  minimizeOnGameOpen?: boolean
  cleanCacheOnGameOpen?: boolean
  language?: 'es' | 'en'
}

export interface LauncherSettingsPatch {
  minimizeOnGameOpen?: boolean
  cleanCacheOnGameOpen?: boolean
  language?: 'es' | 'en'
}

export interface LaunchGameResult {
  success: boolean
  cacheWarning?: string
  cacheSizeAfterClear?: string
  shouldMinimize: boolean
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getWowDirectory: () => Promise<string>
      selectWowDirectory: () => Promise<string | null>
      validateWowDirectory: (path: string) => Promise<boolean>
      saveWowDirectory: (path: string) => Promise<boolean>
      openWowDirectory: () => Promise<boolean>
      launchGame: () => Promise<LaunchGameResult>
      getLauncherSettings: () => Promise<LauncherSettings>
      saveLauncherSettings: (settingsPatch: LauncherSettingsPatch) => Promise<LauncherSettings>
      getServers: () => Promise<RealmServer[]>
      getActiveServerId: () => Promise<string>
      addCustomServer: (server: {
        name: string
        realmlist: string
        website?: string
      }) => Promise<RealmServer>
      updateCustomServer: (
        serverId: string,
        server: {
          name: string
          realmlist: string
          website?: string
        }
      ) => Promise<RealmServer>
      removeCustomServer: (serverId: string) => Promise<boolean>
      applyRealmlist: (serverId: string) => Promise<boolean>
      readCurrentRealmlist: () => Promise<string>
      backupWtf: () => Promise<string>
      restoreWtfBackup: () => Promise<boolean>
      hasWtfBackup: () => Promise<boolean>
      openWtfBackupFolder: () => Promise<boolean>
      getCacheSize: () => Promise<string>
      clearCache: () => Promise<string>
      getScreenshotsInfo: () => Promise<ScreenshotsInfo>
      openScreenshotsFolder: () => Promise<boolean>
      getDiskUsageSummary: () => Promise<DiskUsageSummary>
    }
  }
}

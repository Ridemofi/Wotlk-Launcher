import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getWowDirectory: () => ipcRenderer.invoke('get-wow-directory'),
  selectWowDirectory: () => ipcRenderer.invoke('select-wow-directory'),
  validateWowDirectory: (path: string) => ipcRenderer.invoke('validate-wow-directory', path),
  saveWowDirectory: (path: string) => ipcRenderer.invoke('save-wow-directory', path),
  openWowDirectory: () => ipcRenderer.invoke('open-wow-directory'),
  launchGame: () => ipcRenderer.invoke('launch-game'),
  getLauncherSettings: () => ipcRenderer.invoke('get-launcher-settings'),
  saveLauncherSettings: (settingsPatch: {
    minimizeOnGameOpen?: boolean
    cleanCacheOnGameOpen?: boolean
    language?: 'es' | 'en'
  }) => ipcRenderer.invoke('save-launcher-settings', settingsPatch),
  getServers: () => ipcRenderer.invoke('get-servers'),
  getActiveServerId: () => ipcRenderer.invoke('get-active-server-id'),
  addCustomServer: (server: { name: string; realmlist: string; website?: string }) =>
    ipcRenderer.invoke('add-custom-server', server),
  updateCustomServer: (
    serverId: string,
    server: { name: string; realmlist: string; website?: string }
  ) => ipcRenderer.invoke('update-custom-server', serverId, server),
  removeCustomServer: (serverId: string) => ipcRenderer.invoke('remove-custom-server', serverId),
  applyRealmlist: (serverId: string) => ipcRenderer.invoke('apply-realmlist', serverId),
  readCurrentRealmlist: () => ipcRenderer.invoke('read-current-realmlist'),
  backupWtf: () => ipcRenderer.invoke('backup-wtf'),
  restoreWtfBackup: () => ipcRenderer.invoke('restore-wtf-backup'),
  hasWtfBackup: () => ipcRenderer.invoke('has-wtf-backup'),
  openWtfBackupFolder: () => ipcRenderer.invoke('open-wtf-backup-folder'),
  getCacheSize: () => ipcRenderer.invoke('get-cache-size'),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  getScreenshotsInfo: () => ipcRenderer.invoke('get-screenshots-info'),
  openScreenshotsFolder: () => ipcRenderer.invoke('open-screenshots-folder'),
  getDiskUsageSummary: () => ipcRenderer.invoke('get-disk-usage-summary')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  const exposedWindow = window as unknown as typeof globalThis & {
    electron: typeof electronAPI
    api: typeof api
  }

  exposedWindow.electron = electronAPI
  exposedWindow.api = api
}

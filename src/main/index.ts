import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  getGameDirectory,
  selectGameDirectory,
  validateGameDirectory,
  saveGameDirectory
} from './services/wowPathManager'
import { launchGame } from './services/wowLauncher'
import {
  createWtfBackup,
  hasWtfBackup,
  openWtfBackupFolder,
  restoreLatestWtfBackup
} from './services/backupService'
import { clearCache, getCacheSize } from './services/cacheService'
import { getDiskUsageSummary } from './services/diskUsageService'
import {
  getScreenshotsInfoForDirectory,
  openScreenshotsFolderForDirectory
} from './services/screenshotsService'
import {
  getServers,
  getActiveServerId,
  addCustomServer,
  updateCustomServer,
  removeCustomServer,
  applyRealmlist,
  readCurrentRealmlist,
  RealmServer
} from './services/realmlistService'
import {
  getLauncherSettings,
  saveLauncherSettings,
  type LauncherSettingsPatch
} from './services/settingsService'

function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (isAllowedExternalUrl(details.url)) {
      shell.openExternal(details.url)
    }

    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ridemofi.wotlklauncher')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('minimize-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('close-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('get-wow-directory', async () => {
    return await getGameDirectory()
  })

  ipcMain.handle('select-wow-directory', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      return await selectGameDirectory(window)
    }
    return null
  })

  ipcMain.handle('validate-wow-directory', async (_, path) => {
    return await validateGameDirectory(path)
  })

  ipcMain.handle('save-wow-directory', async (_, path) => {
    try {
      return await saveGameDirectory(path)
    } catch {
      return false
    }
  })

  ipcMain.handle('open-wow-directory', async () => {
    const gameDir = await getGameDirectory()
    if (!gameDir) {
      throw new Error('No hay una ruta del cliente guardada.')
    }

    const error = await shell.openPath(gameDir)
    if (error) {
      throw new Error(error)
    }

    return true
  })

  ipcMain.handle('launch-game', async (event) => {
    const result = await launchGame()

    if (result.success && result.shouldMinimize) {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    }

    return result
  })

  ipcMain.handle('get-launcher-settings', async () => {
    return await getLauncherSettings()
  })

  ipcMain.handle('save-launcher-settings', async (_, settingsPatch: LauncherSettingsPatch) => {
    return await saveLauncherSettings(settingsPatch)
  })

  ipcMain.handle('get-servers', async () => {
    return await getServers()
  })

  ipcMain.handle('get-active-server-id', async () => {
    return await getActiveServerId()
  })

  ipcMain.handle('add-custom-server', async (_, server: Omit<RealmServer, 'id' | 'isCustom'>) => {
    return await addCustomServer(server)
  })

  ipcMain.handle(
    'update-custom-server',
    async (_, serverId: string, server: Omit<RealmServer, 'id' | 'isCustom'>) => {
      return await updateCustomServer(serverId, server)
    }
  )

  ipcMain.handle('remove-custom-server', async (_, serverId: string) => {
    await removeCustomServer(serverId)
    return true
  })

  ipcMain.handle('apply-realmlist', async (_, serverId: string) => {
    await applyRealmlist(serverId)
    return true
  })

  ipcMain.handle('read-current-realmlist', async () => {
    return await readCurrentRealmlist()
  })

  ipcMain.handle('backup-wtf', async () => {
    return await createWtfBackup()
  })

  ipcMain.handle('restore-wtf-backup', async () => {
    return await restoreLatestWtfBackup()
  })

  ipcMain.handle('has-wtf-backup', async () => {
    return await hasWtfBackup()
  })

  ipcMain.handle('open-wtf-backup-folder', async () => {
    return await openWtfBackupFolder()
  })

  ipcMain.handle('get-cache-size', async () => {
    return await getCacheSize()
  })

  ipcMain.handle('clear-cache', async () => {
    return await clearCache()
  })

  ipcMain.handle('get-screenshots-info', async () => {
    const gameDir = await getGameDirectory()
    if (!gameDir) {
      return {
        exists: false,
        count: 0,
        path: ''
      }
    }

    return await getScreenshotsInfoForDirectory(gameDir)
  })

  ipcMain.handle('open-screenshots-folder', async () => {
    const gameDir = await getGameDirectory()
    if (!gameDir) {
      throw new Error('No hay una ruta del cliente guardada.')
    }

    return await openScreenshotsFolderForDirectory(gameDir)
  })

  ipcMain.handle('get-disk-usage-summary', async () => {
    return await getDiskUsageSummary()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

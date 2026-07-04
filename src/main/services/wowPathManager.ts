import { dialog, BrowserWindow } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { getScreenshotsInfoForDirectory } from './screenshotsService'
import { readSettings, updateSettings } from './settingsService'

export async function validateGameDirectory(dirPath: string): Promise<boolean> {
  if (!dirPath) return false

  try {
    const exePath = path.join(dirPath, 'Wow.exe')
    const mpqPath = path.join(dirPath, 'Data', 'lichking.MPQ')

    const [exeStats, mpqStats] = await Promise.all([fs.stat(exePath), fs.stat(mpqPath)])

    return exeStats.isFile() && mpqStats.isFile()
  } catch {
    return false
  }
}

export async function getGameDirectory(): Promise<string> {
  const settings = await readSettings()
  return settings.gameDirectory || ''
}

export async function saveGameDirectory(dirPath: string): Promise<boolean> {
  const hasExe = await validateGameDirectory(dirPath)
  if (!hasExe) {
    throw new Error('No se encontro Wow.exe en la carpeta seleccionada.')
  }

  const screenshots = await getScreenshotsInfoForDirectory(dirPath)
  await updateSettings((settings) => ({
    ...settings,
    gameDirectory: dirPath,
    screenshots
  }))
  return true
}

export async function selectGameDirectory(window: BrowserWindow): Promise<string | null> {
  const result = await dialog.showOpenDialog(window, {
    properties: ['openDirectory'],
    title: 'Selecciona la carpeta de World of Warcraft'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const selectedPath = result.filePaths[0]
  await saveGameDirectory(selectedPath)
  return selectedPath
}

import { shell } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'

export interface ScreenshotsInfo {
  exists: boolean
  count: number
  path: string
}

const SCREENSHOT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tga'])

export async function getScreenshotsInfoForDirectory(
  gameDirectory: string
): Promise<ScreenshotsInfo> {
  const screenshotsPath = path.join(gameDirectory, 'Screenshots')

  try {
    const stats = await fs.stat(screenshotsPath)
    if (!stats.isDirectory()) {
      return {
        exists: false,
        count: 0,
        path: screenshotsPath
      }
    }

    const entries = await fs.readdir(screenshotsPath, { withFileTypes: true })
    const count = entries.filter((entry) => {
      return entry.isFile() && SCREENSHOT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    }).length

    return {
      exists: true,
      count,
      path: screenshotsPath
    }
  } catch {
    return {
      exists: false,
      count: 0,
      path: screenshotsPath
    }
  }
}

export async function openScreenshotsFolderForDirectory(gameDirectory: string): Promise<boolean> {
  const info = await getScreenshotsInfoForDirectory(gameDirectory)

  if (!info.exists) {
    throw new Error('No se encontro la carpeta Screenshots en el cliente de WoW.')
  }

  const error = await shell.openPath(info.path)
  if (error) {
    throw new Error(error)
  }

  return true
}

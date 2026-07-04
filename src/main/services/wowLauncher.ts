import { spawn } from 'child_process'
import * as path from 'path'
import { getGameDirectory, validateGameDirectory } from './wowPathManager'
import { clearCache } from './cacheService'
import { readSettings } from './settingsService'

export interface LaunchGameResult {
  success: boolean
  cacheWarning?: string
  cacheSizeAfterClear?: string
  shouldMinimize: boolean
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

async function startWowProcess(exePath: string, gameDir: string): Promise<void> {
  const wowProcess = spawn(exePath, [], {
    cwd: gameDir,
    detached: true,
    stdio: 'ignore'
  })

  await new Promise<void>((resolve, reject) => {
    wowProcess.once('spawn', resolve)
    wowProcess.once('error', reject)
  })

  wowProcess.unref()
}

export async function launchGame(): Promise<LaunchGameResult> {
  try {
    const gameDir = await getGameDirectory()
    const settings = await readSettings()

    if (!gameDir) {
      throw new Error(
        'No has seleccionado la ruta del juego. Por favor, selecciona la carpeta donde esta instalado World of Warcraft.'
      )
    }

    const isValid = await validateGameDirectory(gameDir)
    if (!isValid) {
      throw new Error(
        'La ruta actual no es valida o no contiene Wow.exe. Por favor, vuelve a seleccionar la carpeta.'
      )
    }

    let cacheWarning: string | undefined
    let cacheSizeAfterClear: string | undefined

    if (settings.cleanCacheOnGameOpen) {
      try {
        cacheSizeAfterClear = await clearCache()
      } catch {
        cacheWarning = 'El juego se inicio, pero no se pudo limpiar la Cache.'
      }
    }

    const exePath = path.join(gameDir, 'Wow.exe')
    await startWowProcess(exePath, gameDir)

    return {
      success: true,
      cacheWarning,
      cacheSizeAfterClear,
      shouldMinimize: settings.minimizeOnGameOpen ?? false
    }
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, 'Ocurrio un error inesperado al intentar iniciar el juego.')
    )
  }
}

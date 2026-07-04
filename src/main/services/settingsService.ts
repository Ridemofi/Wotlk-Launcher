import { app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import type { RealmServer } from './realmlistService'
import type { ScreenshotsInfo } from './screenshotsService'

const CONFIG_FILE = 'settings.json'
let settingsQueue: Promise<void> = Promise.resolve()

export type LauncherLanguage = 'es' | 'en'

export interface LauncherSettings {
  gameDirectory?: string
  screenshots?: ScreenshotsInfo
  activeServerId?: string
  customServers?: RealmServer[]
  minimizeOnGameOpen?: boolean
  cleanCacheOnGameOpen?: boolean
  language?: LauncherLanguage
}

export type LauncherSettingsPatch = Pick<
  LauncherSettings,
  'minimizeOnGameOpen' | 'cleanCacheOnGameOpen' | 'language'
>

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), CONFIG_FILE)
}

export async function readSettings(): Promise<LauncherSettings> {
  try {
    const content = await fs.readFile(getSettingsPath(), 'utf-8')
    return JSON.parse(content) as LauncherSettings
  } catch {
    return {}
  }
}

export async function writeSettings(settings: LauncherSettings): Promise<void> {
  await fs.writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}

export async function updateSettings(
  updater: (
    settings: LauncherSettings
  ) => LauncherSettings | void | Promise<LauncherSettings | void>
): Promise<LauncherSettings> {
  const operation = settingsQueue.then(async () => {
    const settings = await readSettings()
    const result = await updater(settings)
    const updatedSettings = result ?? settings
    await writeSettings(updatedSettings)
    return updatedSettings
  })

  settingsQueue = operation.then(
    () => undefined,
    () => undefined
  )

  return await operation
}

export async function getLauncherSettings(): Promise<LauncherSettings> {
  return await readSettings()
}

export async function saveLauncherSettings(
  settingsPatch: LauncherSettingsPatch
): Promise<LauncherSettings> {
  return await updateSettings((settings) => ({
    ...settings,
    minimizeOnGameOpen: settingsPatch.minimizeOnGameOpen ?? settings.minimizeOnGameOpen ?? false,
    cleanCacheOnGameOpen:
      settingsPatch.cleanCacheOnGameOpen ?? settings.cleanCacheOnGameOpen ?? false,
    language: settingsPatch.language ?? settings.language ?? 'es'
  }))
}

import * as fs from 'fs/promises'
import * as path from 'path'
import { readSettings, updateSettings } from './settingsService'

export interface RealmServer {
  id: string
  name: string
  realmlist: string
  website?: string
  isCustom?: boolean
}

export const DEFAULT_SERVERS: RealmServer[] = [
  {
    id: 'localhost',
    name: 'Localhost',
    realmlist: '127.0.0.1'
  },
  {
    id: 'ultimowow',
    name: 'UltimoWoW',
    realmlist: 'logon.ultimowow.com',
    website: 'https://ultimowow.com'
  },
  {
    id: 'warmane',
    name: 'Warmane',
    realmlist: 'logon.warmane.com',
    website: 'https://warmane.com'
  },
  {
    id: 'chromie',
    name: 'ChromieCraft',
    realmlist: 'logon.chromie-craft.com',
    website: 'https://chromie-craft.com'
  },
  {
    id: 'wowpatagonia',
    name: 'WowPatagonia',
    realmlist: 'logon.wowpatagonia.com',
    website: 'https://wowpatagonia.com'
  }
]

const REALMLIST_FILE_NAME = 'realmlist.wtf'
const KNOWN_REALMLIST_LOCALES = ['esES', 'esMX', 'enUS', 'enGB']

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

async function findRealmlistFile(dirPath: string): Promise<string | null> {
  let entries: import('fs').Dirent[]

  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return null
  }

  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase() === 'realmlist.wtf') {
      return path.join(dirPath, entry.name)
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const found = await findRealmlistFile(path.join(dirPath, entry.name))
    if (found) return found
  }

  return null
}

async function findExistingRealmlistPath(gameDir: string): Promise<string | null> {
  const dataPath = path.join(gameDir, 'Data')

  for (const locale of KNOWN_REALMLIST_LOCALES) {
    const knownRealmlistPath = path.join(dataPath, locale, REALMLIST_FILE_NAME)
    if (await fileExists(knownRealmlistPath)) return knownRealmlistPath
  }

  const dataRealmlist = await findRealmlistFile(path.join(gameDir, 'Data'))
  if (dataRealmlist) return dataRealmlist

  const rootRealmlist = path.join(gameDir, REALMLIST_FILE_NAME)
  if (await fileExists(rootRealmlist)) return rootRealmlist

  return null
}

export async function getServers(): Promise<RealmServer[]> {
  const settings = await readSettings()
  const customServers: RealmServer[] = settings.customServers ?? []
  return [...DEFAULT_SERVERS, ...customServers]
}

export async function getActiveServerId(): Promise<string> {
  const settings = await readSettings()
  return settings.activeServerId ?? 'localhost'
}

export async function addCustomServer(
  server: Omit<RealmServer, 'id' | 'isCustom'>
): Promise<RealmServer> {
  const allServers = await getServers()

  const duplicate = allServers.find(
    (s) => s.realmlist.toLowerCase() === server.realmlist.toLowerCase()
  )
  if (duplicate) {
    throw new Error(`Ya existe un servidor con ese realmlist: "${duplicate.name}"`)
  }

  const newServer: RealmServer = {
    ...server,
    id: `custom_${Date.now()}`,
    isCustom: true
  }

  await updateSettings((settings) => ({
    ...settings,
    customServers: [...(settings.customServers ?? []), newServer]
  }))

  return newServer
}

export async function updateCustomServer(
  serverId: string,
  server: Omit<RealmServer, 'id' | 'isCustom'>
): Promise<RealmServer> {
  const isDefault = DEFAULT_SERVERS.some((s) => s.id === serverId)
  if (isDefault) {
    throw new Error('No se pueden modificar los servidores predeterminados.')
  }

  const settingsSnapshot = await readSettings()
  const customServers: RealmServer[] = settingsSnapshot.customServers ?? []
  const serverIndex = customServers.findIndex((s) => s.id === serverId)

  if (serverIndex === -1) {
    throw new Error('No se encontro el servidor personalizado.')
  }

  const allServers = await getServers()
  const duplicate = allServers.find(
    (s) => s.id !== serverId && s.realmlist.toLowerCase() === server.realmlist.toLowerCase()
  )
  if (duplicate) {
    throw new Error(`Ya existe un servidor con ese realmlist: "${duplicate.name}"`)
  }

  const updatedServer: RealmServer = {
    ...server,
    id: serverId,
    isCustom: true
  }

  await updateSettings((settings) => ({
    ...settings,
    customServers: (settings.customServers ?? []).map((customServer) =>
      customServer.id === serverId ? updatedServer : customServer
    )
  }))

  return updatedServer
}

export async function removeCustomServer(serverId: string): Promise<void> {
  const isDefault = DEFAULT_SERVERS.some((s) => s.id === serverId)
  if (isDefault) {
    throw new Error('No se pueden eliminar los servidores predeterminados.')
  }

  await updateSettings((settings) => ({
    ...settings,
    customServers: (settings.customServers ?? []).filter((s) => s.id !== serverId),
    activeServerId: settings.activeServerId === serverId ? 'localhost' : settings.activeServerId
  }))
}

export async function applyRealmlist(serverId: string): Promise<void> {
  const settings = await readSettings()
  const gameDir: string = settings.gameDirectory ?? ''

  if (!gameDir) {
    throw new Error('La ruta del cliente WoW no esta configurada.')
  }

  const allServers = await getServers()
  const server = allServers.find((s) => s.id === serverId)
  if (!server) {
    throw new Error(`No se encontro el servidor con ID: ${serverId}`)
  }

  const realmlistPath = await findExistingRealmlistPath(gameDir)
  if (!realmlistPath) {
    throw new Error('No se encontro realmlist.wtf dentro de la carpeta Data del cliente.')
  }

  const realmlistContent = `set realmlist ${server.realmlist}\r\n`

  await fs.writeFile(realmlistPath, realmlistContent, 'utf-8')
  await updateSettings((currentSettings) => ({
    ...currentSettings,
    activeServerId: serverId
  }))
}

export async function readCurrentRealmlist(): Promise<string> {
  const settings = await readSettings()
  const gameDir: string = settings.gameDirectory ?? ''

  if (!gameDir) return ''

  const realmlistPath = await findExistingRealmlistPath(gameDir)
  if (!realmlistPath) return ''

  const content = await fs.readFile(realmlistPath, 'utf-8')
  return content.trim()
}

import { app, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import { ZipArchive } from 'archiver'
import { createWriteStream } from 'fs'
import extract from 'extract-zip'
import { getGameDirectory } from './wowPathManager'

const MAX_WTF_BACKUPS = 10
let isCreatingWtfBackup = false
let isRestoringWtfBackup = false

function getWtfBackupDir(): string {
  return path.join(app.getPath('userData'), 'Backups', 'WTF')
}

async function getLatestWtfBackup(): Promise<string> {
  const backupDir = getWtfBackupDir()
  let files: string[]

  try {
    files = await fs.readdir(backupDir)
  } catch {
    throw new Error('No hay backups WTF disponibles.')
  }

  const zipFiles = files.filter((file) => file.toLowerCase().endsWith('.zip'))
  if (zipFiles.length === 0) {
    throw new Error('No hay backups WTF disponibles.')
  }

  const backups = await Promise.all(
    zipFiles.map(async (file) => {
      const filePath = path.join(backupDir, file)
      const stats = await fs.stat(filePath)
      return {
        filePath,
        mtimeMs: stats.mtimeMs
      }
    })
  )

  return backups.sort((a, b) => b.mtimeMs - a.mtimeMs)[0].filePath
}

async function cleanupOldWtfBackups(backupDir: string): Promise<void> {
  const files = await fs.readdir(backupDir)
  const zipFiles = files.filter((file) => file.toLowerCase().endsWith('.zip'))

  const backups = await Promise.all(
    zipFiles.map(async (file) => {
      const filePath = path.join(backupDir, file)
      const stats = await fs.stat(filePath)
      return {
        filePath,
        mtimeMs: stats.mtimeMs
      }
    })
  )

  const oldBackups = backups.sort((a, b) => b.mtimeMs - a.mtimeMs).slice(MAX_WTF_BACKUPS)

  await Promise.all(oldBackups.map((backup) => fs.rm(backup.filePath, { force: true })))
}

async function createWtfBackupArchive(): Promise<string> {
  const gameDir = await getGameDirectory()
  if (!gameDir) {
    throw new Error('No hay ruta del juego configurada.')
  }

  const wtfPath = path.join(gameDir, 'WTF')

  try {
    const stats = await fs.stat(wtfPath)
    if (!stats.isDirectory()) {
      throw new Error('La ruta WTF no es un directorio.')
    }
  } catch {
    throw new Error('No se encontro la carpeta WTF en el cliente de WoW.')
  }

  const backupDir = getWtfBackupDir()
  await fs.mkdir(backupDir, { recursive: true })

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const zipName = `WTF-${day}-${month}-${year}-${hours}${minutes}${seconds}.zip`
  const zipPath = path.join(backupDir, zipName)

  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath)
    const archive = new ZipArchive({
      zlib: { level: 6 }
    })

    output.on('close', () => {
      cleanupOldWtfBackups(backupDir)
        .then(() => resolve(zipPath))
        .catch(reject)
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    archive.directory(wtfPath, false)
    archive.finalize().catch(reject)
  })
}

export async function createWtfBackup(): Promise<string> {
  if (isCreatingWtfBackup) {
    throw new Error('Ya hay un backup WTF en proceso.')
  }

  isCreatingWtfBackup = true

  try {
    return await createWtfBackupArchive()
  } finally {
    isCreatingWtfBackup = false
  }
}

export async function restoreLatestWtfBackup(): Promise<boolean> {
  if (isRestoringWtfBackup) {
    throw new Error('Ya hay una restauracion WTF en proceso.')
  }

  isRestoringWtfBackup = true

  try {
    return await restoreLatestWtfBackupArchive()
  } finally {
    isRestoringWtfBackup = false
  }
}

async function restoreLatestWtfBackupArchive(): Promise<boolean> {
  const gameDir = await getGameDirectory()
  if (!gameDir) {
    throw new Error('No hay ruta del juego configurada.')
  }

  const latestBackup = await getLatestWtfBackup()
  const wtfPath = path.join(gameDir, 'WTF')
  const tempRestorePath = path.join(gameDir, `.WTF-restore-${Date.now()}`)

  try {
    await fs.rm(tempRestorePath, { recursive: true, force: true })
    await fs.mkdir(tempRestorePath, { recursive: true })
    await extract(latestBackup, { dir: tempRestorePath })
    await fs.rm(wtfPath, { recursive: true, force: true })
    await fs.rename(tempRestorePath, wtfPath)
    return true
  } catch (error: unknown) {
    await fs.rm(tempRestorePath, { recursive: true, force: true })
    const message =
      error instanceof Error && error.message ? error.message : 'Error al restaurar WTF.'
    throw new Error(message)
  }
}

export async function hasWtfBackup(): Promise<boolean> {
  const backupDir = getWtfBackupDir()
  try {
    const files = await fs.readdir(backupDir)
    return files.some((file) => file.endsWith('.zip'))
  } catch {
    return false
  }
}

export async function openWtfBackupFolder(): Promise<boolean> {
  const backupDir = getWtfBackupDir()
  await fs.mkdir(backupDir, { recursive: true })

  const error = await shell.openPath(backupDir)
  if (error) {
    throw new Error(error)
  }

  return true
}

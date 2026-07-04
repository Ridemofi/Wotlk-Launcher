import * as fs from 'fs/promises'
import * as path from 'path'
import { getGameDirectory } from './wowPathManager'

const DIRECTORY_SCAN_CONCURRENCY = 24
const CACHE_DELETE_CONCURRENCY = 12

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, unitIndex)

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

async function getDirectorySize(dirPath: string): Promise<number> {
  let totalBytes = 0
  let activeDirectories = 0
  const pendingDirectories = [dirPath]
  const waiters: Array<() => void> = []

  const wakeWaiters = (): void => {
    while (waiters.length > 0) {
      waiters.pop()?.()
    }
  }

  const getNextDirectory = async (): Promise<string | null> => {
    while (pendingDirectories.length === 0) {
      if (activeDirectories === 0) return null
      await new Promise<void>((resolve) => waiters.push(resolve))
    }

    const nextDirectory = pendingDirectories.pop()
    if (!nextDirectory) return null

    activeDirectories += 1
    return nextDirectory
  }

  const worker = async (): Promise<void> => {
    while (true) {
      const currentDirectory = await getNextDirectory()
      if (!currentDirectory) {
        wakeWaiters()
        return
      }

      let entries: import('fs').Dirent[]

      try {
        entries = await fs.readdir(currentDirectory, { withFileTypes: true })
      } catch {
        activeDirectories -= 1
        wakeWaiters()
        continue
      }

      for (const entry of entries) {
        const entryPath = path.join(currentDirectory, entry.name)

        if (entry.isDirectory()) {
          pendingDirectories.push(entryPath)
          wakeWaiters()
          continue
        }

        if (!entry.isFile()) continue

        try {
          const stats = await fs.stat(entryPath)
          totalBytes += stats.size
        } catch {
          continue
        }
      }

      activeDirectories -= 1
      wakeWaiters()
    }
  }

  await Promise.all(
    Array.from({ length: DIRECTORY_SCAN_CONCURRENCY }, async () => {
      await worker()
    })
  )

  return totalBytes
}

async function getCachePath(): Promise<string> {
  const gameDir = await getGameDirectory()
  if (!gameDir) {
    throw new Error('No hay ruta del juego configurada.')
  }

  return path.join(gameDir, 'Cache')
}

export async function getCacheSize(): Promise<string> {
  const cachePath = await getCachePath()
  const size = await getDirectorySize(cachePath)
  return formatBytes(size)
}

export async function clearCache(): Promise<string> {
  const cachePath = await getCachePath()

  await fs.mkdir(cachePath, { recursive: true })

  const entries = await fs.readdir(cachePath, { withFileTypes: true })
  let nextEntryIndex = 0

  const worker = async (): Promise<void> => {
    while (nextEntryIndex < entries.length) {
      const entry = entries[nextEntryIndex]
      nextEntryIndex += 1
      const entryPath = path.join(cachePath, entry.name)
      await fs.rm(entryPath, { recursive: true, force: true })
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CACHE_DELETE_CONCURRENCY, entries.length) }, async () => {
      await worker()
    })
  )

  return await getCacheSize()
}

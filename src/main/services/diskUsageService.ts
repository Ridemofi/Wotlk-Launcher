import * as fs from 'fs/promises'
import * as path from 'path'
import { getGameDirectory } from './wowPathManager'

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

const DISK_USAGE_TARGETS = [
  {
    id: 'data',
    label: 'Data',
    segments: ['Data']
  },
  {
    id: 'addons',
    label: 'Interface/AddOns',
    segments: ['Interface', 'AddOns']
  },
  {
    id: 'screenshots',
    label: 'Screenshots',
    segments: ['Screenshots']
  },
  {
    id: 'wtf',
    label: 'WTF',
    segments: ['WTF']
  },
  {
    id: 'cache',
    label: 'Cache',
    segments: ['Cache']
  },
  {
    id: 'logs',
    label: 'Logs',
    segments: ['Logs']
  }
]

const DIRECTORY_SCAN_CONCURRENCY = 24
type DiskUsageTarget = (typeof DISK_USAGE_TARGETS)[number]

interface PendingDirectory {
  itemIndex: number
  path: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, unitIndex)

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

async function scanDiskUsageTargets(
  gameDirectory: string,
  targets: DiskUsageTarget[]
): Promise<DiskUsageItem[]> {
  let activeDirectories = 0
  const pendingDirectories: PendingDirectory[] = []
  const waiters: Array<() => void> = []
  const items = await Promise.all(
    targets.map(async (target) => {
      const targetPath = path.join(gameDirectory, ...target.segments)

      try {
        const stats = await fs.stat(targetPath)
        if (!stats.isDirectory()) {
          return {
            id: target.id,
            label: target.label,
            path: targetPath,
            exists: false,
            bytes: 0,
            formattedSize: formatBytes(0)
          }
        }

        return {
          id: target.id,
          label: target.label,
          path: targetPath,
          exists: true,
          bytes: 0,
          formattedSize: formatBytes(0)
        }
      } catch {
        return {
          id: target.id,
          label: target.label,
          path: targetPath,
          exists: false,
          bytes: 0,
          formattedSize: formatBytes(0)
        }
      }
    })
  )

  pendingDirectories.length = 0
  items.forEach((item, itemIndex) => {
    if (item.exists) {
      pendingDirectories.push({
        itemIndex,
        path: item.path
      })
    }
  })

  const wakeWaiters = (): void => {
    while (waiters.length > 0) {
      waiters.pop()?.()
    }
  }

  const getNextDirectory = async (): Promise<PendingDirectory | null> => {
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
        entries = await fs.readdir(currentDirectory.path, { withFileTypes: true })
      } catch {
        activeDirectories -= 1
        wakeWaiters()
        continue
      }

      for (const entry of entries) {
        const entryPath = path.join(currentDirectory.path, entry.name)

        if (entry.isDirectory()) {
          pendingDirectories.push({
            itemIndex: currentDirectory.itemIndex,
            path: entryPath
          })
          wakeWaiters()
          continue
        }

        if (!entry.isFile()) continue

        try {
          const stats = await fs.stat(entryPath)
          items[currentDirectory.itemIndex].bytes += stats.size
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

  return items.map((item) => ({
    ...item,
    formattedSize: formatBytes(item.bytes)
  }))
}

export async function getDiskUsageSummary(): Promise<DiskUsageSummary> {
  const gameDirectory = await getGameDirectory()
  if (!gameDirectory) {
    throw new Error('No hay ruta del juego configurada.')
  }

  const items = await scanDiskUsageTargets(gameDirectory, DISK_USAGE_TARGETS)
  const totalBytes = items.reduce((total, item) => total + item.bytes, 0)

  return {
    items,
    totalBytes,
    formattedTotal: formatBytes(totalBytes)
  }
}

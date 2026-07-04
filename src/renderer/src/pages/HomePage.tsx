import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent } from 'react'
import { Plus, Check, X as XIcon, FolderOpen, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DiskUsageSummary, RealmServer, ScreenshotsInfo } from '../../../preload/index.d'
import AddRealmlistModal from '../components/modals/AddRealmlistModal'
import BackupModal from '../components/modals/BackupModal'
import ConfirmModal from '../components/modals/ConfirmModal'
import DiskUsageModal from '../components/modals/DiskUsageModal'
import ErrorModal from '../components/modals/ErrorModal'
import MessageErrorModal from '../components/modals/MessageErrorModal'
import RestoreWtfModal from '../components/modals/RestoreWtfModal'
import SuccessToast from '../components/toast/SuccessToast'
import { azerothStoryData as enAzerothStoryData } from '../i18n/en/data/azerothStory'
import { azerothStoryData as esAzerothStoryData } from '../i18n/es/data/azerothStory'

interface ConfirmModalState {
  message: string
  onConfirm: () => void
}

type BackupState = 'confirm' | 'loading' | null
type RestoreState = 'confirm' | 'loading' | null

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export default function HomePage(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [activeStoryIndex] = useState<number>(() =>
    Math.floor(Math.random() * esAzerothStoryData.length)
  )
  const activeStoryData = i18n.resolvedLanguage === 'en' ? enAzerothStoryData : esAzerothStoryData
  const activeStory = activeStoryData[activeStoryIndex] ?? esAzerothStoryData[activeStoryIndex]
  const [wowPath, setWowPath] = useState<string>('')
  const [isPathValid, setIsPathValid] = useState<boolean | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [servers, setServers] = useState<RealmServer[]>([])
  const [activeServerId, setActiveServerId] = useState<string>('')
  const [currentRealmlistFileContent, setCurrentRealmlistFileContent] = useState<string>('')
  const [isAddRealmModalOpen, setIsAddRealmModalOpen] = useState<boolean>(false)
  const [newServerName, setNewServerName] = useState<string>('')
  const [newServerRealmlist, setNewServerRealmlist] = useState<string>('')
  const [isEditRealmModalOpen, setIsEditRealmModalOpen] = useState<boolean>(false)
  const [editServerName, setEditServerName] = useState<string>('')
  const [editServerRealmlist, setEditServerRealmlist] = useState<string>('')
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null)
  const [backupState, setBackupState] = useState<BackupState>(null)
  const [restoreState, setRestoreState] = useState<RestoreState>(null)
  const [cacheSize, setCacheSize] = useState<string>('0 B')
  const [isLoadingCacheSize, setIsLoadingCacheSize] = useState<boolean>(false)
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false)
  const [hasWtfBackup, setHasWtfBackup] = useState<boolean>(false)
  const [screenshotsInfo, setScreenshotsInfo] = useState<ScreenshotsInfo>({
    exists: false,
    count: 0,
    path: ''
  })
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState<boolean>(false)
  const [isDiskUsageModalOpen, setIsDiskUsageModalOpen] = useState<boolean>(false)
  const [isLoadingDiskUsage, setIsLoadingDiskUsage] = useState<boolean>(false)
  const [diskUsageSummary, setDiskUsageSummary] = useState<DiskUsageSummary | null>(null)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isUnexpectedErrorOpen, setIsUnexpectedErrorOpen] = useState<boolean>(false)

  const showMessageError = (message: string): void => {
    setMessageError(message)
  }

  const showCaughtError = (error: unknown, fallback: string): void => {
    if (error instanceof Error && error.message) {
      setMessageError(getErrorMessage(error, fallback))
      return
    }

    setIsUnexpectedErrorOpen(true)
  }

  useEffect(() => {
    let isCancelled = false

    async function loadInitialData(): Promise<void> {
      try {
        const path = await window.api.getWowDirectory()
        if (isCancelled) return

        setWowPath(path)
        if (path) {
          const isValid = await window.api.validateWowDirectory(path)
          if (!isCancelled) setIsPathValid(isValid)
        }
      } catch (err: unknown) {
        if (!isCancelled) showCaughtError(err, t('pages.home.initialLoadError'))
      }

      try {
        const [loadedServers, loadedActiveServerId, hasBackup] = await Promise.all([
          window.api.getServers(),
          window.api.getActiveServerId(),
          window.api.hasWtfBackup()
        ])

        if (isCancelled) return

        setServers(loadedServers)
        setActiveServerId(loadedActiveServerId)
        setHasWtfBackup(hasBackup)
      } catch (err: unknown) {
        if (!isCancelled) showCaughtError(err, t('pages.home.initialLoadError'))
      }
    }

    void loadInitialData()

    return () => {
      isCancelled = true
    }
  }, [t])

  useEffect(() => {
    if (!successMessage) return

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [successMessage])

  useEffect(() => {
    let isCancelled = false

    async function updateCurrentRealmlist(): Promise<void> {
      try {
        if (wowPath && isPathValid) {
          const content = await window.api.readCurrentRealmlist()
          if (!isCancelled) setCurrentRealmlistFileContent(content)
          return
        }

        if (!isCancelled) setCurrentRealmlistFileContent('')
      } catch {
        if (!isCancelled) setCurrentRealmlistFileContent('')
      }
    }

    void updateCurrentRealmlist()

    return () => {
      isCancelled = true
    }
  }, [wowPath, isPathValid])

  useEffect(() => {
    let isCancelled = false

    async function updateCacheSize(): Promise<void> {
      if (!wowPath || !isPathValid) {
        if (!isCancelled) setCacheSize('0 B')
        return
      }

      setIsLoadingCacheSize(true)
      try {
        const size = await window.api.getCacheSize()
        if (!isCancelled) setCacheSize(size)
      } catch {
        if (!isCancelled) setCacheSize('0 B')
      } finally {
        if (!isCancelled) setIsLoadingCacheSize(false)
      }
    }

    void updateCacheSize()

    return () => {
      isCancelled = true
    }
  }, [wowPath, isPathValid])

  useEffect(() => {
    let isCancelled = false

    async function updateScreenshotsInfo(): Promise<void> {
      if (!wowPath || !isPathValid) {
        if (!isCancelled) {
          setScreenshotsInfo({
            exists: false,
            count: 0,
            path: ''
          })
        }
        return
      }

      setIsLoadingScreenshots(true)
      try {
        const info = await window.api.getScreenshotsInfo()
        if (!isCancelled) setScreenshotsInfo(info)
      } catch {
        if (!isCancelled) {
          setScreenshotsInfo({
            exists: false,
            count: 0,
            path: ''
          })
        }
      } finally {
        if (!isCancelled) setIsLoadingScreenshots(false)
      }
    }

    void updateScreenshotsInfo()

    return () => {
      isCancelled = true
    }
  }, [wowPath, isPathValid])

  const handleServerChange = (serverId: string): void => {
    setActiveServerId(serverId)
  }

  const handleApplyRealmlist = async (): Promise<void> => {
    if (!activeServerId) return
    try {
      await window.api.applyRealmlist(activeServerId)
      const content = await window.api.readCurrentRealmlist()
      setCurrentRealmlistFileContent(content)
      setSuccessMessage(t('components.toast.realmlistApplied'))
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.applyRealmlistError'))
    }
  }

  const handleDeleteRealmlist = (): void => {
    const selectedServer = servers.find((s) => s.id === activeServerId)
    if (!selectedServer || !selectedServer.isCustom) return

    setConfirmModal({
      message: t('pages.home.deleteRealmlistConfirm', {
        server: `${selectedServer.name} - ${selectedServer.realmlist}`
      }),
      onConfirm: () => {
        void deleteCustomRealmlist(selectedServer.id)
      }
    })
  }

  const deleteCustomRealmlist = async (serverId: string): Promise<void> => {
    try {
      await window.api.removeCustomServer(serverId)
      const updatedServers = await window.api.getServers()
      setServers(updatedServers)
      const newActiveId = await window.api.getActiveServerId()
      setActiveServerId(newActiveId)
      setConfirmModal(null)
      setSuccessMessage(t('components.toast.realmlistDeleted'))
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.deleteServerError'))
    }
  }

  const handleAddCustomServer = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const name = newServerName.trim()
    const realmlist = newServerRealmlist.trim()

    if (!name || !realmlist) {
      showMessageError(t('pages.home.completeRealmlistFields'))
      return
    }

    try {
      const createdServer = await window.api.addCustomServer({ name, realmlist })
      const updatedServers = await window.api.getServers()
      setServers(updatedServers)
      setActiveServerId(createdServer.id)
      setNewServerName('')
      setNewServerRealmlist('')
      setIsAddRealmModalOpen(false)
      setSuccessMessage(t('components.toast.realmlistAdded'))
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.addRealmlistError'))
    }
  }

  const handleOpenEditRealmlist = (): void => {
    const serverToEdit = servers.find((s) => s.id === activeServerId)
    if (!serverToEdit?.isCustom) return

    setEditServerName(serverToEdit.name)
    setEditServerRealmlist(serverToEdit.realmlist)
    setIsEditRealmModalOpen(true)
  }

  const handleUpdateCustomServer = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const serverToEdit = servers.find((s) => s.id === activeServerId)
    if (!serverToEdit?.isCustom) return

    const name = editServerName.trim()
    const realmlist = editServerRealmlist.trim()

    if (!name || !realmlist) {
      showMessageError(t('pages.home.completeRealmlistFields'))
      return
    }

    try {
      const updatedServer = await window.api.updateCustomServer(serverToEdit.id, {
        name,
        realmlist
      })
      const updatedServers = await window.api.getServers()
      setServers(updatedServers)
      setActiveServerId(updatedServer.id)
      setEditServerName('')
      setEditServerRealmlist('')
      setIsEditRealmModalOpen(false)
      setSuccessMessage(t('components.toast.realmlistUpdated'))
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.updateRealmlistError'))
    }
  }

  const handleValidateAndSave = async (pathToCheck: string): Promise<void> => {
    if (!isEditing) return

    setIsEditing(false)
    if (!pathToCheck.trim()) {
      setIsPathValid(null)
      return
    }

    const wasSaved = await window.api.saveWowDirectory(pathToCheck)
    setIsPathValid(wasSaved)
    if (wasSaved) {
      setSuccessMessage(t('components.toast.wowPathSaved'))
    }
  }

  const handleSelectPath = async (): Promise<void> => {
    try {
      const path = await window.api.selectWowDirectory()
      if (path) {
        setWowPath(path)
        setIsPathValid(true)
        setIsEditing(false)
        setSuccessMessage(t('components.toast.wowPathSaved'))
      }
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.selectPathError'))
    }
  }

  const handleLaunchGame = async (): Promise<void> => {
    if (!isPathValid) {
      showMessageError(t('pages.home.invalidGamePath'))
      return
    }

    try {
      const result = await window.api.launchGame()

      if (result.cacheSizeAfterClear) {
        setCacheSize(result.cacheSizeAfterClear)
      }

      if (result.cacheWarning) {
        showMessageError(result.cacheWarning)
      }
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.launchGameError'))
    }
  }

  const handleOpenWowDirectory = async (): Promise<void> => {
    try {
      await window.api.openWowDirectory()
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.openWowDirectoryError'))
    }
  }

  const handleOpenWtfBackupFolder = async (): Promise<void> => {
    try {
      await window.api.openWtfBackupFolder()
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.openBackupFolderError'))
    }
  }

  const handleOpenScreenshotsFolder = async (): Promise<void> => {
    try {
      await window.api.openScreenshotsFolder()
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.openScreenshotsError'))
    }
  }

  const handleShowDiskUsage = async (): Promise<void> => {
    setIsDiskUsageModalOpen(true)
    setIsLoadingDiskUsage(true)
    setDiskUsageSummary(null)

    try {
      const summary = await window.api.getDiskUsageSummary()
      setDiskUsageSummary(summary)
    } catch (err: unknown) {
      setIsDiskUsageModalOpen(false)
      showCaughtError(err, t('pages.home.diskUsageError'))
    } finally {
      setIsLoadingDiskUsage(false)
    }
  }

  const handleBackupWtf = (): void => {
    setBackupState('confirm')
  }

  const createWtfBackup = async (): Promise<void> => {
    setBackupState('loading')
    try {
      await window.api.backupWtf()
      const hasBackup = await window.api.hasWtfBackup()
      setHasWtfBackup(hasBackup)
      setBackupState(null)
      setSuccessMessage(t('components.toast.backupCreated'))
    } catch (err: unknown) {
      setBackupState(null)
      showCaughtError(err, t('pages.home.backupError'))
    }
  }

  const handleRestoreWtf = (): void => {
    setRestoreState('confirm')
  }

  const restoreWtfBackup = async (): Promise<void> => {
    setRestoreState('loading')
    try {
      await window.api.restoreWtfBackup()
      setRestoreState(null)
      setSuccessMessage(t('components.toast.wtfRestored'))
    } catch (err: unknown) {
      setRestoreState(null)
      showCaughtError(err, t('pages.home.restoreError'))
    }
  }

  const handleClearCache = (): void => {
    setConfirmModal({
      message: t('pages.home.clearCacheConfirm', { size: cacheSize }),
      onConfirm: () => {
        void clearCache()
      }
    })
  }

  const clearCache = async (): Promise<void> => {
    setIsClearingCache(true)
    try {
      const size = await window.api.clearCache()
      setCacheSize(size)
      setConfirmModal(null)
      setSuccessMessage(t('components.toast.cacheCleaned'))
    } catch (err: unknown) {
      showCaughtError(err, t('pages.home.clearCacheError'))
    } finally {
      setIsClearingCache(false)
    }
  }

  const selectedServer = servers.find((s) => s.id === activeServerId)
  const isApplied = ((): boolean => {
    if (!selectedServer) return false
    if (!currentRealmlistFileContent) return false
    const cleanContent = currentRealmlistFileContent.replace(/\s+/g, '').toLowerCase()
    const cleanRealmlist = `setrealmlist${selectedServer.realmlist}`
      .replace(/\s+/g, '')
      .toLowerCase()
    return cleanContent.includes(cleanRealmlist)
  })()

  return (
    <div className="font-ui absolute inset-x-0 bottom-0 top-32 z-10 flex flex-col overflow-hidden text-sm text-gray-300 select-none">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 144, 79, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 144, 79, 0.8);
        }
      `}</style>

      <div className="flex-1 flex flex-row gap-4 px-3 py-3 min-h-0">
        <div className="flex-[3] flex flex-col bg-black/60 min-h-0 relative">
          <div className="py-2 flex justify-center items-center border-b border-transparent relative">
            <span className="font-display text-cyan-300 text-lg px-8 relative drop-shadow-[0_0_7px_rgba(103,232,249,0.55)]">
              {t('pages.home.newsTitle')}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]"></span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]"></span>
            </span>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div className="custom-scrollbar h-full overflow-y-auto p-4 pt-1 pb-24">
              <div className="max-w-[560px]">
                <h3 className="font-display text-xl leading-7 text-cyan-100">
                  {activeStory.title}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-[14px] font-semibold leading-6 text-gray-300/90">
                  {activeStory.content}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 bottom-4 left-4 max-w-[560px]">
              <p className="text-[13px] font-bold leading-6 text-cyan-100 drop-shadow-[0_0_8px_rgba(103,232,249,0.45)]">
                {activeStory.tip}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-[2] max-w-sm flex flex-col gap-3 min-h-0 h-full overflow-hidden">
          <div className="bg-black/60 p-3 flex flex-col shrink-0">
            <h2 className="font-display text-cyan-300 text-center text-lg mb-1 drop-shadow-[0_0_7px_rgba(103,232,249,0.55)]">
              {t('pages.home.serverTitle')}
            </h2>
            <div className="flex flex-col gap-2 px-2">
              <div className="relative flex items-center">
                <select
                  value={activeServerId}
                  onChange={(e) => handleServerChange(e.target.value)}
                  className="w-full bg-[#050a12] text-cyan-100 text-sm rounded-sm pl-3 pr-14 py-2 appearance-none outline-none focus:border-cyan-400/60 hover:border-cyan-500/50 transition-colors cursor-pointer shadow-[inset_0_0_8px_rgba(0,255,255,0.02)] border border-cyan-900/30"
                >
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} - {server.realmlist}
                    </option>
                  ))}
                </select>
                <div className="absolute right-7 flex items-center pointer-events-none">
                  {isApplied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <XIcon size={14} className="text-red-500" />
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-cyan-600">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApplyRealmlist}
                  disabled={!isPathValid || isApplied}
                  className="flex-1 flex cursor-pointer items-center justify-center gap-1 bg-[#0a2615] enabled:hover:bg-[#113b22] border border-green-900/50 enabled:hover:border-green-400/60 text-green-400 enabled:hover:text-green-200 transition-all py-1.5 rounded-sm text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pages.home.apply')}
                </button>
                <button
                  onClick={handleOpenEditRealmlist}
                  disabled={!selectedServer?.isCustom}
                  className="flex-1 flex cursor-pointer items-center justify-center gap-1 bg-[#1f1906] enabled:hover:bg-[#2d2408] border border-yellow-900/50 enabled:hover:border-yellow-500/50 text-yellow-500 enabled:hover:text-yellow-200 py-1.5 rounded-sm text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                  {t('pages.home.modify')}
                </button>
                <button
                  onClick={handleDeleteRealmlist}
                  disabled={!selectedServer?.isCustom}
                  className="flex-1 flex cursor-pointer items-center justify-center gap-1 bg-[#1a0a0a] enabled:hover:bg-[#2e0f0f] border border-red-900/50 enabled:hover:border-red-500/50 text-red-400 enabled:hover:text-red-200 py-1.5 rounded-sm text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                  {t('pages.home.delete')}
                </button>
              </div>

              <button
                onClick={() => setIsAddRealmModalOpen(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#0a1526] hover:bg-[#11223b] border border-cyan-900/50 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-200 transition-all px-2.5 py-2 rounded-sm group mt-1 text-sm font-medium"
              >
                <Plus
                  size={16}
                  className="text-cyan-600 group-hover:text-cyan-400 transition-colors"
                />
                <span>{t('pages.home.addRealmlist')}</span>
              </button>
            </div>
          </div>

          <div className="bg-black/60 p-3 flex-1 min-h-0 overflow-hidden">
            <h2 className="font-display text-cyan-300 text-center text-lg mb-2 -translate-y-1 drop-shadow-[0_0_7px_rgba(103,232,249,0.55)]">
              {t('pages.home.toolsTitle')}
            </h2>
            <div className="flex flex-col gap-2 px-2">
              <div className="flex items-center justify-between bg-[#050a12] border border-cyan-900/30 p-2 rounded-sm shadow-[inset_0_0_8px_rgba(0,255,255,0.02)]">
                <span className="text-gray-300 flex items-center gap-2">
                  <span className="text-base">🧹</span> {t('pages.home.cache')}:{' '}
                  {isLoadingCacheSize ? t('pages.home.calculating') : cacheSize}
                </span>
                <button
                  onClick={handleClearCache}
                  disabled={!isPathValid || isClearingCache}
                  className="h-7 w-20 bg-[#1a0a0a] enabled:hover:bg-[#2e0f0f] border border-red-900/50 enabled:hover:border-red-500/50 text-red-400 enabled:hover:text-red-200 transition-all px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearingCache ? t('pages.home.clearing') : t('pages.home.clean')}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#050a12] border border-cyan-900/30 p-2 rounded-sm shadow-[inset_0_0_8px_rgba(0,255,255,0.02)]">
                <span className="text-gray-300 flex items-center gap-2">
                  <span className="text-base">📦</span> {t('pages.home.diskUsage')}
                </span>
                <button
                  onClick={handleShowDiskUsage}
                  disabled={!isPathValid || isLoadingDiskUsage}
                  className="h-7 w-20 bg-[#0a1526] enabled:hover:bg-[#11223b] border border-cyan-900/50 enabled:hover:border-cyan-400/60 text-cyan-400 enabled:hover:text-cyan-200 transition-all px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoadingDiskUsage ? t('pages.home.calculating') : t('pages.home.view')}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#050a12] border border-cyan-900/30 p-2 rounded-sm shadow-[inset_0_0_8px_rgba(0,255,255,0.02)]">
                <span className="text-gray-300 flex items-center gap-2">
                  <span className="text-base">💾</span>
                  <span>WTF</span>
                  {hasWtfBackup ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <XIcon size={16} className="text-red-500" />
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenWtfBackupFolder}
                    title={t('pages.home.openBackupFolder')}
                    aria-label={t('pages.home.openBackupFolder')}
                    className="flex h-7 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-gray-500 transition-all hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FolderOpen size={14} />
                  </button>
                  <button
                    onClick={handleBackupWtf}
                    disabled={!isPathValid || backupState === 'loading'}
                    className="h-7 w-20 bg-[#0a2615] enabled:hover:bg-[#113b22] border border-green-900/50 enabled:hover:border-green-400/60 text-green-400 enabled:hover:text-green-200 transition-all px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('pages.home.backup')}
                  </button>
                  <button
                    onClick={handleRestoreWtf}
                    disabled={!isPathValid || !hasWtfBackup || restoreState === 'loading'}
                    className="h-7 w-20 bg-[#1f1906] enabled:hover:bg-[#2d2408] border border-yellow-900/50 enabled:hover:border-yellow-500/50 text-yellow-500 enabled:hover:text-yellow-200 transition-all px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('pages.home.restore')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#050a12] border border-cyan-900/30 p-2 rounded-sm shadow-[inset_0_0_8px_rgba(0,255,255,0.02)]">
                <span className="text-gray-300 flex items-center gap-2">
                  <span className="text-base">📸</span> {t('pages.home.screenshots')}:{' '}
                  {isLoadingScreenshots ? t('pages.home.calculating') : screenshotsInfo.count}
                </span>
                <button
                  onClick={handleOpenScreenshotsFolder}
                  disabled={!isPathValid || !screenshotsInfo.exists}
                  className="h-7 w-20 bg-[#1a1c23] enabled:hover:bg-[#252936] border border-gray-600/50 enabled:hover:border-cyan-400/50 text-gray-300 enabled:hover:text-cyan-200 transition-all px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('pages.home.open')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[88px] flex items-end gap-4 px-3 pb-4">
        <div className="flex flex-[3] flex-col gap-2">
          <div className="flex h-[72px] flex-col justify-center bg-black/60 px-3">
            <div className="mb-3 flex -translate-y-1 items-center justify-between gap-3">
              <label className="block text-xs text-gray-400">{t('pages.home.wowPathLabel')}</label>
              <button
                type="button"
                onClick={handleOpenWowDirectory}
                disabled={!wowPath || isPathValid !== true}
                className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-500 transition-colors enabled:hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <FolderOpen size={14} />
                <span>{t('pages.home.openFolder')}</span>
              </button>
            </div>
            <div className="flex h-8 overflow-hidden rounded-sm border border-cyan-900/50 bg-[#050a12]">
              <div className="flex flex-1 items-center overflow-hidden px-3">
                <input
                  type="text"
                  value={wowPath}
                  onChange={(e) => {
                    setWowPath(e.target.value)
                    setIsEditing(true)
                    setIsPathValid(null)
                  }}
                  onBlur={() => handleValidateAndSave(wowPath)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  placeholder={t('pages.home.wowPathPlaceholder')}
                  className="w-full bg-transparent text-cyan-100/70 outline-none placeholder-cyan-900/50 truncate"
                  spellCheck={false}
                />
                {isEditing && (
                  <Loader2 size={16} className="ml-2 text-cyan-500 animate-spin flex-shrink-0" />
                )}
                {!isEditing && wowPath && isPathValid === true && (
                  <Check size={16} className="ml-2 text-green-500 flex-shrink-0" />
                )}
                {!isEditing && wowPath && isPathValid === false && (
                  <XIcon size={16} className="ml-2 text-red-500 flex-shrink-0" />
                )}
              </div>
              <button
                onClick={handleSelectPath}
                className="cursor-pointer border-l border-cyan-900/50 bg-[#050a12] px-3 text-cyan-500 transition-all hover:bg-[#11223b] hover:text-cyan-200"
              >
                ...
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-[2] max-w-sm items-end justify-end h-full relative">
          <button
            onClick={handleLaunchGame}
            disabled={isPathValid !== true}
            className="w-48 h-[72px] cursor-pointer bg-gradient-to-b from-[#29b6f6] to-[#0277bd] enabled:hover:from-[#4fc3f7] enabled:hover:to-[#0288d1] shadow-[0_0_20px_rgba(41,182,246,0.4)] border border-cyan-300/40 rounded-sm flex justify-center items-center relative overflow-hidden transition-all enabled:active:scale-[0.98] group disabled:cursor-not-allowed disabled:from-[#303743] disabled:to-[#171b22] disabled:border-gray-600/40 disabled:shadow-none disabled:opacity-70"
          >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></div>
            <span className="font-display text-white text-2xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10 relative">
              {t('pages.home.play')}
            </span>
          </button>
        </div>
      </div>

      {isAddRealmModalOpen &&
        createPortal(
          <AddRealmlistModal
            serverName={newServerName}
            serverRealmlist={newServerRealmlist}
            onServerNameChange={setNewServerName}
            onServerRealmlistChange={setNewServerRealmlist}
            onClose={() => setIsAddRealmModalOpen(false)}
            onSubmit={handleAddCustomServer}
          />,
          document.body
        )}

      {isEditRealmModalOpen &&
        createPortal(
          <AddRealmlistModal
            title={t('components.modals.editRealmlist')}
            serverName={editServerName}
            serverRealmlist={editServerRealmlist}
            onServerNameChange={setEditServerName}
            onServerRealmlistChange={setEditServerRealmlist}
            onClose={() => setIsEditRealmModalOpen(false)}
            onSubmit={handleUpdateCustomServer}
          />,
          document.body
        )}

      {confirmModal &&
        createPortal(
          <ConfirmModal
            message={confirmModal.message}
            onCancel={() => setConfirmModal(null)}
            onConfirm={confirmModal.onConfirm}
          />,
          document.body
        )}

      {backupState &&
        createPortal(
          <BackupModal
            backupState={backupState}
            onCancel={() => setBackupState(null)}
            onConfirm={() => {
              void createWtfBackup()
            }}
          />,
          document.body
        )}

      {restoreState &&
        createPortal(
          <RestoreWtfModal
            restoreState={restoreState}
            onCancel={() => setRestoreState(null)}
            onConfirm={() => {
              void restoreWtfBackup()
            }}
          />,
          document.body
        )}

      {isDiskUsageModalOpen &&
        createPortal(
          <DiskUsageModal
            isLoading={isLoadingDiskUsage}
            summary={diskUsageSummary}
            onClose={() => setIsDiskUsageModalOpen(false)}
          />,
          document.body
        )}

      {messageError &&
        createPortal(
          <MessageErrorModal message={messageError} onClose={() => setMessageError(null)} />,
          document.body
        )}

      {isUnexpectedErrorOpen &&
        createPortal(<ErrorModal onClose={() => setIsUnexpectedErrorOpen(false)} />, document.body)}

      {successMessage && createPortal(<SuccessToast message={successMessage} />, document.body)}
    </div>
  )
}

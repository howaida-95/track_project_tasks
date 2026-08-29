import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

function subscribeToOnlineStatus(onStoreChange: () => void) {
  return onlineManager.subscribe(onStoreChange)
}

function getOnlineSnapshot() {
  return onlineManager.isOnline()
}

function getServerOnlineSnapshot() {
  return true
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  )

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100"
    >
      You are offline. Changes will resume when your connection returns.
    </div>
  )
}

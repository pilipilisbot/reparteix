const STORAGE_PREFIX = 'reparteix:sync-passphrase:'

function storageKey(groupId: string): string {
  return `${STORAGE_PREFIX}${groupId}`
}

export function loadStoredSyncPassphrase(groupId: string): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(storageKey(groupId)) ?? ''
}

export function saveStoredSyncPassphrase(groupId: string, passphrase: string): void {
  if (typeof window === 'undefined') return

  const key = storageKey(groupId)
  if (passphrase.trim()) {
    window.localStorage.setItem(key, passphrase)
  } else {
    window.localStorage.removeItem(key)
  }
}

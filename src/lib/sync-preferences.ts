import { createSyncConfig, DEFAULT_SYNC_CONFIG, type SyncConfigOverrides } from '@/infra/sync/config'

const STORAGE_KEY = 'reparteix-sync-preferences'

export interface SyncPreferencesDraft {
  peerJsHost: string
  peerJsPort: string
  peerJsPath: string
  peerJsSecure: boolean
  stunUrls: string
}

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function getDefaultSyncPreferencesDraft(): SyncPreferencesDraft {
  return {
    peerJsHost: DEFAULT_SYNC_CONFIG.peerJs.host,
    peerJsPort: String(DEFAULT_SYNC_CONFIG.peerJs.port),
    peerJsPath: DEFAULT_SYNC_CONFIG.peerJs.path,
    peerJsSecure: DEFAULT_SYNC_CONFIG.peerJs.secure,
    stunUrls: DEFAULT_SYNC_CONFIG.iceServers
      .map((server) => server.urls)
      .flatMap((urls) => Array.isArray(urls) ? urls : [urls])
      .join('\n'),
  }
}

export function loadSyncPreferencesDraft(): SyncPreferencesDraft {
  const fallback = getDefaultSyncPreferencesDraft()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<SyncPreferencesDraft>
    return {
      peerJsHost: typeof parsed.peerJsHost === 'string' ? parsed.peerJsHost : fallback.peerJsHost,
      peerJsPort: typeof parsed.peerJsPort === 'string' ? parsed.peerJsPort : fallback.peerJsPort,
      peerJsPath: typeof parsed.peerJsPath === 'string' ? parsed.peerJsPath : fallback.peerJsPath,
      peerJsSecure: typeof parsed.peerJsSecure === 'boolean' ? parsed.peerJsSecure : fallback.peerJsSecure,
      stunUrls: typeof parsed.stunUrls === 'string' ? parsed.stunUrls : fallback.stunUrls,
    }
  } catch {
    return fallback
  }
}

export function saveSyncPreferencesDraft(draft: SyncPreferencesDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* localStorage unavailable */
  }
}

export function clearSyncPreferencesDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* localStorage unavailable */
  }
}

export function draftToSyncConfigOverrides(draft: SyncPreferencesDraft): SyncConfigOverrides {
  const fallback = createSyncConfig()
  const port = Number.parseInt(draft.peerJsPort.trim(), 10)
  const iceServers = draft.stunUrls
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ urls: url }))

  return {
    peerJs: {
      host: draft.peerJsHost.trim() || fallback.peerJs.host,
      port: Number.isFinite(port) && port > 0 ? port : fallback.peerJs.port,
      path: normalizePath(draft.peerJsPath),
      secure: draft.peerJsSecure,
    },
    iceServers: iceServers.length > 0 ? iceServers : fallback.iceServers,
  }
}

export function loadSyncConfigOverrides(): SyncConfigOverrides {
  return draftToSyncConfigOverrides(loadSyncPreferencesDraft())
}

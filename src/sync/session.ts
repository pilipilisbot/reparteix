import * as Y from 'yjs'
import {
  applyEncryptedUpdate,
  exportEncryptedUpdate,
  type GroupSnapshot,
  readGroupSnapshot,
} from './poc'
import type { SyncTransportPeer } from './transport'

interface SyncWireMessage {
  type: 'sync-update'
  iv: string
  payload: string
}

interface SyncSessionState {
  doc: Y.Doc
  groupKey: Uint8Array
  peer: SyncTransportPeer
  unsubscribe?: () => void
}

export interface SyncSession {
  start(): void
  stop(): void
  pushState(): Promise<void>
  snapshot(): GroupSnapshot
}

export function createSyncSession(
  doc: Y.Doc,
  groupKey: Uint8Array,
  peer: SyncTransportPeer,
): SyncSession {
  const state: SyncSessionState = {
    doc,
    groupKey,
    peer,
  }

  return {
    start() {
      state.unsubscribe = state.peer.subscribe((message) => {
        void (async () => {
          const parsed = JSON.parse(message) as SyncWireMessage
          if (parsed.type !== 'sync-update') return
          await applyEncryptedUpdate(state.doc, { iv: parsed.iv, payload: parsed.payload }, state.groupKey)
        })()
      })
    },

    stop() {
      state.unsubscribe?.()
    },

    async pushState() {
      const envelope = await exportEncryptedUpdate(state.doc, state.groupKey)
      const message: SyncWireMessage = {
        type: 'sync-update',
        ...envelope,
      }
      state.peer.send(JSON.stringify(message))
    },

    snapshot() {
      return readGroupSnapshot(state.doc)
    },
  }
}

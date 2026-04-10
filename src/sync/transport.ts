export interface SyncTransportPeer {
  id: string
  send(message: string): void
  subscribe(handler: (message: string) => void): () => void
}

export interface SyncTransport {
  connect(peerId: string): SyncTransportPeer
}

export interface InMemoryPeerOptions {
  peerId: string
  remotePeerId: string
}

interface InMemoryPeerState {
  handlers: Set<(message: string) => void>
  getRemote: () => InMemoryPeer | undefined
}

type InMemoryPeer = SyncTransportPeer & InMemoryPeerState & {
  receive(message: string): void
}

function createInMemoryPeer(
  id: string,
  getRemote: () => InMemoryPeer | undefined,
): InMemoryPeer {
  const state: InMemoryPeerState = {
    handlers: new Set<(message: string) => void>(),
    getRemote,
  }

  return {
    id,
    ...state,
    send(message: string) {
      const remote = state.getRemote()
      if (!remote) return
      remote.receive(message)
    },
    subscribe(handler: (message: string) => void) {
      state.handlers.add(handler)
      return () => state.handlers.delete(handler)
    },
    receive(message: string) {
      for (const handler of state.handlers) {
        handler(message)
      }
    },
  }
}

export function createInMemorySyncTransport(): SyncTransport {
  const peers = new Map<string, InMemoryPeer>()

  return {
    connect(peerId: string): SyncTransportPeer {
      const existing = peers.get(peerId)
      if (existing) return existing

      const peer = createInMemoryPeer(peerId, () => peers.get(peerId === 'a' ? 'b' : 'a'))
      peers.set(peerId, peer)
      return peer
    },
  }
}

export function pairInMemoryTransport(options: InMemoryPeerOptions[]): SyncTransport {
  const transport = createInMemorySyncTransport()
  for (const option of options) {
    transport.connect(option.peerId)
    transport.connect(option.remotePeerId)
  }
  return transport
}

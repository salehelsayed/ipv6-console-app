import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webTransport } from '@libp2p/webtransport'
import { kadDHT } from '@libp2p/kad-dht'
import { getPublicIps } from './utils/getPublicIp'
import dotenv from 'dotenv'

// Load environment variables from .env file if present
dotenv.config()

// Retrieve the WebSocket port from environment variables or default to 15000
const WEBSOCKET_PORT = process.env.LIBP2P_WS_PORT || 15000

export async function createLibp2pConfig() {
  const { ipv4, ipv6 } = await getPublicIps()

  return {
    addresses: {
      listen: [
        `/ip4/0.0.0.0/tcp/${WEBSOCKET_PORT}/ws`, // Configurable port
        `/ip6/::/tcp/${WEBSOCKET_PORT}/ws`,      // Configurable port for IPv6
        "/p2p-circuit",
        "/webrtc"
      ],
      announce: [
        `/ip4/${ipv4}/tcp/${WEBSOCKET_PORT}/ws`, // Must match the listen port
        ipv6 !== 'Unavailable' ? `/ip6/${ipv6}/tcp/${WEBSOCKET_PORT}/ws` : null
      ].filter(Boolean)
    },
    transports: [
      webSockets(),
      webRTC(),
      circuitRelayTransport(),
      webTransport()
    ],
    peerDiscovery: [
      kadDHT()
    ],
    services: [
      identify()
    ],
    connectionEncrypters: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ]
  }
}

export default createLibp2pConfig
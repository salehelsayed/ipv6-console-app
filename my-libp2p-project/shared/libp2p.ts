import { tcp } from '@libp2p/tcp'
import { identify } from '@libp2p/identify'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { kadDHT } from '@libp2p/kad-dht'
import { getPublicIps } from './utils/getPublicIp'

interface Libp2pConfigOptions {
  listenPort?: number
}

export async function createLibp2pConfig(options?: Libp2pConfigOptions) {
  const { ipv4, ipv6 } = await getPublicIps()

  console.log(`My public IPv4 is: ${ipv4}`)
  console.log(`My public IPv6 is: ${ipv6}`)

  const listenPort = options?.listenPort || 8080

  return {
    addresses: {
      listen: [
        `/ip4/0.0.0.0/tcp/${listenPort}`,
        `/ip6/::/tcp/${listenPort}`
      ],
      announce: [
        `/ip4/${ipv4}/tcp/${listenPort}`,
        ipv6 !== 'Unavailable' ? `/ip6/${ipv6}/tcp/${listenPort}` : null
      ].filter(Boolean)
    },
    transports: [
      tcp()
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
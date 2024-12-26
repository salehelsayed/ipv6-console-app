import { multiaddr } from "@multiformats/multiaddr"
import { createLibp2p } from "libp2p"
import createLibp2pConfig from "../../shared/libp2p"
import { createInterface } from "readline"
import { streamToConsole, stdinToStream } from "../utils/stream";

async function main() {
	try {
		const libp2pConfig = await createLibp2pConfig({ listenPort: 8081 })
		const dialer = await createLibp2p(libp2pConfig)

		await dialer.start()

		dialer.getMultiaddrs().forEach((ma) => {
			console.log(ma.toString())
		})

		// Log a message when a remote peer connects to us
		dialer.addEventListener('peer:connect', (evt) => {
			const remotePeer = evt.detail
			console.log('\nConnected to Peer:', remotePeer.toString())
			console.log('\nExpecting messages from peer...you can type now.')
		})

		// Prompt for the multiaddr
		const readline = createInterface({
			input: process.stdin,
			output: process.stdout
		});

		let targetAddress = await new Promise<string>((resolve) => {
			readline.question('Please enter the multiaddr to dial: ', (addr) => {
				readline.close();
				resolve(addr);
			});
		});

		while (!targetAddress) {
			console.error('A multiaddr is required.\nExample: /ip4/127.0.0.1/tcp/8080/p2p/QmHash..');
			const rl = createInterface({
				input: process.stdin,
				output: process.stdout
			});
			targetAddress = await new Promise<string>((resolve) => {
				rl.question('Please enter the multiaddr to dial: ', (addr) => {
					rl.close();
					resolve(addr);
				});
			});
		}

		// Get the address to be dialed via cli args
		const stream = await dialer.dialProtocol(multiaddr(targetAddress), '/chat/1.0.0')

		// Send stdin to the stream
		stdinToStream(stream)
		// Read the stream and output to console
		streamToConsole(stream)
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}

main()
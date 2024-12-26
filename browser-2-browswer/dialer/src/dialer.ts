import { multiaddr } from "@multiformats/multiaddr"
import { createLibp2p } from "libp2p"
import createLibp2pConfig from "../../shared/libp2p"
import { createInterface } from "readline"
import { streamToConsole } from "../utils/stream";
import { stdinToStream } from "../utils/stream";

(async () => {
	try {
		const config = await createLibp2pConfig();
		const dialer = await createLibp2p(config);

		await dialer.start();
		console.log('Dialer started. Listening on:');
		dialer.getMultiaddrs().forEach((ma) => console.log(ma.toString()));

		// Prompt for the multiaddr to dial
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
			console.error('A multiaddr is required.\nExample: /ip4/127.0.0.1/tcp/15000/ws/p2p/QmHash..');
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

		// Dial the target multiaddr
		const stream = await dialer.dialProtocol(multiaddr(targetAddress), '/chat/1.0.0');

		// Send stdin to the stream
		stdinToStream(stream);
		// Read the stream and output to console
		streamToConsole(stream);

	} catch (error) {
		console.error('Error starting dialer:', error);
	}
})();
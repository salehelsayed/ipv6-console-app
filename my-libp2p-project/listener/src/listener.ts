import { createLibp2p } from './createNode';
import createLibp2pConfig from '../../shared/libp2p';
import { streamToConsole } from '../utils/stream';
import { stdinToStream } from '../utils/stream';

async function main() {
	try {
		const libp2pConfig = await createLibp2pConfig(); // Await the config
		const node = await createLibp2p(libp2pConfig);

		console.log(`Node listening on:`);
		node.getMultiaddrs().forEach((ma) => console.log(ma.toString()));

		// Log a message when a remote peer connects to us
		node.addEventListener('peer:connect', (evt) => {
			const remotePeer = evt.detail;
			console.log('\nConnected to Peer:', remotePeer.toString());
		});

		// Handle messages for the protocol
		await node.handle('/chat/1.0.0', async ({ stream }) => {
			console.log('\nType something to send a message.');
			// Send stdin to the stream
			stdinToStream(stream);
			// Read the stream and output to console
			streamToConsole(stream);
		});
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

main();

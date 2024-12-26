import { streamToConsole } from '../utils/stream';
import { stdinToStream } from '../utils/stream';
import { createLibp2p } from 'libp2p';
import createLibp2pConfig from '../../shared/libp2p';
import { pipe } from 'it-pipe';
import * as lp from 'it-length-prefixed';
import map from 'it-map';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

(async () => {
	try {
		const config = await createLibp2pConfig();
		const node = await createLibp2p(config);

		await node.start();
		console.log('Listener started. Listening on:');
		node.getMultiaddrs().forEach((ma) => console.log(ma.toString()));

		node.addEventListener('peer:connect', async (evt) => {
			console.log('Peer Connect Event Details:', evt.detail); // Debugging statement

			const connection = evt.detail.connection;
			const remotePeer = evt.detail.peer; // Corrected property

			// Check if remotePeer exists
			if (!remotePeer) {
				console.error('Error: Connected peer does not have a valid peer ID.');
				return;
			}

			console.log('\nConnected to Peer:', remotePeer.toString());
			console.log('Expecting messages from peer... you can type now.');

			// Handle the incoming stream for the '/chat/1.0.0' protocol
			try {
				const { stream } = await connection.newStream('/chat/1.0.0');

				// Send stdin to the stream
				stdinToStream(stream);

				// Read from the stream and output to console
				streamToConsole(stream);
			} catch (error) {
				console.error('Error handling new stream:', error);
			}
		});

		// Optionally, handle incoming streams if the listener also dials out
		node.handle('/chat/1.0.0', async ({ stream }) => {
			try {
				console.log('Handling incoming stream on /chat/1.0.0');

				// Send stdin to the stream
				stdinToStream(stream);

				// Read from the stream and output to console
				streamToConsole(stream);
			} catch (error) {
				console.error('Error in protocol handler:', error);
			}
		});

	} catch (error) {
		console.error('Error starting listener:', error);
	}
})();
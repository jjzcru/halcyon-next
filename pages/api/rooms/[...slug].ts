import { getRoomById } from '../../../data/db/RoomDB';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
	try {
		await runMiddleware(req, res, cors);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}

	const { slug } = req.query;
	if (req.method === 'GET') {
		try {
			if (slug.length === 1) {
				await reqGetRoomById(req, res);
				return;
			}
		} catch (e) {
			res.status(400).json({ message: e.message, status: 'error' });
			return;
		}
	}
	res.end(`Post: ${slug.join(', ')}`);
}

async function reqGetRoomById(req, res) {
	const { slug } = req.query;
	const roomId = slug[0];
	const room = await getRoomById(roomId);
	if (room) {
		res.status(200).json({ room, status: 'success' });
		return;
	}
	res.status(404).json({ message: 'Room not found', status: 'error' });
}

import { getRooms } from '../../data/db/RoomDB';
import { getTokenData } from '../../data/services/auth';

export default async function handler(req, res) {
	try {
		await getTokenData(req);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}
	const rooms = await getRooms();
	res.status(200).json({ rooms, status: 'success' });
}

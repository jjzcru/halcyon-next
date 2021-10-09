import { getRooms } from '../../data/db/RoomDB';

export default async function handler(req, res) {
    const rooms =  await getRooms();
	res.status(200).json({ rooms });
}

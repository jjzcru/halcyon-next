import { addReservation, getRoomById } from '../../../data/db/RoomDB';
import { getTokenData } from '../../../data/services/auth';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
	let tokenData;
  try {
		await runMiddleware(req, res, cors);
		tokenData = await getTokenData(req);
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
			} else if (slug.length === 2) {
				if (slug[1] === 'book') {
					await reqAddReservation(req, res, tokenData);
					return;
				}
			}
		} catch (e) {
			res.status(400).json({ message: e.message, status: 'error' });
			return;
		}
	}

  if (req.method === 'POST') {
    try {
			if (slug.length === 2) {
				if (slug[1] === 'book') {
					await reqAddReservation(req, res, tokenData);
					return;
				}
			}
		} catch (e) {
			res.status(400).json({ message: e.message, status: 'error' });
			return;
		}
  }

	res.status(400).json({
		message: 'Not found',
		status: 'error',
	});
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

async function reqAddReservation(req, res, tokenData) {
	const { slug } = req.query;
	const roomId = slug[0];
	const employeeId = tokenData.id;
	const { body } = req;
	const { time } = body;
	const success = await addReservation(employeeId, time, roomId);
	if (success) {
		res.status(200).json({ status: 'success' });
		return;
	}
	res.status(404).json({ message: 'Room not found', status: 'error' });
}

async function reqUpdateReservation(req, res, tokenData) {
  
}

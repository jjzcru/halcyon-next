import moment from 'moment-timezone';
import {
	addReservation,
	cancelReservation,
	getRoomById,
	updateReservation,
} from '../../../data/db/RoomDB';
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
				} else if (slug[1] === 'update') {
					await reqUpdateReservation(req, res, tokenData);
					return;
				} else if (slug[1] === 'cancel') {
					await reqCancelReservation(req, res, tokenData);
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
	let tz = req.headers['x-time-zone'] || 'America/New_York';
	let now;
	try {
		now = moment(new Date()).tz(tz);
	} catch (e) {
		tz = 'America/New_York';
		now = moment(new Date()).tz('America/New_York');
	}
	now = now.format('HH:mm');
	if (room) {
		console.log(`Available times:`);
		console.log(room.availableTimes);
		room.availableTimes = room.availableTimes.filter((time) => {
			const timeMoment = moment(time, 'HH:mm');
			return timeMoment.isAfter(moment(now, 'HH:mm'));
		});
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
	let tz = req.headers['x-time-zone'] || 'America/New_York';
	let now;
	try {
		now = moment(new Date()).tz(tz);
	} catch (e) {
		tz = 'America/New_York';
		now = moment(new Date()).tz('America/New_York');
	}
	const timeMoment = moment(time, 'HH:mm').tz(tz);
	if (timeMoment.isAfter(now)) {
	}
	const success = await addReservation(employeeId, time, roomId);
	if (success) {
		res.status(200).json({ status: 'success' });
		return;
	}
	res.status(404).json({ message: 'Room not found', status: 'error' });
}

async function reqUpdateReservation(req, res, tokenData) {
	const { slug } = req.query;
	const roomId = slug[0];
	const employeeId = tokenData.id;
	const { body } = req;
	const { time } = body;
	const success = await updateReservation(employeeId, time, roomId);
	if (success) {
		res.status(200).json({ status: 'success' });
		return;
	}
	res.status(404).json({ message: 'Room not found', status: 'error' });
}

async function reqCancelReservation(req, res, tokenData) {
	const { slug } = req.query;
	const roomId = slug[0];
	const employeeId = tokenData.id;
	const success = await cancelReservation(employeeId, roomId);
	if (success) {
		res.status(200).json({ status: 'success' });
		return;
	}
	res.status(404).json({ message: 'Room not found', status: 'error' });
}

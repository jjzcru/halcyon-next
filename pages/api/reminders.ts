import moment from 'moment';
import { getReminders, updateReminderByType } from '../../data/db/ReminderDB';
import { getTokenData } from '../../data/services/auth';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
	let tokenData;
	try {
		await runMiddleware(req, res, cors);
		tokenData = await getTokenData(req);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}

	if (req.method === 'GET') {
		let reminders = [];
		try {
			reminders = await getReminders(tokenData.id);
		} catch (e) {
			res.status(500).json({ message: e.message, status: 'error' });
			return;
		}
		res.status(200).json({ reminders, status: 'success' });
		return;
	}

	if (req.method === 'PUT') {
		await updateReminder(tokenData.id, req, res);
		return;
	}

	res.status(404).json({
		message: 'Not found',
		status: 'error',
	});
}

async function updateReminder(employeeId, req, res) {
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { type, startAt, endAt, interval } = body;
	if (type !== 'water' && type !== 'break') {
		res.status(400).send({
			status: 'error',
			message: `Type ${type} is an invalid type`,
		});
		return;
	}

	if (!startAt) {
		res.status(400).send({
			status: 'error',
			message: `Missing startAt property`,
		});
		return;
	}

	if (!endAt) {
		res.status(400).send({
			status: 'error',
			message: `Missing endAt property`,
		});
		return;
	}

	if (moment(endAt, 'HH:mm').isSameOrBefore(moment(startAt, 'HH:mm'))) {
		res.status(400).send({
			status: 'error',
			message: `endAt value must be bigger than the startAt value`,
		});
		return;
	}

	if (!interval) {
		res.status(400).send({
			status: 'error',
			message: `Missing interval property or invalid value`,
		});
		return;
	}

	try {
		const reminders = await updateReminderByType(
			employeeId,
			type,
			interval,
			startAt,
			endAt
		);

		if(!reminders.length) {
			res.status(404).send({
				status: 'error',
				message: 'Reminder or employee not found'
			});
			return;
		}

		const reminder = reminders[0];
		res.status(200).json({ reminder, status: 'success' });
	} catch (e) {
		res.status(500).send({
			status: 'error',
			message: e.messge,
		});
	}
}

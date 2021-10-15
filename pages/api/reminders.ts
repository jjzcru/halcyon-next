import { getReminders } from '../../data/db/ReminderDB';
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

	res.status(400).json({
		message: 'Not found',
		status: 'error',
	});
}

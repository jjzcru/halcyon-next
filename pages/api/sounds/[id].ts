import { getSound } from '../../../data/db/SoundDB';
import { getTokenData } from '../../../data/services/auth';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
	try {
		await runMiddleware(req, res, cors);
		await getTokenData(req);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}

	if (req.method === 'GET') {
		const { id } = req.query;
		let sound;
		try {
			sound = await getSound(id);
		} catch (e) {
			res.status(500).json({ message: e.message, status: 'error' });
			return;
		}

		if (!sound) {
			res.status(404).json({
				message: 'Sound not found',
				status: 'error',
			});
			return;
		}

		res.status(200).json({ sound, status: 'success' });
		return;
	}

	res.status(404).json({
		message: 'Not found',
		status: 'error',
	});
}

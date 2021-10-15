import { getSounds, getSoundByType } from '../../data/db/SoundDB';
import { getTokenData } from '../../data/services/auth';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
	try {
		await runMiddleware(req, res, cors);
		await getTokenData(req);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}

	if (req.method === 'GET') {
		let sounds = [];
		const type = req?.query?.type;
		if (type) {
			switch (type) {
				case 'sound':
				case 'song':
				case 'guide':
					sounds = await getSoundByType(req?.query?.type);
					break;
				default:
					res.status(409).json({
						message: 'Invalid sound type',
						status: 'error',
					});
					return;
			}
		} else {
			sounds = await getSounds();
		}
		res.status(200).json({ sounds, status: 'success' });
		return;
	}

	res.status(400).json({
		message: 'Not found',
		status: 'error',
	});
}

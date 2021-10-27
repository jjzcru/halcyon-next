import moment from 'moment-timezone';
import { addEvent, getEvents} from '../../data/db/EventDB';
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

	switch (req.method) {
		case 'POST':
			await addEventReq(tokenData.id, req, res);
			return;
        case 'GET':
            await getEventReq(tokenData.id, res);
            return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getEventReq(employeeId, res) {
    try {
		let events = await getEvents(employeeId);
		res.status(200).json({ events, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function addEventReq(employeeId, req, res) {
    const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

    const { state, category, length } = body;
    if (
		state !== 'completed' &&
		state !== 'cancel'
	) {
		res.status(400).send({
			status: 'error',
			message: `State ${state} is an invalid value`,
		});
		return;
	}

    if (
		category !== 'guided_meditation' &&
		category !== 'meditation' &&
		category !== 'water' &&
		category !== 'break'
	) {
		res.status(400).send({
			status: 'error',
			message: `Category ${category} is an invalid value`,
		});
		return;
	}

    let tz = req.headers['x-time-zone'] || 'America/New_York';
    let now: moment.Moment;
    try {
        now = moment(new Date()).tz(tz);
    } catch(e) {
        tz = 'America/New_York';
        now = moment(new Date()).tz('America/New_York');
    }
    const createdAt = now.toISOString();
	try {
		let event = await addEvent({
            employeeId,
            state,
            category,
            createdAt,
            length
        });
		res.status(200).json({ event, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

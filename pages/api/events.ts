import moment from 'moment-timezone';
import { getAwards, Frequency, Award, addAward } from '../../data/db/AwardDB';
import {
	addEvent,
	Event,
	getEvents,
	Category,
	getEventsInRange,
} from '../../data/db/EventDB';
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
	if (state !== 'completed' && state !== 'cancel') {
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
	} catch (e) {
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
			length,
		});
		if (state === 'completed') {
			await processAchievements({
				now: now.clone(),
				category,
				employeeId,
			});
		}

		res.status(200).json({ event, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function processAchievements({ now, category, employeeId }) {
	await processAwards(now.clone(), category, employeeId);
}

async function processAwards(
	now: moment.Moment,
	category: Category,
	employeeId: string
) {
	let awards = await getAwards(employeeId);
	awards = awards
		.filter((a) => !a.isCompleted)
		.filter((a) => a.category === category);

	const awardMap: Map<Frequency, Array<Award>> = awards.reduce(
		(acc: Map<Frequency, Array<Award>>, award: Award) => {
			const { frequency } = award;
			if (!acc.get(frequency)) {
				acc.set(frequency, []);
			}

			const awds = acc.get(frequency);
			awds.push(award);
			acc.set(frequency, awds);

			return acc;
		},
		new Map()
	);

	const promises = [];

	for (const [freq, awds] of Array.from(awardMap.entries())) {
		promises.push(
			processAwardFrequency(employeeId, freq, awds, now, category)
		);
	}

	await Promise.all(promises);
}

async function processAwardFrequency(
	employeeId: string,
	frequency: Frequency,
	awards: Array<Award>,
	now: moment.Moment,
	category: Category
): Promise<void> {
	let startDate: string, endDate: string;
	if (!awards.length) {
		return;
	}

	const format = 'YYYY-MM-DD';
	switch (frequency) {
		case 'daily':
			startDate = `${now.clone().format(format)}  00:00:00`;
			endDate = `${now.clone().format(format)} 23:59:00`;
			break;
		case 'weekly':
			startDate = now.clone().weekday(1).format(format);
			endDate = now.clone().weekday(7).format(format);
			break;
		case 'monthly':
			startDate = now.clone().startOf('month').format(format);
			endDate = now.clone().endOf('month').format(format);
			return;
			break;
		default:
			startDate = now.clone().startOf('year').format(format);
			endDate = now.clone().endOf('year').format(format);
			break;
	}

	const events: Array<Event> = await getEventsInRange(
		employeeId,
		category,
		startDate,
		endDate
	);

	if (!events.length) {
		return;
	}

	const promises = [];
	for (const award of awards) {
		if (events.length >= award.target) {
			promises.push(
				addAward(employeeId, award.id, now.clone().toISOString())
			);
		}
	}

	await Promise.all(promises);
}

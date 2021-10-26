import moment from 'moment-timezone';
import { addGoal, getGoals } from '../../data/db/GoalDB';
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
		case 'GET':
			await getGoalsReq(tokenData.id, res);
			return;
		case 'POST':
			await addGoalReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getGoalsReq(employeeId, res) {
	try {
		let goals = await getGoals(employeeId);
		res.status(200).json({ goals, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function addGoalReq(employeeId, req, res) {
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { target, category, frequency } = body;
	if (!target) {
		res.status(400).send({
			status: 'error',
			message: `Invalid or missing value for target`,
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

	if (
		frequency !== 'daily' &&
		frequency !== 'weekly' &&
		frequency !== 'monthly' &&
		frequency !== 'yearly'
	) {
		res.status(400).send({
			status: 'error',
			message: `Frequency ${frequency} is an invalid value`,
		});
		return;
	}

	let message: string;

	try {
		const goals = await getGoals(employeeId);
		for (const g of goals) {
			if (g.frequency === frequency && g.category === category) {
				message = `You already have a goal with the category ${category} and frequency ${frequency}`;
				res.status(409).json({ message, status: 'error' });
				return;
			}
		}
		const goal = await addGoal(employeeId, target, category, frequency);
		res.status(200).json({ goal, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

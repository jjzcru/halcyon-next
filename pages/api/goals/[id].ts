import { getGoal, getGoals, updateGoal, deleteGoal } from '../../../data/db/GoalDB';
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

	switch (req.method) {
		case 'GET':
			await getGoalReq(tokenData.id, req, res);
			return;
		case 'PUT':
			await updateGoalReq(tokenData.id, req, res);
			return;
		case 'DELETE':
			await deleteGoalReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getGoalReq(employeeId, req, res) {
	const { id } = req.query;
	try {
		let goal = await getGoal(id, employeeId);
		if (!goal) {
			res.status(404).json({
				message: 'Goal not found',
				status: 'error',
			});
			return;
		}
		res.status(200).json({ goal, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function updateGoalReq(employeeId, req, res) {
	const { id } = req.query;
    const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

    const { target, frequency } = body;
	if (!target) {
		res.status(400).send({
			status: 'error',
			message: `Invalid or missing value for target`,
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

	try {
        let goal = await getGoal(id, employeeId);
        if (!goal) {
			res.status(404).json({
				message: 'Goal not found',
				status: 'error',
			});
			return;
		}
        let goals = await getGoals(employeeId);
        if(!goals.length) {
            res.status(404).json({
				message: 'Goal not found',
				status: 'error',
			});
			return;
        }
        
        const goalSet = new Set([...goals.filter(g => g.category === goal.category).map(g => g.frequency)]);
        let message;
        if(goal.frequency !== frequency && goalSet.has(frequency)) {
            message = `You already have a frequency ${frequency} for that goal`;
			res.status(409).json({ message, status: 'error' });
			return;
        }
        
		goal = await updateGoal(id, employeeId, target, frequency);
		res.status(200).json({ goal, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function deleteGoalReq(employeeId, req, res) {
	const { id } = req.query;
	try {
		let response = await deleteGoal(id, employeeId);
		if (!response) {
			res.status(404).json({
				message: 'Goal not found',
				status: 'error',
			});
			return;
		}
		res.status(200).json({ id: response, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

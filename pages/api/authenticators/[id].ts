import {
	enableAuthenticator,
	deleteAuthenticator,
} from '../../../data/db/EmployeeDB';
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
		case 'PUT':
			await updateGoalReq(tokenData.id, req, res);
			return;
		case 'DELETE':
			await deleteAuthReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}
async function updateGoalReq(employeeId, req, res) {
	try {
		const { id } = req.query;
		const { body } = req;
		if (!body) {
			res.status(400).json({
				message: 'Missing body in the request',
				status: 'error',
			});
			return;
		}
		if (typeof body.isEnabled !== 'boolean') {
			res.status(400).json({
				message: 'Invalid value for "isEnabled" property',
				status: 'error',
			});
			return;
		}
		const { isEnabled } = body;

		

		await enableAuthenticator(id, isEnabled, employeeId);

		res.status(200).json({ isEnabled, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function deleteAuthReq(employeeId, req, res) {
	const { id } = req.query;
	try {
		console.log(`On delete`);
		console.log({
			employeeId, 
			id
		})
		await deleteAuthenticator(employeeId, id);
		res.status(200).json({ status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

import { setEmployeeMFA } from '../../../data/db/EmployeeDB';
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
			await setMFAReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function setMFAReq(employeeId, req, res) {
	try {
		const { body } = req;
		if (!body) {
			res.status(400).json({
				message: 'Missing body in the request',
				status: 'error',
			});
			return;
		}
		if (typeof body.isMFAEnabled !== 'boolean') {
			res.status(400).json({
				message: 'Invalid value for "isDepressed" property',
				status: 'error',
			});
			return;
		}
		const { isMFAEnabled } = body;

		const employee = await setEmployeeMFA(employeeId, isMFAEnabled);
		if (!employee) {
			res.status(404).json({
				message: 'Employee not found',
				status: 'error',
			});
			return;
		}

		res.status(200).json({ isMFAEnabled, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

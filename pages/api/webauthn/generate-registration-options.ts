import {
	// Registration
	generateRegistrationOptions,
	verifyRegistrationResponse,
	// Authentication
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import {
	getEmployeeById,
	setEmployeeCurrentChallenge,
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
		case 'GET':
			await postRegisterReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function postRegisterReq(employeeId: string, req: any, res: any) {
	const { id, email } = await getEmployeeById(employeeId);
	const options = generateRegistrationOptions({
		rpName: 'Halcyon',
		rpID: process.env.WEB_AUTHN_RPID || 'localhost',
		userID: id,
		userName: email,
		// Don't prompt users for additional information about the authenticator
		// (Recommended for smoother UX)
		attestationType: 'indirect',
		// Prevent users from re-registering existing authenticators
		excludeCredentials: [],
		authenticatorSelection: {
			requireResidentKey: true
		}
	});

	await setEmployeeCurrentChallenge(employeeId, options.challenge);

	res.status(200).json({ options, status: 'success' });
}

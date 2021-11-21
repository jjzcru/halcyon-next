import { generateAuthenticationOptions } from '@simplewebauthn/server';
import {
	getEmployeeAuthenticators,
	getEmployeeById,
	authenticate,
	setEmployeeCurrentChallenge,
} from '../../../data/db/EmployeeDB';
import { getSignedToken } from '../../../data/services/auth';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
	try {
		await runMiddleware(req, res, cors);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}
	switch (req.method) {
		case 'GET':
			await getAuthReq(req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getAuthReq(req: any, res: any) {
	const { headers } = req;
	let authentication = headers['authorization'];
	if (!authentication) {
		res.status(401).send({status: 'error', message: 'Missing authorization header'});
		return;
	}

	authentication = authentication.replace('Basic ', '');
	const [email, password] = (new Buffer(authentication, 'base64')).toString().split(':');
	const employee = await authenticate(email, password);
	if (!employee) {
		res.status(401).json({
			message: 'Invalid credentials',
			status: 'error',
		});
		return;
	}

	const authenticators = await getEmployeeAuthenticators(employee.id);
	const allowCredentials: any = authenticators.map((authenticator) => {
		return {
			id: new Buffer(authenticator.credentialId as string, 'base64'),
			type: 'public-key',
		};
	});

	const options = generateAuthenticationOptions({
		rpID: process.env.WEB_AUTHN_RPID || 'localhost',
		allowCredentials,
		userVerification: 'preferred',
	});

	await setEmployeeCurrentChallenge(employee.id, options.challenge);

	res.status(200).json({ options, status: 'success' });
}

import {
	generateAuthenticationOptions,
} from '@simplewebauthn/server';
import {
    getEmployeeAuthenticators,
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
			await getAuthReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getAuthReq(employeeId, req: any, res: any) {
	const authenticators = await getEmployeeAuthenticators(employeeId);
    const allowCredentials: any = authenticators.map((authenticator) => {
        return {
            id: new Buffer(authenticator.credentialId as string, 'base64'),
            type: 'public-key'
        }
    });

    const options = generateAuthenticationOptions({
		rpID: process.env.WEB_AUTHN_RPID || 'localhost',
        allowCredentials,
        userVerification: 'preferred'
	});

    await setEmployeeCurrentChallenge(employeeId, options.challenge);

	res.status(200).json({ options, status: 'success' });
}

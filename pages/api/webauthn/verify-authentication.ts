import {
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import {
	getEmployeeById,
	resetEmployeeCurrentChallenge,
    updateAuthenticator,
    getEmployeeAuthenticators
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
		case 'POST':
			await postAuthReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function postAuthReq(employeeId, req, res) {
	const { body } = req;
	const { challenge } = await getEmployeeById(employeeId);
    let authenticators = await getEmployeeAuthenticators(employeeId);

    authenticators = authenticators.filter((auth) => {
        return auth.attestationId === body.id
    });

    const authenticator: any = authenticators.map(authenticator => {
        return {
            credentialID: authenticator.credentialId,
            counter: authenticator.counter,
            credentialPublicKey: new Buffer(authenticator.publicKey as string, 'base64'),
            transports: authenticators[0].attestationContent.transports
        }
    })[0];
    
	if (!challenge) {
		res.status(409).send({
			status: 'error',
			message: 'No challenge register for this user',
		});
		return;
	}
	let verification;

	const origin = `https://${req.headers.host}`;

	try {
		verification = await verifyAuthenticationResponse({
			credential: body,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: process.env.WEB_AUTHN_RPID || 'localhost',
            authenticator
		});
	} catch (e) {
		console.error(e);
		res.status(400).send({
			status: 'error',
			message: e.message,
		});
		return;
	}

    const { verified, authenticationInfo } = verification;

    const { newCounter } = authenticationInfo;


	if (!verified) {
		res.status(409).send({
			status: 'error',
			message: 'error authorizing the device',
		});
		return;
	}
    await updateAuthenticator(authenticators.map(authenticator => {
        authenticator.counter = newCounter;
        return authenticator;
    })[0])
	await resetEmployeeCurrentChallenge(employeeId);

	res.status(200).json({ verified, status: 'success' });
}

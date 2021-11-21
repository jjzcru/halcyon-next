import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import {
	getEmployeeById,
	resetEmployeeCurrentChallenge,
	updateAuthenticator,
	getEmployeeAuthenticators,
	authenticate,
} from '../../../data/db/EmployeeDB';
import { cors, runMiddleware } from '../../../middleware/cors';
import { origin } from '../../../middleware/webauthn';
import { getSignedToken } from '../../../data/services/auth';

export default async function handler(req, res) {
	try {
		await runMiddleware(req, res, cors);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}
	switch (req.method) {
		case 'POST':
			await postAuthReq(req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function postAuthReq(req, res) {
	const { headers } = req;
	const { body } = req;
	let authentication = headers['authorization'];
	if (!authentication) {
		res.status(401).send({
			status: 'error',
			message: 'Missing authorization header',
		});
		return;
	}
	authentication = authentication.replace('Basic ', '');
	const [email, password] = new Buffer(authentication, 'base64')
		.toString()
		.split(':');
	const employee = await authenticate(email, password);
	if (!employee) {
		res.status(401).json({
			message: 'Invalid credentials',
			status: 'error',
		});
		return;
	}

	const { challenge } = await getEmployeeById(employee.id);
	let authenticators = await getEmployeeAuthenticators(employee.id);

	authenticators = authenticators.filter((auth) => {
		return auth.attestationId === body.id// && auth.isEnabled;
	});

	const authenticator: any = authenticators.map((authenticator) => {
		return {
			credentialID: authenticator.credentialId,
			counter: authenticator.counter,
			credentialPublicKey: new Buffer(
				authenticator.publicKey as string,
				'base64'
			),
			transports: authenticators[0].attestationContent.transports,
		};
	})[0];

	if (!challenge) {
		res.status(409).send({
			status: 'error',
			message: 'No challenge register for this user',
		});
		return;
	}
	let verification;

	try {
		verification = await verifyAuthenticationResponse({
			credential: body,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: process.env.WEB_AUTHN_RPID || 'localhost',
			authenticator,
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
	await updateAuthenticator(
		authenticators.map((authenticator) => {
			authenticator.counter = newCounter;
			return authenticator;
		})[0]
	);
	await resetEmployeeCurrentChallenge(employee.id);

	const { token, expiredAt } = await getSignedToken(employee);

	res.status(200).json({
		verified,
		authToken: token,
		expiredAt: expiredAt,
		message: 'Successfully logged in.',
		status: 'success',
	});
}

import { verifyRegistrationResponse } from '@simplewebauthn/server';
import {
	getAuthenticators,
	getEmployeeById,
	resetEmployeeCurrentChallenge,
	addKey,
} from '../../data/db/EmployeeDB';
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
			await getAuthenticatorsReq(tokenData.id, res);
			return;
		case 'POST':
			await postRegisterReq(tokenData.id, req, res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getAuthenticatorsReq(employeeId: string, res: any) {
	try {
		let authenticators = await getAuthenticators(employeeId);
		res.status(200).json({
			authenticators: authenticators.map((authenticator) => {
				const { id, publicKey, attestationContent, isEnabled } =
					authenticator;
				const pk: string = publicKey as string;

				return {
					id,
					redactedPublicKey: pk.substring(pk.length - 12),
					transports: attestationContent.transports,
					isEnabled,
				};
			}),
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function postRegisterReq(employeeId, req, res) {
	const { body } = req;
	const { challenge } = await getEmployeeById(employeeId);
	if (!challenge) {
		res.status(409).send({
			status: 'error',
			message: 'No challenge register for this user',
		});
		return;
	}
	let verification;

	const origin = process.env.WEB_AUTHN_ORIGIN;

	try {
		verification = await verifyRegistrationResponse({
			credential: body,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: process.env.WEB_AUTHN_RPID || 'localhost',
		});
	} catch (e) {
		console.error(e);
		res.status(400).send({
			status: 'error',
			message: e.message,
		});
		return;
	}

	const { verified, registrationInfo } = verification;

	if (!verified) {
		res.status(409).send({
			status: 'error',
			message: 'error verifiying the device',
		});
		return;
	}

	const { credentialPublicKey, credentialID, counter } = registrationInfo;
	await addKey(
		employeeId,
		credentialPublicKey.toString('base64'),
		credentialID.toString('base64'),
		counter,
		body.id,
		body
	);
	await resetEmployeeCurrentChallenge(employeeId);

	res.status(200).json({ verified, status: 'success' });
}

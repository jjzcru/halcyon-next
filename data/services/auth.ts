import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Employee } from '../db/EmployeeDB';

export async function getSignedToken(employee: Employee): Promise<any> {
	const payload: any = {
		id: employee.id,
	};

	let token: string;
	const dateAmount = 90;
	const dateUnit = 'd';
	const expiresIn = `${dateAmount}${dateUnit}`;

	token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn,
		subject: 'employee',
	});

	const expiredAt = moment(new Date()).add(dateAmount, dateUnit).toDate();

	// Sign with secret
	return {
		token,
		expiredAt,
	};
}

export async function getTokenData(req): Promise<any> {
	const { headers } = req;
	if (!headers['authorization']) {
		throw new Error('Missing authorization header');
	}

	const token = headers['authorization'].replace('Bearer ', '');
	return await decodeToken(token);
}

export async function decodeToken(token: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const cb = async (err: any, decoded: any) => {
			if (err) {
				if (err?.name === 'TokenExpiredError') {
					reject(new Error('Expired token'));
				} else {
					reject(err);
				}
				return;
			}

			try {
				resolve({
					id: decoded.id,
				});
			} catch (e) {
				reject(e);
			}
		};

		try {
			jwt.verify(token, process.env.JWT_SECRET, cb);
		} catch (e) {
			reject(e);
		}
	});
}

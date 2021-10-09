import { authenticate } from '../../../data/db/EmployeeDB';
import { getSignedToken } from '../../../data/services/auth';

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { body } = req;
		const { email, password } = body;
		const employee = await authenticate(email, password);
		if (!employee) {
            res.status(401).json({
				message: 'Invalid credentials',
				status: 'error',
			});
			return 
		}
        const {token, expiredAt} = await getSignedToken(employee)
        res.status(200).json({ 
            auth_token: token,
            expired_at: expiredAt,
            message: 'Successfully logged in.',
            status: 'success'
         });
		return;
	}

    res.status(400).json({ 
        message: 'Not found',
        status: 'error'
     });
}

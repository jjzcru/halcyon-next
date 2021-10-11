import { getEmployeeById } from '../../data/db/EmployeeDB';
import { getEmployeeCurrentReservation } from '../../data/db/RoomDB';
import { getTokenData } from '../../data/services/auth';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
    let tokenData;
    try {
        await runMiddleware(req, res, cors);
        tokenData = await getTokenData(req)
    } catch (e) {
        res.status(400).json({ message: e.message, status: 'error' });
        return;
    }

    if (req.method === 'GET') {
        const employee = await getEmployeeById(tokenData.id);
        res.status(200).json({ employee, status: 'success' });
        return;
    }

    res.status(400).json({
        message: 'Not found',
        status: 'error'
    });
}

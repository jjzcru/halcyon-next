import moment from 'moment-timezone'
import { getRooms } from '../../data/db/RoomDB';
import { getTokenData } from '../../data/services/auth';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, cors);
        await getTokenData(req)
    } catch (e) {
        res.status(400).json({ message: e.message, status: 'error' });
        return;
    }

    if (req.method === 'GET') {
        try {

            await getTokenData(req);
        } catch (e) {
            res.status(400).json({ message: e.message, status: 'error' });
            return;
        }
        let rooms = await getRooms();
        let tz = req.headers['x-time-zone'] || 'America/New_York';
        let now;
        try {
            now = moment(new Date()).tz(tz);
        } catch(e) {
            tz = 'America/New_York';
            now = moment(new Date()).tz('America/New_York');
        }

        console.log(`Now is ${tz}: ${now.format('hh:mm A')}`)

        if(rooms) {
            rooms = rooms.map(room => {
                room.availableTimes = room.availableTimes.filter((time) => {
					const timeMoment = moment(time, 'HH:mm').tz('America/New_York');
                    console.log(`This moment '${timeMoment.format('hh:mm A')}' is greather after ${now.format('hh:mm A')}: ${timeMoment.isAfter(now)}`);
					return timeMoment.isAfter(now);
				});
                return room;
            })
        }
        
        res.status(200).json({ rooms, status: 'success' });
        return;
    }

    res.status(400).json({
        message: 'Not found',
        status: 'error'
    });
}

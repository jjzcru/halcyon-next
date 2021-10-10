import moment from 'moment';
import { runQuery } from './db';

export interface Room {
	id: string;
	name?: string;
	description?: string;
	timeInterval?: number;
	startAvailableTime?: string;
	endAvailableTime?: string;
	availableTimes?: Array<string>;
}

export interface Reservation {
	id?: string;
	employeeId?: string;
	date?: Date;
	startTime?: string;
	endTime?: string;
	meditationRoomId?: string;
}

function mapRoom(row: any): Room {
	if (row.start_available_time) {
		row.start_available_time = row.start_available_time.replace(
			/:\d\d([ ap]|$)/,
			'$1'
		);
	}

	if (row.end_available_time) {
		row.end_available_time = row.end_available_time.replace(
			/:\d\d([ ap]|$)/,
			'$1'
		);
	}

	return {
		id: row.id,
		name: row.room_name,
		description: row.description,
		timeInterval: parseInt(`${row.time_interval}`),
		startAvailableTime: row.start_available_time,
		endAvailableTime: row.end_available_time,
	};
}

function getTimeInRage(start: string, end: string, interval: number) {
	let startTimeMoment = moment(start, 'HH:mm');
	const endTimeMoment = moment(end, 'HH:mm');

	const times = [];
	while (moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes()) {
		const slotTime = startTimeMoment.format('HH:mm');
		times.push(slotTime);

		startTimeMoment = startTimeMoment.add(interval, 'm');
	}

	return times;
}

function mapReservation(row: any): Reservation {
	if (row.start_time) {
		row.start_time = row.start_time.replace(/:\d\d([ ap]|$)/, '$1');
	}

	if (row.end_time) {
		row.end_time = row.end_time.replace(/:\d\d([ ap]|$)/, '$1');
	}

	return {
		id: row.id,
		employeeId: row.employee_id,
		date: row.date_reservation ? new Date(row.date_reservation) : null,
		startTime: row.start_time,
		endTime: row.end_time,
		meditationRoomId: row.meditation_room_id,
	};
}

export async function getRooms(): Promise<Array<Room>> {
	const query = `SELECT * FROM meditation_room;`;
	let { rows } = await runQuery(query);
	const rooms: Array<Room> = rows.map(mapRoom);
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		let availableTimes = new Set(getTimeInRage(
			room.startAvailableTime,
			room.endAvailableTime,
			room.timeInterval
		));
		const reservations = await getReservations(room.id);

        for(const reservation of reservations) {
            if(availableTimes.has(reservation.startTime)) {
                availableTimes.delete(reservation.startTime)
            }
        }

        room.availableTimes = Array.from(availableTimes);
	}
	return rooms;
}

export async function getRoomById(id: string): Promise<Room> {
	const query = `SELECT * FROM meditation_room where id = $1;`;
	let { rows } = await runQuery(query, [id]);
	const rooms: Array<Room> = rows.map(mapRoom);
    if(!rooms.length) {
        return null;
    }
	for (let i = 0; i < rooms.length; i++) {
		const room = rooms[i];
		let availableTimes = new Set(getTimeInRage(
			room.startAvailableTime,
			room.endAvailableTime,
			room.timeInterval
		));
		const reservations = await getReservations(room.id);

        for(const reservation of reservations) {
            if(availableTimes.has(reservation.startTime)) {
                availableTimes.delete(reservation.startTime)
            }
        }

        room.availableTimes = Array.from(availableTimes);
	}
	return rooms[0];
}

export async function getReservations(id: string): Promise<Array<Reservation>> {
	const query = `SELECT * FROM reservation 
    WHERE date_reservation = '${getCurrentDate()}'
    AND meditation_room_id = $1;`;
	let { rows } = await runQuery(query, [id]);
	const reservations = rows.map(mapReservation);
	return reservations;
}

export async function addReservation(
	employeeId: string,
	time: string,
	roomId: string
) {}

export async function getAvailableTimesByRooms() {
	const query = `SELECT * FROM reservation where date_reservation = current_date();`;
	let { rows } = await runQuery(query);
	return rows.map(mapReservation);
}

export async function getRoomReservations(
	id: string
): Promise<Array<Reservation>> {
	const query = `SELECT * FROM reservation where meditation_room_id = $1 
    and date_reservation = '${getCurrentDate()}';`;
	let { rows } = await runQuery(query, [id]);
	return rows.map(mapReservation);
}

function getCurrentDate() {
    return moment().format('YYYY-MM-DD');
}
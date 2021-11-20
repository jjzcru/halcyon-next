import { runQuery } from './db';

export type Category = 'guided_meditation' | 'meditation' | 'water' | 'break';
export type State = 'completed' | 'cancel';

export interface Event {
	id?: string;
	employeeId?: string;
	state?: State;
	category?: Category;
	length?: number;
	createdAt?: Date | string;
}

function mapData(row: any): Event {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
	return {
		id: row.id,
		employeeId: row.employee_id,
        state: row.state,
		category: row.category,
		length: row.length ? parseInt(`${row.length}`) : null,
		createdAt,
	};
}

export async function addEvent(event: Event): Promise<Event> {
    const query = `INSERT INTO events (employee_id, "state", category, "length", created_at)
	VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
    let { rows } = await runQuery(query, [
		event.employeeId,
		event.state,
		event.category,
		event.length ? event.length : null,
        event.createdAt
	]);
	const id = rows[0].id;
    event.id = id;

    return event;
}

export async function getEvents(employeeId: string): Promise<Array<Event>> {
    const query = `SELECT * FROM events WHERE employee_id = $1`;
    let { rows } = await runQuery(query, [
		employeeId,
	]);
    return rows.map(mapData);
}

export async function getEventsInRange(employeeId: string, category: Category, startDate: string, endDate: string):  Promise<Array<Event>> {
    const query = `SELECT * FROM events WHERE employee_id = $1 
	AND category = $2
	AND created_at >= $3
	AND created_at <= $4
	AND state = 'completed'`;
    let { rows } = await runQuery(query, [
		employeeId,
		category,
		startDate,
		endDate
	]);
    return rows.map(mapData);
}
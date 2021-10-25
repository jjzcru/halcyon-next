import { runQuery } from './db';
export interface Reminder {
	id: string;
	employeeId?: string;
	startAt?: string;
	interval?: number;
	endAt?: string;
	type?: 'water' | 'break';
}

function mapReminder(row: any): Reminder {
	if (row.start_at) {
		row.start_at = row.start_at.replace(/:\d\d([ ap]|$)/, '$1');
	}
	if (row.end_at) {
		row.end_at = row.end_at.replace(/:\d\d([ ap]|$)/, '$1');
	}
	return {
		id: row.id,
		employeeId: row.employee_id,
		startAt: row.start_at,
		interval: row.interval ? parseInt(`${row.interval}`) : null,
		endAt: row.end_at,
		type: row.type,
	};
}

export async function getReminders(
	employeeId: string
): Promise<Array<Reminder>> {
	const query = `SELECT * FROM reminder WHERE employee_id = $1;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapReminder);
}

export async function updateReminderByType(
	employeeId: string,
	type: 'water' | 'break',
	interval: number,
	startAt: string,
	endAt: string
): Promise<Array<Reminder>> {
	let query = `UPDATE reminder SET interval = $3, 
	start_at = $4, 
	end_at = $5
	WHERE employee_id = $1 AND "type" = $2;`;
	await runQuery(query, [employeeId, type, interval, startAt, endAt]);
	query = `SELECT * FROM reminder WHERE employee_id = $1 and "type" = $2;`;
	let { rows } = await runQuery(query, [employeeId, type]);
	return rows.map(mapReminder);
}

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
		row.start_at = row.start_at.replace(
			/:\d\d([ ap]|$)/,
			'$1'
		);
	}
    if (row.end_at) {
		row.end_at = row.end_at.replace(
			/:\d\d([ ap]|$)/,
			'$1'
		);
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

export async function getReminders(employeeId: string): Promise<Array<Reminder>> {
	const query = `SELECT * FROM reminder WHERE employee_id = $1;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapReminder);
}
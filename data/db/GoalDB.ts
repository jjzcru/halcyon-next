import { runQuery } from './db';

export interface Goal {
	id: string;
	employeeId?: string;
	target?: number;
	category?: 'guided_meditation' | 'meditation' | 'water' | 'break';
	frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
	createdAt?: Date;
}

function mapData(row: any): Goal {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
	return {
		id: row.id,
		employeeId: row.employee_id,
		target: row.target ? parseInt(`${row.target}`) : null,
		category: row.category,
		frequency: row.frequency,
		createdAt,
	};
}

export async function getGoals(employeeId: string): Promise<Array<Goal>> {
	const query = `SELECT * FROM goal WHERE employee_id = $1;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapData);
}
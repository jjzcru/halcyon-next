import { runQuery } from './db';
import { Category } from './EventDB';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Award {
	id: string;
	employeeId?: string;
	title?: string;
    description?: string;
    target?: number;
    image?: string;
	category?: Category;
	frequency?: Frequency;
	createdAt?: Date;
    isCompleted?: boolean;
}

function mapData(row: any): Award {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
    const isCompleted = !!row.employee_id;
	return {
		id: row.id,
		employeeId: row.employee_id,
        title: row.title,
        description: row.description,
		target: row.target ? parseInt(`${row.target}`) : null,
        image: row.image,
		category: row.category,
		frequency: row.frequency,
		createdAt,
        isCompleted
	};
}

export async function getAwards(employeeId: string): Promise<Array<Award>> {
	const query = `SELECT a.id, a.title, a.description, a.target, a.image,
	a.category, a.frequency, ea.employee_id, ea.created_at 
	FROM award a 
	LEFT JOIN employee_award ea ON (a.id = ea.award_id)
	WHERE ea.employee_id = $1 OR ea.employee_id IS NULL;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapData);
}

export async function addAward(employeeId: string, awardId: string, createdAt: string): Promise<void> {
	const query = `INSERT INTO employee_award (employee_id, award_id, created_at)
	VALUES ($1, $2, $3) RETURNING id;`;
    await runQuery(query, [
		employeeId,
		awardId,
		createdAt
	]);
}
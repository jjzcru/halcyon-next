import { runQuery } from './db';
import { Category } from './EventDB';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Goal {
	id: string;
	employeeId?: string;
	target?: number;
	category?: Category;
	frequency?: Frequency;
	createdAt?: Date | string;
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

export async function getGoal(id: string, employeeId: string): Promise<Goal> {
	const query = `SELECT * FROM goal WHERE id = $1 AND employee_id = $2;`;
	let { rows } = await runQuery(query, [id, employeeId]);
	return rows.length ? rows.map(mapData)[0] : null;
}

export async function addGoal(
	employeeId: string,
	target: number,
	category: Category,
	frequency: Frequency
): Promise<Goal> {
	const query = `INSERT INTO goal (employee_id, target, category, frequency) 
	VALUES ($1, $2, $3, $4) RETURNING id;`;
	let { rows } = await runQuery(query, [
		employeeId,
		target,
		category,
		frequency,
	]);
	const id = rows[0].id;
	return await getGoal(id, employeeId);
}

export async function updateGoal(
	id: string,
	employeeId: string,
	target: number,
	frequency: Frequency
): Promise<Goal> {
	const query = `UPDATE goal SET target = $1, frequency = $2
	WHERE employee_id = $3 and id = $4 RETURNING id;`;
	let { rows } = await runQuery(query, [target, frequency, employeeId, id]);
	return rows.length ? await getGoal(id, employeeId) : null;
}

export async function deleteGoal(
	id: string,
	employeeId: string
): Promise<string> {
	const query = `DELETE FROM goal where id = $1 and employee_id = $2 returning id;`;
	let { rows } = await runQuery(query, [id, employeeId]);
	return rows.length ? rows[0].id : null;
}

export async function getAchievementGoals(
	employeeId: string
): Promise<Array<Goal>> {
	const query = `SELECT * FROM employee_goal WHERE employee_id = $1;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapData);
}

export async function getLastCompletedGoal(
	employeeId: string,
	category: Category,
	frequency: Frequency,
	startDate: string,
	endDate: string
): Promise<Goal> {
	const query = `SELECT * FROM employee_goal WHERE employee_id = $1 
	AND category = $2
	AND frequency = $3
	AND created_at >= $4
	AND created_at <= $5
	ORDER BY created_at DESC
	LIMIT 1`;
	let { rows } = await runQuery(query, [
		employeeId,
		category,
		frequency,
		startDate,
		endDate,
	]);
	return rows.length ? rows.map(mapData)[0] : null;
}

export async function completeGoal(goal: Goal) {
	const { employeeId, target, category, frequency, createdAt } = goal;
	const query = `INSERT INTO employee_goal (employee_id, 
		target, category, frequency, created_at)
	VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
	let { rows } = await runQuery(query, [
		employeeId,
		target,
		category,
		frequency,
		createdAt,
	]);
	const id = rows[0].id;

	return id;
}

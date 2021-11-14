import { runQuery } from './db';

export interface Employee {
	id: string;
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	isConfirmed?: string;
	birthday?: Date;
	gender?: string;
	personality?: string;
	isDepressed?: boolean;
}

function mapData(row: any): Employee {
	return {
		id: row.id,
		email: row.email,
		firstName: row.first_name,
		lastName: row.last_name,
		isConfirmed: row.is_confirmed,
		birthday: row.birthday ? new Date(row.birthday) : null,
		gender: row.gender,
		personality: row.personality ? row.personality : null,
		isDepressed:
			typeof row.is_depressed === 'string'
				? JSON.parse(row.is_depressed)
				: row.is_depressed,
	};
}

export async function getEmployeeById(id: string): Promise<Employee> {
	const query = `SELECT * FROM employee WHERE id = $1`;
	let { rows } = await runQuery(query, [id]);
	rows = rows.map(mapData);
	return rows[0];
}

export async function getEmployeeByEmail(email: string): Promise<Employee> {
	const query = `SELECT * FROM employee WHERE email = $1`;
	let { rows } = await runQuery(query, [email]);
	rows = rows.map(mapData);
	return rows[0];
}

export async function setEmployeePersonality(
	employeeId: string,
	personality: string
): Promise<Employee> {
	const query = `UPDATE employee SET personality = $2 WHERE id = $1;`;
	await runQuery(query, [employeeId, personality]);
	return getEmployeeById(employeeId);
}

export async function setEmployeeDepression(
	employeeId: string,
	isDepressed: boolean
): Promise<Employee> {
	const query = `UPDATE employee SET is_depressed = $2 WHERE id = $1;`;
	await runQuery(query, [employeeId, isDepressed]);
	return getEmployeeById(employeeId);
}

export async function registerEmployee(email: string, password: string) {
	const query = `UPDATE employee 
        SET hash_password = sha512('${password}'), is_confirmed = TRUE
    WHERE email = $1;`;
	let { rows } = await runQuery(query, [email]);
	return !!rows.length;
}

export async function requestValidationCode(id: string) {
	const employee = await getEmployeeById(id);
	if (!employee) {
		throw new Error('Email do not exist');
	}
	if (employee.isConfirmed) {
		throw new Error('User is already register');
	}
	const code = Math.floor(100000 + Math.random() * 900000);
}

export async function authenticate(
	email: string,
	password: string
): Promise<Employee> {
	const query = `SELECT * FROM employee WHERE email = $1 and hash_password = sha512('${password}') LIMIT 1;`;
	let { rows } = await runQuery(query, [email]);
	if (!rows.length) {
		return null;
	}
	return rows.map(mapData)[0];
}

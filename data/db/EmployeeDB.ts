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
	challenge?: string;
	isDepressed?: boolean;
	isMFAEnabled?: boolean;
}

export interface Authenticator {
	id: string;
	employeeId: string;
	counter: number;
	createdAt: Date | string;
	credentialId: Buffer | string;
	publicKey: Buffer | string;
	attestationId: string;
	attestationContent: any;
	isEnabled?: boolean;
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
		challenge: row.challenge,
		isDepressed:
			typeof row.is_depressed === 'string'
				? JSON.parse(row.is_depressed)
				: row.is_depressed,
		isMFAEnabled:
			typeof row.is_mfa_enabled === 'string'
				? JSON.parse(row.is_mfa_enabled)
				: row.is_mfa_enabled,
	};
}

function mapAuthenticator(row: any): Authenticator {
	return {
		id: row.id,
		employeeId: row.employee_id,
		counter: row.counter ? parseInt(`${row.counter}`) : 0,
		createdAt: row.created_at ? new Date(row.created_at) : null,
		credentialId: row.credential_id,
		publicKey: row.public_key,
		attestationId: row.attestation_id,
		attestationContent: row.attestation_content
			? JSON.parse(row.attestation_content)
			: null,
		isEnabled:
			typeof row.is_enabled === 'string'
				? JSON.parse(row.is_enabled)
				: row.is_enabled,
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

export async function setEmployeeMFA(employeeId: string, isEnabled: boolean) {
	const query = `UPDATE employee SET is_mfa_enabled = $2 WHERE id = $1;`;
	await runQuery(query, [employeeId, isEnabled]);
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

export async function setEmployeeCurrentChallenge(
	employeeId: string,
	challenge: string
): Promise<string> {
	const query = `UPDATE employee SET challenge = $2 WHERE id = $1;`;
	await runQuery(query, [employeeId, challenge]);
	return challenge;
}

export async function resetEmployeeCurrentChallenge(
	employeeId: string
): Promise<void> {
	const query = `UPDATE employee SET challenge = NULL WHERE id = $1;`;
	await runQuery(query, [employeeId]);
}

export async function addKey(
	employeeId: string,
	publicKey: string,
	credentialId: string,
	counter: number,
	attestationId: string,
	attestationContent: any
): Promise<void> {
	console.log({
		employeeId,
		counter,
		credentialId,
		publicKey,
	});
	const query = `INSERT INTO employee_key (employee_id, counter, 
		credential_id, public_key, attestation_id, attestation_content) 
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
	await runQuery(query, [
		employeeId,
		counter,
		credentialId,
		publicKey,
		attestationId,
		JSON.stringify(attestationContent),
	]);
}

export async function getEmployeeAuthenticators(
	employeeId: string
): Promise<Array<Authenticator>> {
	const query = `SELECT ek.* FROM employee_key ek 
	LEFT JOIN employee e ON (e.id = ek.employee_id)
	WHERE ek.employee_id = $1 AND e.is_mfa_enabled = TRUE;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapAuthenticator);
}

export async function updateAuthenticator(
	authenticator: Authenticator
): Promise<Array<Authenticator>> {
	const query = `UPDATE employee_key SET counter = $2 WHERE id = $1;`;
	let { rows } = await runQuery(query, [
		authenticator.id,
		authenticator.counter,
	]);
	return rows.map(mapAuthenticator);
}

export async function enableAuthenticator(
	authenticatorId: string,
	isEnabled: boolean,
	employeeId: string
): Promise<boolean> {
	const query = `UPDATE employee_key SET is_enabled = $2 WHERE id = $1 and employee_id = $3;`;
	console.log({ employeeId, isEnabled });
	await runQuery(query, [authenticatorId, isEnabled, employeeId]);
	return isEnabled;
}

export async function deleteAuthenticator(
	employeeId: string,
	authenticatorId: string
): Promise<boolean> {
	const query = `DELETE FROM employee_key WHERE id = $1 AND employee_id = $2;`;
	await runQuery(query, [authenticatorId, employeeId]);
	return true;
}

export async function getAuthenticators(
	employeeId: string
): Promise<Array<Authenticator>> {
	const query = `SELECT ek.* FROM employee_key ek 
	LEFT JOIN employee e ON (e.id = ek.employee_id)
	WHERE ek.employee_id = $1;`;
	let { rows } = await runQuery(query, [employeeId]);
	return rows.map(mapAuthenticator);
}

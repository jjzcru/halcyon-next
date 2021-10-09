import { runQuery } from './db';

export interface Employee {
    id: string
    email?: string 
    password?: string
    firstName?: string
    lastName?: string
    isConfirmed?: string
    birthday?: Date
    gender?: string
}

function mapData(row: any): Employee {
    return {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        isConfirmed: row.is_confirmed,
        birthday: row.birthday ? new Date(row.birthday) : null,
        gender: row.gender
    }
}

export async function getEmployeeById(id: string): Promise<Employee> {
    const query = `SELECT * FROM employee where id = $1`;
    let { rows } = await runQuery(query, [id]);
    rows = rows.map(mapData) 
    return rows[0];
}

export async function registerEmployee(email: string, password: string) {

}

export async function validateCode(email: string, code: 'string') {

}

export async function authenticate(email: string, password: string) {
    
}
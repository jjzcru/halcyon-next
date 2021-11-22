import { runQuery } from './db';
export interface Sound {
    id: string;
	name?: string;
	description?: string;
	length?: number;
	credit?: string;
	url?: string;
	type?: 'song' | 'sound' | 'guide';
	picture?: string;
}

function mapSound(row: any): Sound {
    return {
		id: row.id,
		name: row.name,
		description: row.description,
		length: row.length ? parseInt(`${row.length}`) : null,
		credit: row.credit,
        url: row.url,
		type: row.type,
		picture: row.picture
	};
}

export async function getSounds(): Promise<Array<Sound>> {
	const query = `SELECT * FROM sound;`;
	let { rows } = await runQuery(query);
	return rows.map(mapSound);
}

export async function getSound(id: string): Promise<Sound> {
    const query = `SELECT * FROM sound WHERE id = $1;`;
	let { rows } = await runQuery(query, [id]);
    if(rows.length) {
        return rows.map(mapSound)[0];
    }
    return null;
}

export async function getSoundByType(type: string): Promise<Array<Sound>> {
	const query = `SELECT * FROM sound WHERE "type" = $1;`;
	let { rows } = await runQuery(query, [type]);
	return rows.map(mapSound);
}
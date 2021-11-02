import { runQuery } from './db';

export interface MoodActivity {
	id: string;
	inputEmotion?: string;
	activity?: string;
	outputEmotion?: string;
}

function mapData(row: any): MoodActivity {
	return {
		id: row.id,
		inputEmotion: row.input_emotion,
		activity: row.activity,
		outputEmotion: row.output_emotion
	};
}

export async function getMoodActivities(): Promise<Array<MoodActivity>> {
	const query = `SELECT * FROM mood_activity;`;
	let { rows } = await runQuery(query);
	return rows.map(mapData);
}
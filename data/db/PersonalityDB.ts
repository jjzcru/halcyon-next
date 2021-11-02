import { runQuery } from './db';

export type PersonalityType = 'e' | 'i' | 's' | 'n' | 't' | 'f' | 'j' | 'p';

export interface Question {
	id: string;
	content?: string;
	index?: number;
	options?: Array<Option>;
}

export interface Option {
	id: string;
	questionId: string;
	content?: string;
	index?: number;
	value?: PersonalityType;
}

function mapQuestion(row: any): Question {
	return {
		id: row.id,
		content: row.content,
		index: row.index ? parseInt(`${row.index}`) : null,
		options: [],
	};
}

function mapOption(row: any): Option {
	return {
		id: row.id,
		questionId: row.question_id,
		content: row.content,
		index: row.index ? parseInt(`${row.index}`) : null,
		value: row.value,
	};
}

export async function getPersonalityQuestions(): Promise<Array<Question>> {
	const query = `SELECT * FROM personality_questions;`;
	let { rows } = await runQuery(query);
	const questions: Array<Question> = rows.map(mapQuestion);
	const options = await getQuestionOptions(questions.map((q) => q.id));

	const questionsMap: Map<string, Question> = questions.reduce(
		(acc: Map<string, Question>, question: Question) => {
			acc.set(question.id, question);
			return acc;
		},
		new Map()
	);

	for (const option of options) {
		const question = questionsMap.get(option.questionId);
		if (!question) {
			continue;
		}

		question.options.push(option);
		questionsMap.set(question.id, question);
	}

	return Array.from(questionsMap.keys()).map((id) => questionsMap.get(id));
}

async function getQuestionOptions(
	ids: Array<string> = []
): Promise<Array<Option>> {
	const filter = ids.map((id) => `question_id = '${id}'`).join(' OR ');
	const query = `SELECT * FROM personality_options WHERE ${filter};`;
	let { rows } = await runQuery(query);
	return rows.map(mapOption);
}

import { getPersonalityQuestions} from '../db/PersonalityDB'

test.skip('Should get personality question and options', async () => {
    const questions = await getPersonalityQuestions();
    expect(typeof questions).toBe('object');
    expect(questions.length).toBeGreaterThan(1);
    for(const question of questions) {
        expect(question).toBeDefined();
        expect(question.id).toBeDefined();
        expect(question.content.length).toBeGreaterThan(0);
        expect(typeof question.options).toBe('object');
        expect(question.options.length).toBe(2);
        for(const option of question.options) {
            expect(option).toBeDefined();
            expect(option.id).toBeDefined();
            expect(option.content.length).toBeGreaterThan(0);
        }
    }
});


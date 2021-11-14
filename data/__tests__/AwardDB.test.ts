import { getAwards } from '../db/AwardDB';

test.only('Should get the reminders by an employee id', async () => {
	const employeeId = '698927090631649041';
	const awards = await getAwards(employeeId);

	expect(typeof awards).toBe('object');
	for (const award of awards) {
		if (award.isCompleted) {
			expect(award.employeeId).toBe(employeeId);
		}
	}
});

import { getGoals } from '../db/GoalDB'

test.only('Should get the reminders by an employee id', async () => {
    const employeeId = '698927090631649041';
    const goals = await getGoals(employeeId);
    expect(typeof goals).toBe('object');
    for(const goal of goals) {
        expect(goal.employeeId).toBe(employeeId);
    }
});
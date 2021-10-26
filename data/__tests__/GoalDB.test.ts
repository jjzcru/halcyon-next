import { Category } from '../db/EventDB';
import { addGoal, getGoals, getGoal, updateGoal, deleteGoal, Frequency } from '../db/GoalDB'

test('Should get the reminders by an employee id', async () => {
    const employeeId = '698927090631649041';
    const goals = await getGoals(employeeId);

    expect(typeof goals).toBe('object');
    for(const goal of goals) {
        expect(goal.employeeId).toBe(employeeId);
    }
});

test('Should return a null goal because the id does not exist', async () => {
    const id = '0';
    const employeeId = '698927090631649041';
    const goal = await getGoal(id, employeeId);

    expect(goal).toBeNull();
});

test('Should return a goal by its id', async () => {
    const id = '705217808479322113';
    const employeeId = '698927090631649041';
    const goal = await getGoal(id, employeeId);

    expect(typeof goal).toBe('object');
    expect(goal.id).toBe(id);
    expect(goal.employeeId).toBe(employeeId);
});

test.skip('Should create a goal', async () => {
    const target = 10;
    const category: Category = 'break';
    const frequency: Frequency = 'monthly';
    const employeeId = '698927090631649041';
    const goal = await addGoal(employeeId, target, category, frequency);

    expect(typeof goal).toBe('object');
    
    expect(goal.employeeId).toBe(employeeId);
    expect(goal.category).toBe(category);
    expect(goal.frequency).toBe(frequency);
});

test.skip('Should update a goal', async () => {
    let target = 10;
    const category: Category = 'break';
    let frequency: Frequency = 'monthly';
    const employeeId = '698927090631649041';
    let goal = await addGoal(employeeId, target, category, frequency);

    expect(typeof goal).toBe('object');
    expect(goal.employeeId).toBe(employeeId);
    expect(goal.category).toBe(category);
    expect(goal.frequency).toBe(frequency);

    target = 30;
    frequency = 'daily';
    goal = await updateGoal(goal.id, employeeId, target, frequency);
    expect(goal.category).toBe(category);
    expect(goal.frequency).toBe(frequency);
});

test.only('Should delete the goal', async () => {
    const target = 10;
    const category: Category = 'break';
    const frequency: Frequency = 'monthly';
    const employeeId = '698927090631649041';
    let goal = await addGoal(employeeId, target, category, frequency);

    expect(typeof goal).toBe('object');
    expect(goal.employeeId).toBe(employeeId);
    expect(goal.category).toBe(category);
    expect(goal.frequency).toBe(frequency);
    const response = await deleteGoal(goal.id, employeeId);
    expect(goal.id).toBe(response);
});
import { addEvent, getEvents, Category, State } from '../db/EventDB'

test('Should add an event', async () => {
    const employeeId = '698927090631649041';
    const state: State = 'completed';
    const category: Category = 'meditation';
    const length = 50;
    const createdAt = (new Date()).toISOString();
    const event = await addEvent({
        employeeId,
        state,
        category,
        length,
        createdAt
    });
    expect(event.id).toBeDefined();
    expect(event.employeeId).toBe(employeeId);
    expect(event.state).toBe(state);
    expect(event.category).toBe(category);
    expect(event.length).toBe(length);
});

test('Should get all the events from an employee', async () => {
    const employeeId = '698927090631649041';
    const events = await getEvents(employeeId);
    for(const event of events) {
        expect(event.employeeId).toBe(employeeId);
    }
});


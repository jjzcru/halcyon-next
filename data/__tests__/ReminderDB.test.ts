import { getReminders, updateReminderByType } from '../db/ReminderDB'

test('Should get the reminders by an employee id', async () => {
    const employeeId = '698927090631649041';
    const reminders = await getReminders(employeeId);
    expect(typeof reminders).toBe('object');
    expect(reminders.length).toBe(2);
    for(const reminder of reminders) {
        expect(reminder.employeeId).toBe(employeeId);
    }
});

test('Should update a reminder by type', async () => {
    const employeeId = '698927090631649041';
    const type = 'water';
    const interval = 15;
    const startAt = '09:00';
    const endAt = '17:00';
    const reminders = await updateReminderByType(employeeId, type, interval, startAt, endAt);
    expect(typeof reminders).toBe('object');
    expect(reminders.length).toBe(1);
    for(const reminder of reminders) {
        expect(reminder.employeeId).toBe(employeeId);
        expect(reminder.type).toBe(type);
        expect(reminder.interval).toBe(interval);
    }
});

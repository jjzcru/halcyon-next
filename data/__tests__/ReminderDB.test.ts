import { getReminders } from '../db/ReminderDB'

test('Should get the reminders by an employee id', async () => {
    const employeeId = '698927090631649041';
    const reminders = await getReminders(employeeId);
    expect(typeof reminders).toBe('object');
    expect(reminders.length).toBe(2);
    for(const reminder of reminders) {
        expect(reminder.employeeId).toBe(employeeId);
    }
});

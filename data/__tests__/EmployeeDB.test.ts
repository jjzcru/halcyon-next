import { getEmployeeById, authenticate } from '../db/EmployeeDB'

test.skip('Should get an employee by its id', async () => {
    const id = '700165948337235729';
    const employee = await getEmployeeById(id);
    expect(employee.id).toBe(id);
});

test.skip('Should authenticate an employee', async () => {
    const email = 'viyeta@gmail.com';
    const password = 'password';
    const isValid = await authenticate(email, password);
    expect(isValid).toBe(true);
});


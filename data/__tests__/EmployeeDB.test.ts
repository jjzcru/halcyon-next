const bcrypt = require('bcryptjs');
import { getEmployeeById } from '../db/EmployeeDB'

test('Validate hashing mechanism', () => {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync('password', salt);
    
    const expectedPassword = '$2b$12$QS9xVqluDXTqpmsT2lKF2.Qp8UJRK0okAxeBOoWb17mPBDqY8eWBC';
    expect(bcrypt.compareSync(expectedPassword, password)).toBe(true);
})

test.skip('Should get an employee by its id', async () => {
    const id = '700165948337235729';
    const employee = await getEmployeeById(id);
    expect(employee.id).toBe(id);
});



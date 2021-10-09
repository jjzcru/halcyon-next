import { runQuery } from '../db/db'

test.skip('Run query', async () => {
    const { rows } = await runQuery('SELECT * FROM employee');
    expect(typeof rows).toBe('object')
    expect(rows.length).toBeGreaterThan(0);
});



import { getRooms } from '../db/RoomDB'

test.skip('Should get the list of all the rooms', async () => {
    const rooms = await getRooms();
    expect(typeof rooms).toBe('object');
    expect(rooms.length).toBeGreaterThan(0);
});



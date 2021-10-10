import { getRooms, getReservations } from '../db/RoomDB'

test.skip('Should get the reservation in a meditation room', async () => {
    const meditationRoomId = '700359396337395473';
    const reservations = await getReservations(meditationRoomId)
    expect(typeof reservations).toBe('object');
})

test('Should get the list of all the rooms', async () => {
    const rooms = await getRooms();
    expect(typeof rooms).toBe('object');
    expect(rooms.length).toBeGreaterThan(0);
});
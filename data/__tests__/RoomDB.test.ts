import { getRooms, getReservations, addReservation } from '../db/RoomDB'

test.skip('Should get the reservation in a meditation room', async () => {
    const meditationRoomId = '700359396337395473';
    const reservations = await getReservations(meditationRoomId)
    expect(typeof reservations).toBe('object');
})

test.skip('Should get the list of all the rooms', async () => {
    const rooms = await getRooms();
    expect(typeof rooms).toBe('object');
    expect(rooms.length).toBeGreaterThan(0);
});

test.skip('Should make a reservation', async () => {
    const employeeId = '698927090631649041';
    const time = '16:30';
    const roomId = '700359396337395473';
    const success = await addReservation(employeeId, time, roomId);
    expect(success).toBe(true);
});
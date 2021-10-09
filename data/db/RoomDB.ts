import { runQuery } from './db';

export interface Room {
    id: string
    name?: string 
    description?: string
    timeInterval?: string
    startAvailableTime?: string
    endAvailableTime?: string
}

function mapData(row: any): Room {
    return {
        id: row.id,
        name: row.room_name,
        description: row.description,
        timeInterval: row.time_interval,
        startAvailableTime: row.start_available_time,
        endAvailableTime: row.end_available_time
    }
}

export async function getRooms(): Promise<Array<Room>> {
    const query = `SELECT * FROM meditation_room;`;
    let { rows } = await runQuery(query);
    return rows.map(mapData);
}

export async function getReservations(email: string) {

}

export async function getRoomAvailableTimes() {
    
}
import Room from '../models/Room';

export const generateConnectionId = async (): Promise<number> => {
  let connectionId: number;
  let room: IRoom | null;
  do {
    connectionId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    room = await Room.findOne({ connectionId });
  } while (room);
  return connectionId;
};
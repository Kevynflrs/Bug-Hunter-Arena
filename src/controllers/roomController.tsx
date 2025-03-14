import { Request, Response } from 'express';
import Room from '../models/Room';
import { generateConnectionId } from '../utils/generateConnectionId';

export const createRoom = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const connectionId = await generateConnectionId();

  const room = new Room({ name, connectionId });
  await room.save();

  res.status(201).json(room);
};
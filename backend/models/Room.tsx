import { Schema, model, Document } from 'mongoose';

interface IRoom extends Document {
  id: string;
  scores_a: number;
  scores_b: number;
  name: string;
  connectionId: string;
}

const RoomSchema = new Schema<IRoom>({
  id: { type: String, required: true, unique: true },
  scores_a: { type: Number, required: true },
  scores_b: { type: Number, required: true },
  name: { type: String, required: true },
  connectionId: { type: String, required: true }
});

const Room = model<IRoom>('Room', RoomSchema);

export default Room;
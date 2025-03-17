import { Schema, model, models, Document } from 'mongoose';

interface IRoom extends Document {
  scores_a: number;
  scores_b: number;
  name: string;
  connectionId: number;
}

const RoomSchema = new Schema<IRoom>({
  scores_a: { type: Number, required: true, default: 0 },
  scores_b: { type: Number, required: true, default: 0 },
  name: { type: String, required: true },
  connectionId: { type: Number, required: true, min: 100000, max: 999999 }
});

const Room = models.Room || model<IRoom>('Room', RoomSchema);

export default Room;
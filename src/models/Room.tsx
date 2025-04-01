import { Schema, model, models, Document } from 'mongoose';

interface IRoom extends Document {
  scores_a: number;
  scores_b: number;
  connectionId: string;
}

const RoomSchema = new Schema<IRoom>({
  scores_a: { type: Number, required: true, default: 0 },
  scores_b: { type: Number, required: true, default: 0 },
  connectionId: { type: String, required: true }
});

const Room = models.Room || model<IRoom>('Room', RoomSchema);

export default Room;
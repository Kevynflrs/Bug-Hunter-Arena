import pkg from 'mongoose';
const { Schema, model, models } = pkg;

interface IRoom extends Document {
  scores_a: number;
  scores_b: number;
  connectionId: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  scores_a: { type: Number, required: true, default: 0 },
  scores_b: { type: Number, required: true, default: 0 },
  connectionId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const Room = models.Room || model<IRoom>('Room', RoomSchema);

export default Room;
import { Schema, model, models, Document } from 'mongoose';

interface IRoom extends Document {
  scores_a: number;
  scores_b: number;
  connectionId: string;
  currentQuestion: {
    id: string;
    theme: string;
    niveau: string;
    question: string;
    correction: string;
    explication: string;
  } | null;
}

const RoomSchema = new Schema<IRoom>({
  scores_a: { type: Number, required: true, default: 0 },
  scores_b: { type: Number, required: true, default: 0 },
  connectionId: { type: String, required: true },
  currentQuestion: {
    id: String,
    theme: String,
    niveau: String,
    question: String,
    correction: String,
    explication: String,
  }
});

const Room = models.Room || model<IRoom>('Room', RoomSchema);

export default Room;
import { Schema, model, Document } from 'mongoose';

interface IQuestion extends Document {
  theme: string;
  niveau: 'Facile' | 'Intermédiaire' | 'Difficile';
  question: string;
  correction: string;
  explication: string;
}

const QuestionSchema = new Schema<IQuestion>({
  theme: { type: String, required: true },
  niveau: { type: String, enum: ['Facile', 'Intermédiaire', 'Difficile'], required: true },
  question: { type: String, required: true },
  correction: { type: String, required: true },
  explication: { type: String, required: true }
}, {
  timestamps: true
});

const Question = model<IQuestion>('Question', QuestionSchema);

export default Question;
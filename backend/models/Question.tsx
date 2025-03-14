import { Schema, model, Document } from 'mongoose';

interface IQuestion extends Document {
  question: string;
  correctedQuestion: string;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  correctedQuestion: { type: String, required: true }
}, {
  timestamps: true
});

const Question = model<IQuestion>('Question', QuestionSchema);

export default Question;
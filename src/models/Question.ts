import pkg from 'mongoose';
const { Schema, model, models } = pkg;

interface IQuestion extends Document {
  theme: string;
  niveau: string;
  question: string;
  correction: string;
  explication: string;
}

const QuestionSchema = new Schema<IQuestion>({
  theme: { type: String, required: true },
  niveau: { type: String, required: true },
  question: { type: String, required: true },
  correction: { type: String, required: true },
  explication: { type: String, required: true },
});

const Question = models.Question || model<IQuestion>('Question', QuestionSchema);

export default Question;
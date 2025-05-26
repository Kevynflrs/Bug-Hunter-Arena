import mongoose, { Document } from 'mongoose';

interface IQuestion extends Document {
  theme: string;
  niveau: string;
  question: string;
  correction: string;
  explication: string;
}

// Vérifie si on est côté serveur avant de créer le modèle
const Question = (mongoose.models && mongoose.models.Question) || 
  (typeof window === 'undefined' ? mongoose.model<IQuestion>('Question', new mongoose.Schema({
    theme: { type: String, required: true },
    niveau: { type: String, required: true },
    question: { type: String, required: true },
    correction: { type: String, required: true },
    explication: { type: String, required: true },
  })) : null);

export default Question;
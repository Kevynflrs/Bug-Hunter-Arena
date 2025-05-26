import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/models/Question";

interface ValidationInput {
  userAnswer: string;
  correction: string;
  explication: string;
}

export async function validateAnswer({
  userAnswer,
  correction,
  explication
}: ValidationInput): Promise<{ isValid: boolean; explanation: string }> {
  try {
    // Vérification exacte d'abord
    const exactMatch = userAnswer.trim() === correction.trim();
    if (exactMatch) {
      return {
        isValid: true,
        explanation: "Réponse exactement identique à la solution"
      };
    }

    const response = await fetch('/api/validateAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAnswer,
        correction,
        explication
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la validation');
    }

    return await response.json();

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    // Fallback sur la vérification simple
    const simpleCheck = userAnswer.trim().toLowerCase() === correction.trim().toLowerCase();
    return {
      isValid: simpleCheck,
      explanation: simpleCheck ? "Réponse correcte (vérification simple)" : "Réponse incorrecte"
    };
  }
}

export async function POST(request: Request) {
  try {
    const { roomId, languages, difficulty } = await request.json();

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Construire la query en fonction de la difficulté
    const query = difficulty ? { niveau: difficulty } : {};

    // Récupérer une question aléatoire
    const count = await Question.countDocuments(query);
    if (count === 0) {
      throw new Error("Aucune question trouvée avec ces critères");
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    if (!question) {
      throw new Error("Erreur lors de la récupération de la question");
    }

    return NextResponse.json({ question });
    
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
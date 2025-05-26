import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/models/Question";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    if (!question) {
      return NextResponse.json(
        { error: "Aucune question trouvée" },
        { status: 404 }
      );
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

export async function validateAnswer(request: Request) {
  try {
    const { userAnswer, correction, explication } = await request.json();

    // Vérification exacte d'abord
    const exactMatch = userAnswer.trim() === correction.trim();
    if (exactMatch) {
      return NextResponse.json({
        isValid: true,
        explanation: "Réponse exactement identique à la solution",
        aiResponse: null,
      });
    }

    // Validation par IA
    const prompt = `
      En tant qu'expert en programmation, évalue si ces deux solutions sont fonctionnellement équivalentes :

      Solution de référence :
      ${correction}

      Solution proposée :
      ${userAnswer}

      Contexte/Explication :
      ${explication}

      Analyse si la solution proposée résout correctement le problème, même si la syntaxe est différente.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en programmation qui évalue des solutions de code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    const isValid =
      aiResponse?.toLowerCase().includes("correct") ||
      aiResponse?.toLowerCase().includes("valide");

    return NextResponse.json({
      isValid,
      explanation: isValid
        ? "Solution validée par l'IA"
        : "Solution incorrecte selon l'IA",
      aiResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la validation:", error);
    return NextResponse.json(
      {
        isValid: false,
        explanation: "Erreur lors de la validation par IA",
        aiResponse: null,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { userAnswer, correction, explication } = await request.json();

    if (userAnswer.trim() === correction.trim()) {
      return NextResponse.json({
        isValid: true,
        explanation: "Réponse exactement identique à la solution",
        aiResponse: "La réponse est parfaitement identique à la solution attendue."
      });
    }

    const prompt = `
      Compare ces deux solutions et détermine si elles sont fonctionnellement équivalentes :

      Solution attendue :
      ${correction}

      Solution proposée :
      ${userAnswer}

      Contexte/Explication :
      ${explication}

      Commence ta réponse par CORRECT ou INCORRECT puis explique pourquoi.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un expert en programmation qui évalue des solutions de code." },
          { role: "user", content: prompt }
        ]
      });

      const aiResponse = completion.choices[0].message.content || "";
      const isValid = aiResponse.toLowerCase().startsWith("correct");

      return NextResponse.json({
        isValid,
        explanation: isValid ? "Solution validée par l'IA" : "Solution incorrecte selon l'IA",
        aiResponse
      });

    } catch (aiError: any) {
      // Gestion spécifique du quota
      if (aiError.status === 429 || aiError.code === "insufficient_quota") {
        return NextResponse.json({
          isValid: false,
          explanation: "Le service IA est temporairement indisponible (quota OpenAI dépassé ou clé non valide).",
          aiResponse: null,
          error: "quota"
        }, { status: 429 });
      }
      // Fallback sur la vérification simple
      const simpleCheck = userAnswer.trim().toLowerCase() === correction.trim().toLowerCase();
      return NextResponse.json({
        isValid: simpleCheck,
        explanation: simpleCheck ? "Validation simple (IA indisponible)" : "Réponse incorrecte",
        aiResponse: null
      });
    }

  } catch (error) {
    console.error("Erreur lors de la validation:", error);
    return NextResponse.json({
      isValid: false,
      explanation: "Erreur lors de la validation",
      aiResponse: null
    }, { status: 500 });
  }
}
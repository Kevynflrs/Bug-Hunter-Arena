import { NextResponse } from "next/server";
import Question from "@/models/Question";

export async function POST(request: Request) {
  const { answer } = await request.json();
  const question = await Question.findOne(); // Récupère la question actuelle

  if (question.correction === answer) {
    // Simule la mise à jour des points
    const updatedPoints = { teamA: 20, teamB: 15 }; // Exemple
    return NextResponse.json({ correct: true, updatedPoints });
  }

  return NextResponse.json({ correct: false });
}
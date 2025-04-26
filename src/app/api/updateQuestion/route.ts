import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Room from "@/models/Room";
import Question from "@/models/Question";

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Récupérer une nouvelle question aléatoire
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const newQuestion = await Question.findOne().skip(random);

    // Mettre à jour la room avec la nouvelle question
    const updatedRoom = await Room.findOneAndUpdate(
      { connectionId: roomId },
      { currentQuestion: newQuestion },
      { new: true }
    );

    if (!updatedRoom) {
      return NextResponse.json(
        { error: "Room non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: updatedRoom.currentQuestion });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
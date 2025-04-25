import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/models/Question";

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const count = await Question.countDocuments();
    
    if (count === 0) {
      return NextResponse.json(
        { error: "Aucune question dans la base de données" },
        { status: 404 }
      );
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
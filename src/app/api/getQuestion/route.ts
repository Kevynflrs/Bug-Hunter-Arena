import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/models/Question";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languages = searchParams.get("languages")?.split(",") || [];

    // if (!mongoose.connection.readyState) {
    //   await mongoose.connect(process.env.MONGODB_URI!);
    // }

    // Construire la requête avec les langages sélectionnés
    const query = languages.length > 0 ? { theme: { $in: languages } } : {};
    const count = await Question.countDocuments(query);
    
    if (count === 0) {
      return NextResponse.json(
        { error: "Aucune question disponible pour les langages sélectionnés" },
        { status: 404 }
      );
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
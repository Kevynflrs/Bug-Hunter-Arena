import { NextResponse } from "next/server";
import Question from "@/models/Question";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languages = searchParams.get("languages")?.split(",") || [];
    const difficulty = searchParams.get("difficulty");

    const niveauMap: { [key: string]: string } = {
      "1": "Facile",
      "2": "Intermédiaire",
      "3": "Difficile"
    };

    const query = {
      ...(languages.length > 0 && { theme: { $in: languages } }),
      niveau: difficulty && niveauMap[difficulty] 
        ? niveauMap[difficulty]
        : { $in: ["Facile", "Intermédiaire", "Difficile"] }
    };

    const count = await Question.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(query).skip(random);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
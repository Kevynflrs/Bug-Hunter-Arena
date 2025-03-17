import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Room from "@/models/Room";

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI!);
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "Le nom est requis" }, { status: 400 });
    }

    const newRoom = new Room({
      name,
      scores_a: 0, // Valeurs par défaut
      scores_b: 0,
      connectionId: Math.floor(100000 + Math.random() * 900000), // ID aléatoire entre 100000 et 999999
    });

    await newRoom.save();
    return NextResponse.json({ message: "Room créée avec succès !" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur lors de la création" }, { status: 500 });
  }
}
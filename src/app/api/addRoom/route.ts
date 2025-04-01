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

    let connectionId;
    let existingRoom;

    // À optimiser
    do {
      connectionId = Math.floor(100000 + Math.random() * 900000);
      existingRoom = await Room.findOne({ connectionId });
    } while (existingRoom);

    const newRoom = new Room({
      name,
      scores_a: 0,
      scores_b: 0,
      connectionId: connectionId,
    });

    await newRoom.save();
    return NextResponse.json({ message: "Room créée avec succès !", connectionId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur lors de la création" }, { status: 500 });
  }
}
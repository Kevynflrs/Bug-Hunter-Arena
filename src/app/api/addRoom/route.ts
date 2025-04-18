import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Room from "@/models/Room";

if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI!);
}

export async function POST() {
  try {
    let connectionId;
    let existingRoom;

    do {
      connectionId = Math.floor(100000 + Math.random() * 900000);
      existingRoom = await Room.findOne({ connectionId });
    } while (existingRoom);

    const newRoom = new Room({
      scores_a: 0, // Valeurs par défaut
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
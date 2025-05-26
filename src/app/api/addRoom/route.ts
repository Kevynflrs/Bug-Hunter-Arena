import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Room from "@/models/Room";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const room = new Room({
      name,
      connectionId: uuidv4(),
      scores_a: 0,
      scores_b: 0,
      createdAt: new Date()
    });

    await room.save();
    
    return NextResponse.json({ connectionId: room.connectionId });
  } catch (error) {
    console.error("Erreur lors de la création de la room:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la room" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import Room from "@/models/Room";

export async function POST(request: Request) {
  try {
    const { name } = await request.json(); // Retrieve the name from the request body

    function generateRoomId(): string {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let id = "";
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    }

    let connectionId: string = "";
    let exists = true;

    while (exists) {
      connectionId = generateRoomId();
      exists = (await Room.exists({ connectionId })) !== null;
    }

    const newRoom = new Room({
      scores_a: 0,
      scores_b: 0,
      name: name,
      connectionId: connectionId,
    });

    await newRoom.save();
    return NextResponse.json({ message: "Room créée avec succès !", connectionId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur lors de la création" }, { status: 500 });
  }
}
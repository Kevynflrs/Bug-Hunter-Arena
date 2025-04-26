import { NextResponse } from "next/server";
import Room from "@/models/Room";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("id");

    console.log("Connection ID (GET):", connectionId);

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    // Vérifie si la room existe dans la base de données
    const room = await Room.findOne({ connectionId });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Retourne les informations de la room
    return NextResponse.json(
      { message: "Room found successfully", room },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
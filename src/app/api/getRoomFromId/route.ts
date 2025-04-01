import { NextResponse } from "next/server";
import { connectMongoDB } from "@/utils/db";
import Room from "@/models/Room";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("id");

    if (!connectionId) {
        return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
    }

    try {
        await connectMongoDB();

        const room = await Room.findOne({ connectionId });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
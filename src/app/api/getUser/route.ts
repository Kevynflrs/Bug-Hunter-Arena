import { NextResponse } from "next/server";

export async function GET() {
  // Simule les données utilisateur (remplacez par une vraie logique)
  const user = {
    username: "Alice",
    teamA_points: 10,
    teamB_points: 15,
  };

  return NextResponse.json(user);
}
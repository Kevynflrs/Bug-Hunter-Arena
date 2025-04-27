import { NextResponse } from 'next/server';
import Room from '@/models/Room';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID de la room manquant" },
        { status: 400 }
      );
    }

    const deletedRoom = await Room.findOneAndDelete({ connectionId: id });

    if (!deletedRoom) {
      return NextResponse.json(
        { message: "Room introuvable ou déjà supprimée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Room supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la room :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
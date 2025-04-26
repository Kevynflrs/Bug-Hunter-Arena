"use client";

import Carousel from '../components/Carousel';
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter
import handleRoomCreation from "@/components/handle_room_creation";
import { useRouter } from 'next/navigation';

const App = () => {
  const avatarList = useMemo(() => [
    "/assets/avatar/cat.png",
    "/assets/avatar/dog.png",
    "/assets/avatar/rabbit.png",
    "/assets/avatar/cow.png",
    "/assets/avatar/elephant.png",
    "/assets/avatar/monkey.png",
    "/assets/avatar/frog.png",
    "/assets/avatar/panda.png",
    "/assets/avatar/pig.png",
  ], []);

  const defaultNames = [
    "Raymond",
    "Gilbert",
    "Alice",
    "Yvonne",
    "Denise",
    "Edmond",
    "Théophile",
    "Achille",
    "Isidore",
  ];

  const [avatar, setAvatar] = useState(""); // Initialiser avec une chaîne vide
  const [nickname, setNickname] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const router = useRouter();

  // Initialiser l'avatar uniquement côté client
  useEffect(() => {
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
    setAvatar(randomAvatar);
  }, [avatarList]);

  const handleReloadAvatar = () => {
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
    setAvatar(randomAvatar);
  };

  const handleJoinGame = () => {
    setIsPopupOpen(true);
  };
  
    const handleRoomCodeSubmit = async () => {
    if (!roomCode) {
      alert("Veuillez entrer un code de salle.");
      return;
    }
  
    try {
      const response = await fetch(`/api/joinGame?id=${roomCode}`);
      if (!response.ok) {
        throw new Error("La salle n'existe pas.");
      }
  
      const data = await response.json();
  
      // Récupère le connectionId et le stocke dans roomCode
      const { connectionId } = data.room;
      setRoomCode(connectionId);
  
      router.push(`/room?id=${connectionId}&nickname=${nickname || "user"}`);
    } catch (error) {
      console.error("Erreur lors de la tentative de rejoindre la salle :", error);
      alert("Impossible de rejoindre la salle. Vérifiez le code et réessayez.");
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setRoomCode("");
  };

  const handleRoomCodeSubmit = () => {
    setIsPopupOpen(false);
    router.push(`/room?id=${roomCode}`); // Use router.push for navigation
  };

  const handleCreateRoom = async () => {
    // Si aucun pseudo n'est fourni, attribuer un nom aléatoire
    const finalNickname = nickname || defaultNames[Math.floor(Math.random() * defaultNames.length)];

    const roomId = await handleRoomCreation(finalNickname);
    redirect(`/room?id=${roomId}&nickname=${finalNickname}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Header */}
      <header className="flex flex-col items-center mb-6">
        <Image src="/assets/img/logo_bug_hunter.png" alt="Bug Hunter Arena Logo" width={150} height={200} />
      </header>

      {/* Buttons */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <button
          className="w-full py-3 text-lg font-semibold rounded-2xl border-1 border-gray-300 hover:bg-gray-100 flex items-center gap-2 pl-[25%]"
          onClick={handleJoinGame}
        >
          <Image src="/assets/img/RightArrow.png" alt="Join button" width={32} height={32} />
          <span>Rejoindre une Partie</span>
        </button>
        <button
          className="w-full py-3 text-lg font-semibold rounded-2xl border-1 border-gray-300 hover:bg-gray-100 flex items-center gap-2 pl-[25%]"
          onClick={handleCreateRoom}
        >
          <Image src="/assets/img/Add.png" alt="Add button" width={32} height={32} />
          <span>Créer une Partie</span>
        </button>
      </div>

      {/* Main Section */}
      <div className="mt-8 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Character Selection */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md w-full md:w-1/2">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
              {avatar && (
                <Image src={avatar} alt="Avatar" className="rounded-full object-cover" width={64} height={64} />
              )}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                onClick={handleReloadAvatar}
              >
                <Image src="/assets/img/reload.png" alt="Reload" width={15} height={15} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 text-center">Choisir un personnage et un surnom</p>
          </div>
          <input
            type="text"
            placeholder="Pseudo"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md text-center"
          />
        </div>

        {/* Instructions */}
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Comment Jouer ?</h2>
          <Carousel
            images={[
              "/assets/img/Group 1.png",
              "/assets/img/data.png",
              "/assets/img/success.png",
            ]}
            texts={[
              "Chaque équipe désigne un expert en PHP, JavaScript (ReactJS), C++, C# et mobile.",
              "Une technologie est tirée au sort, et le joueur correspondant doit corriger un bug pour marquer des points.",
              "L’équipe avec le plus de point à la fin de la partie remporte (logique). \n A vous de jouer !",
            ]}
            interval={8000}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600">
        <p>© 2025 Bug Hunter Arena. Tous droits réservés.</p>
        <p>Développé par l&apos;équipe de Bug Hunter Arena.</p>
      </footer>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#00000099]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Entrer le code de la salle</h2>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Code de la salle"
            />
            <div className="flex justify-end gap-2">
              <button
                className="py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={handlePopupClose}
              >
                Annuler
              </button>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleRoomCodeSubmit}
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
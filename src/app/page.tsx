"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import { redirect } from 'next/navigation'
import handleRoomCreation from "@/components/handle_room_creation";  

const App = () => {
  const avatarList = [
    "/assets/avatar/cat.png",
    "/assets/avatar/dog.png",
    "/assets/avatar/rabbit.png",
    "/assets/avatar/cow.png",
    "/assets/avatar/elephant.png",
    "/assets/avatar/monkey.png",
    "/assets/avatar/frog.png",
    "/assets/avatar/panda.png",
    "/assets/avatar/pig.png",
  ];

  const [avatar, setAvatar] = useState(""); // Initialiser avec une chaîne vide
  const [nickname, setNickname] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  // Initialiser l'avatar uniquement côté client
  useEffect(() => {
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
    setAvatar(randomAvatar);
  }, []);

  const handleReloadAvatar = () => {
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
    setAvatar(randomAvatar);
  };

  const handleJoinGame = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setRoomCode("");
  };

  const handleRoomCodeSubmit = () => {
    setIsPopupOpen(false);
    redirect(`/room?id=${roomCode}`);
  };


  const handleCreateRoom = async () => {

    if (!nickname) {
      alert("Veuillez entrer un surnom avant de créer une salle.");
      return;
    }
    const roomId = await handleRoomCreation();
    redirect(`/room?id=${roomId} &nickname=${nickname}`);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Header */}
      <header className="flex flex-col items-center mb-6">
        <Image src="/logo_bug_hunter.png" alt="Bug Hunter Arena Logo" width={150} height={200} />
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
        <button className="w-full py-3 text-lg font-semibold rounded-2xl border-1 border-gray-300 hover:bg-gray-100"
          onClick={handleCreateRoom}
        >
          ➕ Crée une Partie
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
            onChange={(e) => setNickname(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md text-center"
          />
        </div>

        {/* Instructions */}
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Comment Jouer ?</h2>
          <Image src="/Group 1.png" alt="" width={192} height={192} />
          <p className="text-sm text-gray-600 text-center">
            Chaque équipe désigne un expert en PHP, JavaScript (ReactJS), C++, C# et mobile.
          </p>
        </div>
      </div>

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
}

export default App;
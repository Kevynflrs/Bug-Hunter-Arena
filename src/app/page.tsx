"use client";

import { useState } from "react";
import Image from 'next/image';
import { redirect } from 'next/navigation'
import handleRoomCreation from "@/components/handle_room_creation";  

const App = () => {
  const [nickname, setNickname] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const handleJoinGame = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setRoomCode("");
  };

  const handleRoomCodeSubmit = () => {
    // Add logic to handle room code submission
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
        <Image src="/logo_bug_hunter.png" alt="Bug Hunter Arena Logo" width={48} height={48} className="w-12 mb-2" />
        <h1 className="text-xl font-bold">Bug Hunter Arena</h1>
      </header>

      {/* Buttons */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <button
          className="w-full py-3 text-lg font-semibold rounded-2xl border-1 border-gray-300 hover:bg-gray-100"
          onClick={handleJoinGame}
        >
          ➡ Rejoindre une Partie
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
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full md:w-1/2">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3"></div>
          <p className="text-sm font-medium text-gray-600">Choisir un personnage et un surnom</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md text-center"
          />
          <button className="mt-3 py-2 px-4 bg-yellow-400 rounded-md font-semibold hover:bg-yellow-500">
            ✔ Validée
          </button>
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
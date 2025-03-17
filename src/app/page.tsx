"use client";

import { useState } from "react";

const App = () => {
  const [nickname, setNickname] = useState("AlQuaïda✌️");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-col items-center mb-6">
        {/* <img src="/bug-icon.png" alt="Bug Hunter Arena Logo" className="w-12 mb-2" /> */}
        <h1 className="text-xl font-bold">Bug Hunter Arena</h1>
      </header>

      {/* Buttons */}
      <div className="w-full max-w-md flex flex-col gap-4">
        <a href="/join-room">
          <button className="w-full py-3 text-lg font-semibold bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-500">
            ➡ Rejoindre une Partie
          </button>
        </a>
        <a href="/create-room">
          <button className="w-full py-3 text-lg font-semibold bg-white border-2 border-yellow-400 rounded-lg shadow-md hover:bg-yellow-100">
            ➕ Crée une Partie
          </button>
        </a>
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
          <p className="text-sm text-gray-600 text-center">
            Chaque équipe désigne un expert en PHP, JavaScript (ReactJS), C++, C# et mobile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

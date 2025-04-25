"use client"; // If using the Next.js App Router
import React from "react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Page() {
  interface IRoom extends Document {
    scores_a: number;
    scores_b: number;
    name: string;
    connectionId: number;
  }

  const [room, setRoom] = useState<IRoom | null>(null);

  const searchParams = useSearchParams();
  const connectionId = searchParams.get("id");
  const nickname = searchParams.get("nickname");

  const goHome = () => {
    redirect("/");
  };

  function getLanguages() {
    return [
      { id: "lang-js", label: "JavaScript" },
      { id: "lang-css", label: "Css" },
      { id: "lang-html", label: "Html" },
      { id: "lang-csharp", label: "C#" },
      { id: "lang-php", label: "Php" },
      { id: "lang-python", label: "Python" },
    ];
  }

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/getRoomFromId?id=${connectionId}`); // Replace 123 with the actual room ID
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room:", error);
      }
    };

    fetchRoom();
  }, [connectionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Room ID and Delete Button */}
      <div className="rounded-2xl border-2 border-gray-200 p-4 mb-4 max-w-5xl flex items-center justify-between">
        {/* Room ID */}
        <p className="text-lg font-semibold">
          Room ID: {connectionId || "Loading..."}
        </p>
      </div>

      {/* Main container with two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
        {/* Left Column: Room Name + Teams */}
        <div className="rounded-2xl border-2 border-gray-200 p-4">
          {/* Header row: Room Name + refresh icon */}
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {nickname !== "" ? nickname : "Loading..."}&#39;s room
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                title="Refresh"
                onClick={goHome}
              >
                <img
                  src="/assets/img/return.png"
                  alt="Return"
                  className="w-7 h-7"
                />
              </button>
            </div>
            {/* Gray line */}
            <hr className="border-gray-200 mt-2" />
          </div>

          {/* Équipe Bleu */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <p className="font-semibold">équipe Bleu</p>
              <img
                src="/assets/img/t-shirt_blue.png"
                alt="Équipe Bleu"
                className="w-5 h-5"
              />
            </div>
            {/* Each user has a placeholder image on the left */}
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>AlQuaida 🪖</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>McGrégor</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>PingPong</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>9/11</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>coubeh</span>
            </div>
          </div>

          {/* Équipe Rouge */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <p className="font-semibold">équipe Rouge</p>
              <img
                src="/assets/img/t-shirt_red.png"
                alt="Équipe Bleu"
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>AlQuaïda 🪖</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>McGrégor</span>
            </div>
          </div>
        </div>

        {/* Right Column: Maîtres du Jeu + Paramètre de Jeu */}
        <div className="flex flex-col space-y-4">
          {/* Maîtres du Jeu (still using radio buttons) */}
          <div className="rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center mb-4 space-x-2">
              <h2 className="text-xl font-semibold">Maîtres du Jeu</h2>
              <span role="img" aria-label="Game Master" className="text-2xl">
                <img
                  src="/assets/img/mvp.png"
                  alt="Return"
                  className="w-7 h-7"
                />
              </span>
            </div>
            {/* Gray line */}
            <hr className="border-gray-200 mb-4" />
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>McSmart</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>métroD</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>Jean</span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>arghhh</span>
            </div>
          </div>

          {/* Paramètre de Jeu */}
                  <div className="rounded-2xl border-2 border-gray-200 p-4">
          <div className="flex items-center mb-4 space-x-2">
            <h2 className="text-xl font-semibold">Paramètre de Jeu</h2>
            <img
              src="/assets/img/setting.png"
              alt="Settings"
              className="w-7 h-7"
            />
          </div>
          {/* Gray line */}
          <hr className="border-gray-200 mb-4" />
        
          {/* Conteneur avec espacement uniforme */}
          <div className="space-y-4">
            {/* Delete button */}
            <button
              type="button"
              className="text-red-500 hover:text-red-700 flex items-center"
              onClick={() => {
                if (confirm("Are you sure you want to delete this game?")) {
                  // Add your delete logic here
                  console.log("Game deleted");
                }
              }}
            >
              <span className="mr-2">Supprimer la game</span>
              <img
                src="/assets/img/trash.png"
                alt="Delete Game"
                className="w-6 h-6"
              />
            </button>
        
            {/* Durée des manches */}
            <div className="flex items-center space-x-4">
              <label htmlFor="duree" className="font-medium">
                Durée des manches (en Secondes)
              </label>
              <input
                id="duree"
                type="number"
                defaultValue={260}
                className="border border-gray-300 rounded-lg px-3 py-1 w-32"
              />
            </div>
        
            {/* Difficulté */}
            <div className="mb-4 flex items-center space-x-4">
              <p className="font-medium">Difficulté</p>
              <div className="flex items-center space-x-2">
                {["1", "2", "3"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg cursor-pointer text-md font-semibold"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      className="hidden"
                      onChange={(e) => {
                        e.target.parentElement?.classList.add("bg-gray-300");
                        document
                          .querySelectorAll('input[name="difficulty"]')
                          .forEach((input) => {
                            if (input !== e.target) {
                              input.parentElement?.classList.remove(
                                "bg-gray-300"
                              );
                            }
                          });
                      }}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Langages */}
            <div>
              <p className="font-medium mb-2">Langages :</p>
              <div className="grid grid-cols-3 gap-4">
                {getLanguages().map((lang) => (
                  <div
                    key={lang.id}
                    className="flex items-center space-x-3 p-1"
                  >
                    <label htmlFor={lang.id} className="">
                      {lang.label}
                    </label>
                    <input
                      type="checkbox"
                      id={lang.id}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

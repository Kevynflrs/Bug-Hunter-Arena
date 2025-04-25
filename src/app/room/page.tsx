"use client"; // If using the Next.js App Router
import React from "react";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation'
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
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Main container with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                {/* Left Column: Room Name + Teams */}
                <div className="rounded-2xl border-2 border-gray-200 p-4">
                    {/* Header row: Room Name + refresh icon */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{nickname !="" ? nickname : "Loading..."}&#39;s room</h2>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            title="Refresh"
                            onClick={goHome}
                        >
                            ↻
                        </button>
                    </div>

                    {/* Équipe Bleu */}
                    <div className="mb-4">
                        <p className="font-semibold mb-2">équipe Bleu</p>
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
                        <p className="font-semibold mb-2">équipe Rouge</p>
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
                                🧙
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <img
                                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                alt="profile"
                                className="w-6 h-6 rounded-full bg-gray-300 border"
                            />
                            <span>
                                McSmart
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <img
                                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                alt="profile"
                                className="w-6 h-6 rounded-full bg-gray-300 border"
                            />
                            <span >
                                métroD
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <img
                                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                alt="profile"
                                className="w-6 h-6 rounded-full bg-gray-300 border"
                            />
                            <span >
                                Jean
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <img
                                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                                alt="profile"
                                className="w-6 h-6 rounded-full bg-gray-300 border"
                            />
                            <span >
                                arghhh
                            </span>
                        </div>
                    </div>

                    {/* Paramètre de Jeu */}
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <h2 className="text-xl font-semibold mb-4">Paramètre de Jeu</h2>

                        {/* Durée des manches */}
                        <div className="mb-4">
                            <label htmlFor="duree" className="block font-medium mb-1">
                                Durée des manches (en Secondes)
                            </label>
                            <input
                                id="duree"
                                type="number"
                                defaultValue={260}
                                className="border border-gray-300 rounded px-2 py-1 w-32"
                            />
                        </div>

                        {/* Difficulté */}
                        <div className="mb-4">
                            <p className="font-medium mb-2">Difficulté</p>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input type="radio" name="difficulte" id="diff-1" />
                                    <label htmlFor="diff-1">1</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="radio" name="difficulte" id="diff-2" />
                                    <label htmlFor="diff-2">2</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="radio" name="difficulte" id="diff-3" />
                                    <label htmlFor="diff-3">3</label>
                                </div>
                            </div>
                        </div>

                        {/* Langages */}
                        <div>
                            <p className="font-medium mb-2">Langages</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-js" />
                                    <label htmlFor="lang-js">JavaScript</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-css" />
                                    <label htmlFor="lang-css">Css</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-html" />
                                    <label htmlFor="lang-html">Html</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-csharp" />
                                    <label htmlFor="lang-csharp">C#</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-php" />
                                    <label htmlFor="lang-php">Php</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="lang-python" />
                                    <label htmlFor="lang-python">Python</label>
                                </div>
                            </div>
                        </div>

                        {/* Bouton pour lancer la partie */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => redirect("/in-game")}
                                className="py-3 px-6 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
                            >
                                Lancer la Partie
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

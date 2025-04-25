"use client"; // If using the Next.js App Router
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { socket } from "@/socket";

const UUID_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

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
    const [name, setName] = useState<string>(nickname || ""); // Initialize with an empty string or a default value

    const goHome = () => {
        redirect("/");
    };

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await fetch(`/api/getRoomFromId?id=${connectionId}`);
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

        function onConnect() {
            console.log("Connected to socket:", socket.id);

            const storedUUID = localStorage.getItem("sessionID");
            const storedTimestamp = localStorage.getItem("sessionTimestamp");
            const currentTime = Date.now();

            if (storedUUID && storedTimestamp && currentTime - Number(storedTimestamp) < UUID_EXPIRATION_TIME) {
                console.log("Reusing existing UUID:", storedUUID);
                localStorage.setItem("sessionTimestamp", currentTime.toString()); // Reset the timer
                setName(localStorage.getItem("name") || ""); // Retrieve the nickname from localStorage
            } else {
                console.log("Requesting new UUID from server");
                console.log("Connection ID:", connectionId);
                console.log("Nickname:", name);
                socket.emit("request_uuid", connectionId); // Request a new UUID from the server
            }
        }

        function onDisconnect() {
            console.log("Disconnected from socket, reason:", socket.disconnected);
        }

        socket.on("assign_uuid", (sessionID) => {
            console.log("Received UUID from server:", sessionID);
            const currentTime = Date.now();
            localStorage.setItem("sessionID", sessionID); // Store UUID in localStorage
            localStorage.setItem("sessionTimestamp", currentTime.toString()); // Store timestamp
            localStorage.setItem("name", name);
        });

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("user_joined", (user) => {
            console.log("User joined:", user);
        });

        socket.emit("join_room", connectionId, name, localStorage.getItem("sessionID"));
        socket.on("room_joined", (playersInRoom) => {
            console.log("Room joined successfully:", playersInRoom);
        });

        // Emit join_room event with connectionId, name, and UUID
        // const sessionID = localStorage.getItem("sessionID");
        // console.log("Joining room with connectionId:", connectionId, "and sessionID:", sessionID);
        // socket.emit("join_room", { connectionId, name, sessionID });

        // socket.emit('choose_team', 'red');

        // socket.on('team_chosen', ({ sessionID, team }) => {
        //     console.log(`User ${sessionID} joined team ${team}`);
        // });

        // socket.on('invalid_team', (message) => {
        //     console.error(message);
        // });

        // Ensure the socket disconnects when the component unmounts
        return () => {
            console.log("Cleaning up socket connection...");
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("assign_uuid");
            socket.disconnect(); // Explicitly disconnect the socket
        };
    }, [name, connectionId]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Main container with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                {/* Left Column: Room Name + Teams */}
                <div className="rounded-2xl border-2 border-gray-200 p-4">
                    {/* Header row: Room Name + refresh icon */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{room?.name != null ? room.name : "Loading..."}&#39;s room</h2>
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
                    </div>

                    {/* Équipe Rouge */}
                    <div>
                        <p className="font-semibold mb-2">équipe Rouge</p>

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
                    </div>
                </div>
            </div>
        </div>
    );
}

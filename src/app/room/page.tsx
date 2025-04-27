"use client"; // If using the Next.js App Router
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"; // Remplacez l'importation

import { getSocket } from "@/socket";

const socket = getSocket();

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
    const [usersList, setUsersList] = useState<string[]>([]); // State to store the list of users

    const [teamMembers, setTeamMembers] = useState({ red: [], blue: [], spectator: [], admin: [] });
    const [error, setError] = useState<string | null>(null);

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

        socket.on("user_joined", (users) => {
            console.log("User joined:", users);
            setUsersList((prevUsers) => Array.isArray(users) ? [...prevUsers, ...users] : prevUsers);
        });

        socket.on("team_update_full", (updatedTeams) => {
          setTeamMembers(updatedTeams);
        });

        socket.on("team_full", (message) => {
          setError(message);
          setTimeout(() => setError(null), 3000);
        });

        socket.emit("join_room", connectionId, name, localStorage.getItem("sessionID"));
        socket.on("room_joined", (playersInRoom) => {
            console.log("Room joined successfully:", playersInRoom);
            setUsersList(Array.isArray(playersInRoom) ? playersInRoom : []); // Ensure usersList is always an array
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

    const handleJoinTeam = (team: 'red' | 'blue' | 'spectator' | 'admin') => {
      const sessionID = localStorage.getItem("sessionID");
      if (!sessionID) return;
      socket.emit("join_team", { team, sessionID });
    };

    return (



    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Room ID */}
        <div className="rounded-2xl border-2 border-gray-200 p-4 mb-4 max-w-5xl flex items-center justify-between">
          <p className="text-lg font-semibold">
            Room ID: {connectionId || "Loading..."}
          </p>
          <button
            type="button"
            className="ml-2"
            onClick={() => {
              if (connectionId) {
            navigator.clipboard.writeText(connectionId);
            alert("Room ID copied to clipboard!");
              }
            }}
          >
            <img
              src="/assets/img/copy.png"
              alt="Copy"
              className="w-6 h-6 cursor-pointer"
            />
          </button>
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

                              {/* Join team buttons and error display */}
                    {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

                    {/* Équipe Bleu */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Équipe Bleu</p>
                        <button onClick={() => handleJoinTeam('blue')} className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
                          Rejoindre
                        </button>
                      </div>
                      {teamMembers.blue.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <img
                            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                            alt="profile"
                            className="w-6 h-6 rounded-full bg-gray-300 border"
                          />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>

          {/* Équipe Rouge */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Équipe Rouge</p>
                        <button onClick={() => handleJoinTeam('red')} className="bg-red-600 text-white text-sm px-3 py-1 rounded">
                          Rejoindre
                        </button>
                      </div>
                      {teamMembers.red.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <img
                            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                            alt="profile"
                            className="w-6 h-6 rounded-full bg-gray-300 border"
                          />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
          
                              {/* Équipe Spectateur */}
                    {/* <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Spectateurs</p>
                        <button onClick={() => handleJoinTeam('spectator')} className="bg-gray-600 text-white text-sm px-3 py-1 rounded">
                          Rejoindre
                        </button>
                      </div>
                      {teamMembers.spectator.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="profile" className="w-6 h-6 rounded-full bg-gray-300 border" />
                          <span>{user}</span>
                        </div>
                      ))}
                    </div> */}

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

                {/* Right Column: Maîtres du Jeu + Paramètre de Jeu */}
                <div className="flex flex-col space-y-4">
                    {/* Maîtres du Jeu (still using radio buttons) */}
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-semibold">Maîtres du Jeu</h2>
                            <span role="img" aria-label="Game Master" className="text-2xl">🧙</span>
                          </div>
                          <button onClick={() => handleJoinTeam('admin')} className="bg-yellow-500 text-white text-sm px-3 py-1 rounded">
                            Rejoindre
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                        {teamMembers.admin.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="profile" className="w-6 h-6 rounded-full bg-gray-300 border" />
                          <span>{name}</span>
                        </div>
                      ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-semibold">Spectateurs</h2>
                            <span role="img" aria-label="Game Master" className="text-2xl">🔍</span>
                          </div>
                          <button onClick={() => handleJoinTeam('spectator')} className="bg-gray-600 text-white text-sm px-3 py-1 rounded">
                          Rejoindre
                        </button>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                        {teamMembers.spectator.map((user, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="profile" className="w-6 h-6 rounded-full bg-gray-300 border" />
                          <span>{name}</span>
                        </div>
                      ))}
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

              {/* Buttons container */}
              <div className="flex justify-between mt-4">
                {/* Play button */}
                <button
                  type="button"
                  className="text-green-500 hover:text-green-700 flex items-center"
                >
                  <span className="mr-2">Lancer la partie</span>
                  <img
                    src="/assets/img/play.png"
                    alt="Lancer la partie"
                    className="w-6 h-6"
                  />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 flex items-center"
                  onClick={async () => {
                    if (
                      confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")
                    ) {
                      try {
                        const response = await fetch(`/api/deleteRoom`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ id: connectionId }),
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error("Erreur API :", errorData);
                          throw new Error(
                            errorData.message ||
                              "Échec de la suppression de la salle"
                          );
                        }

                        alert("Partie supprimée avec succès !");
                        router.push("/");
                      } catch (error) {
                        console.error(
                          "Erreur lors de la suppression de la salle :",
                          error
                        );
                        alert(
                          "Une erreur s'est produite lors de la suppression de la partie."
                        );
                      }
                    }
                  }}
                >
                  <span className="mr-2">Supprimer la partie</span>
                  <img
                    src="/assets/img/trash.png"
                    alt="Supprimer la partie"
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

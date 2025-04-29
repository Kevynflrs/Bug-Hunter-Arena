"use client"; // If using the Next.js App Router
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [name, setName] = useState<string>(nickname || ""); // Initialize with an empty string or a default value
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"error" | "success" | "info">(
    "info"
  );

  const [teamRed, setTeamRed] = useState<string[]>([]);
  const [teamBlue, setTeamBlue] = useState<string[]>([]);
  const [teamSpectator, setTeamSpectator] = useState<string[]>([]);
  const [teamAdmin, setTeamAdmin] = useState<string[]>([]);


  const goHome = () => {
    redirect("/");
  };

  const handleCopyRoomId = () => {
    if (connectionId) {
      navigator.clipboard.writeText(connectionId);
      setToastMessage("Room ID copied to clipboard!");
      setToastType("success");
      setShowToast(true);
    } else {
      setToastMessage("Failed to copy Room ID!");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleJoinTeam = (team: 'red' | 'blue' | 'spectator' | 'admin') => {
    console.log("Joining team:", team); // Add this log
    const sessionID = localStorage.getItem("sessionID");
    if (!sessionID) {
      console.error("No sessionID found in localStorage");
      return;
    }
    socket.emit("join_room", connectionId, name, localStorage.getItem("sessionID"), team);
    localStorage.setItem("team", team);
    console.log(teamSpectator);
    // socket.emit("join_team", { team, sessionID, connectionId });
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = () => {
      if (!socket.connected) {
        socket.connect();
      }

      function onConnect() {
        console.log("Connected to socket:", socket.id);

        const storedUUID = localStorage.getItem("sessionID");
        const storedTimestamp = localStorage.getItem("sessionTimestamp");
        const storedRoomId = localStorage.getItem("roomId");
        const currentTime = Date.now();

        if (storedUUID && storedTimestamp && currentTime - Number(storedTimestamp) < UUID_EXPIRATION_TIME && storedRoomId === connectionId) {
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

      if (socket) {
        // Clean up previous listeners to avoid duplicates
        socket.off("connect");
        socket.off("disconnect");
        socket.off("assign_uuid");
        socket.off("user_joined");
        socket.off("room_joined");

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("assign_uuid", (sessionID) => {
          console.log("Received UUID from server:", sessionID);
          const currentTime = Date.now();
          localStorage.setItem("sessionID", sessionID); // Store UUID in localStorage
          localStorage.setItem("sessionTimestamp", currentTime.toString()); // Store timestamp
          localStorage.setItem("name", name);
          localStorage.setItem("team", "spectator");
        });

        socket.on("user_joined", (user) => {
          console.log("User joined:", user);
          // setUsersList((prevUsers) => Array.isArray(user) ? [...prevUsers, ...user] : prevUsers);
          

          if (user.team === "spectator") {
            setTeamSpectator((prevSpectators) => {
              if (!prevSpectators.includes(user.name)) {
                setTeamRed((prevRed) =>
                  prevRed.filter((member) => member !== user.name)
                );
                setTeamBlue((prevBlue) =>
                  prevBlue.filter((member) => member !== user.name)
                );
                setTeamAdmin((prevAdmin) =>
                  prevAdmin.filter((member) => member !== user.name)
                );
                return [...prevSpectators, user.name];
              }
              return prevSpectators;
            });
          }

          if (user.team === "red") {
            setTeamRed((prevRed) => {
              if (!prevRed.includes(user.name)) {
                setTeamSpectator((prevRed) =>
                  prevRed.filter((member) => member !== user.name)
                );
                setTeamBlue((prevBlue) =>
                  prevBlue.filter((member) => member !== user.name)
                );
                setTeamAdmin((prevAdmin) =>
                  prevAdmin.filter((member) => member !== user.name)
                );
                return [...prevRed, user.name];
              }
              return prevRed;
            });
          }
          if (user.team === "blue") {
            setTeamBlue((prevBlue) => {
              if (!prevBlue.includes(user.name)) {    
                setTeamSpectator((prevRed) =>
                  prevRed.filter((member) => member !== user.name)
                );
                setTeamRed((prevBlue) =>
                  prevBlue.filter((member) => member !== user.name)
                );
                setTeamAdmin((prevAdmin) =>
                  prevAdmin.filter((member) => member !== user.name)
                );
                
                return [...prevBlue, user.name];
              }
              return prevBlue;
            });
          }
          if (user.team === "admin") {
            setTeamAdmin((prevAdmin) => {
              if (!prevAdmin.includes(user.name)) {
                setTeamSpectator((prevRed) =>
                  prevRed.filter((member) => member !== user.name)
                );
                setTeamRed((prevBlue) =>
                  prevBlue.filter((member) => member !== user.name)
                );
                setTeamBlue((prevAdmin) =>
                  prevAdmin.filter((member) => member !== user.name)
                );

                return [...prevAdmin, user.name];
              }
              return prevAdmin;
            });
          }


        });

        socket.emit("join_room", connectionId, name, localStorage.getItem("sessionID"), localStorage.getItem("team"));

        socket.on("room_joined", (playersInRoom) => {
          console.log("Room joined successfully:", playersInRoom);
        
          interface Player {
            name: string;
            team: 'spectator' | 'red' | 'blue' | 'admin';
          }

          playersInRoom.forEach((user: Player) => {
            console.log("User in room:", user);

            if (user.team === "spectator") {
              setTeamSpectator((prevSpectators) => {
                if (!prevSpectators.includes(user.name)) {
                  setTeamRed((prevRed) =>
                    prevRed.filter((member) => member !== user.name)
                  );
                  setTeamBlue((prevBlue) =>
                    prevBlue.filter((member) => member !== user.name)
                  );
                  setTeamAdmin((prevAdmin) =>
                    prevAdmin.filter((member) => member !== user.name)
                  );
                  return [...prevSpectators, user.name];
                }
                return prevSpectators;
              });
            }

            if (user.team === "red") {
              setTeamRed((prevRed) => {
                if (!prevRed.includes(user.name)) {
                  setTeamSpectator((prevRed) =>
                    prevRed.filter((member) => member !== user.name)
                  );
                  setTeamBlue((prevBlue) =>
                    prevBlue.filter((member) => member !== user.name)
                  );
                  setTeamAdmin((prevAdmin) =>
                    prevAdmin.filter((member) => member !== user.name)
                  );
                  return [...prevRed, user.name];
                }
                return prevRed;
              });
            }

            if (user.team === "blue") {
              setTeamBlue((prevBlue) => {
                if (!prevBlue.includes(user.name)) {
                  setTeamSpectator((prevRed) =>
                    prevRed.filter((member) => member !== user.name)
                  );
                  setTeamRed((prevBlue) =>
                    prevBlue.filter((member) => member !== user.name)
                  );
                  setTeamAdmin((prevAdmin) =>
                    prevAdmin.filter((member) => member !== user.name)
                  );
                  return [...prevBlue, user.name];
                }
                return prevBlue;
              });
            }

            if (user.team === "admin") {
              setTeamAdmin((prevAdmin) => {
                if (!prevAdmin.includes(user.name)) {
                  setTeamSpectator((prevRed) =>
                    prevRed.filter((member) => member !== user.name)
                  );
                  setTeamRed((prevBlue) =>
                    prevBlue.filter((member) => member !== user.name)
                  );
                  setTeamBlue((prevAdmin) =>
                    prevAdmin.filter((member) => member !== user.name)
                  );
                  return [...prevAdmin, user.name];
                }
                return prevAdmin;
              });
            }
          });
        });

        socket.on('game_starting', (settings) => {
          const queryParams = new URLSearchParams({
            ...settings,
            id: connectionId || '',
          }).toString();
  
          router.push(`/in-game?${queryParams}`);
        });
      }
    };

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/getRoomFromId?id=${connectionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
        const data = await response.json();
        if (isMounted) setRoom(data); // Only update state if mounted
      } catch (error) {
        console.error("Error fetching room:", error);
      }
    };

    fetchRoom();
    initializeSocket();

    return () => {
      isMounted = false; // Mark as unmounted
      console.log("Cleaning up socket connection...");
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("assign_uuid");
        socket.off("user_joined");
        socket.off("room_joined");
        socket.off("game_starting"); // N'oubliez pas de nettoyer le listener
        socket.disconnect(); // Explicitly disconnect the socket
      }
    };
  }, [connectionId, name, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Room ID */}
      <div className="flex items-center justify-center space-x-8">
        <div className="rounded-2xl border-2 border-gray-200 p-4 mb-4 max-w-5xl flex items-center justify-between">
          <p className="text-lg font-semibold">
            Room ID: {connectionId || "Loading..."}
          </p>
          <button type="button" className="ml-2" onClick={handleCopyRoomId}>
            <Image
              src="/assets/img/copy.png"
              alt="Copy"
              width={64}
              height={64}
              className="w-6 h-6 cursor-pointer"
            />
          </button>
        </div>

        {/* Go Back Button */}
        <div className="rounded-2xl border-2 border-gray-200 p-4 mb-4 max-w-5xl flex items-center justify-between">
          <p className="text-lg font-semibold">retourner à l&apos;accueil</p>
          <button
            type="button"
            className="ml-2 text-gray-500 hover:text-gray-700"
            title="go back to home"
            onClick={goHome}
          >
            <Image
              src="/assets/img/return.png"
              alt="Return"
              width={64}
              height={64}
              className="w-7 h-7 cursor-pointer"
            />
          </button>
        </div>
      </div>

      {/* Affiche le toast si nécessaire */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType} // Passez le type de toast
          onClose={() => setShowToast(false)}
        />
      )}


      {/* List of users in the room */}
      <div className="grid grid-cols-3 gap-25 w-full h-[700px] max-w-7xl">
        {/* Équipe Bleue */}
        <div className="rounded-2xl border-2 border-blue-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-blue-500">Équipe Bleu</h2>
            <Image
              src="/assets/img/t-shirt_blue.png"
              alt="Join Blue Team"
              width={32}
              height={32}
            />

            <button
              onClick={() => handleJoinTeam("blue")}
              className="bg-blue-600 text-white text-sm ml-12 px-3 py-1 rounded hover:bg-blue-800 cursor-pointer"
            >
              Rejoindre
            </button>
          </div>

          {/* Gray line */}
          <hr className="border-gray-200 mb-4" />

          {/* List of blue team members */}
          {teamBlue.map((user, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Image
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
                width={32}
                height={32}
              />
              <span>{user}</span>
            </div>
          ))}
        </div>

        {/* Spectateurs */}
        <div className="rounded-2xl border-2 border-gray-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-500">Spectateurs</h2>
            <Image
              src="/assets/img/eyes.png"
              alt="Join Spectateurs"
              width={32}
              height={32}
            />
            <button
              onClick={() => handleJoinTeam("spectator")}
              className="bg-gray-600 text-white text-sm ml-12 px-3 py-1 rounded hover:bg-gray-800 cursor-pointer"
            >
              Rejoindre
            </button>
          </div>

          {/* Gray line */}
          <hr className="border-gray-200 mb-4" />

          {/* List of spectators */}
          <div className="flex items-center space-x-2 mb-2">
            {teamSpectator.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Image
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt="profile"
                  className="w-6 h-6 rounded-full bg-gray-300 border"
                  width={32}
                  height={32}
                />
                <span>{user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe Rouge */}
        <div className="rounded-2xl border-2 border-red-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-red-500">Équipe Rouge</h2>
            <Image
              src="/assets/img/t-shirt_red.png"
              alt="Join red Team"
              width={32}
              height={32}
            />
            <button
              onClick={() => handleJoinTeam("red")}
              className="bg-red-600 text-white text-sm ml-8 px-3 py-1 rounded hover:bg-red-800 cursor-pointer"
            >
              Rejoindre
            </button>
          </div>

          {/* Gray line */}
          <hr className="border-gray-200 mb-4" />

          {/* List of red team members */}
          {teamRed.map((user, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Image
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
                width={32}
                height={32}
              />
              <span>{user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

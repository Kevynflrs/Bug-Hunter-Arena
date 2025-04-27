"use client"; // If using the Next.js App Router
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";

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
  // const router = useRouter();
  const [name, setName] = useState<string>(nickname || ""); // Initialize with an empty string or a default value
  const [usersList, setUsersList] = useState<string[]>([]); // State to store the list of users

  const [teamMembers, setTeamMembers] = useState({
    red: [],
    blue: [],
    spectator: [],
    admin: [],
  });
  const [error, setError] = useState<string | null>(null);

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

      if (
        storedUUID &&
        storedTimestamp &&
        currentTime - Number(storedTimestamp) < UUID_EXPIRATION_TIME
      ) {
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
      setUsersList((prevUsers) =>
        Array.isArray(users) ? [...prevUsers, ...users] : prevUsers
      );
    });

    socket.on("team_update_full", (updatedTeams) => {
      setTeamMembers(updatedTeams);
    });

    socket.on("team_full", (message) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    socket.emit(
      "join_room",
      connectionId,
      name,
      localStorage.getItem("sessionID")
    );
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

  const handleJoinTeam = (team: "red" | "blue" | "spectator" | "admin") => {
    const sessionID = localStorage.getItem("sessionID");
    if (!sessionID) return;
    socket.emit("join_team", { team, sessionID });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Room ID */}
      <div className="flex items-center justify-center space-x-8">
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

      {/* Join team buttons and error display */}
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

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
          {teamMembers.blue.map((user, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Image
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>{name}</span>
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
            {teamMembers.spectator.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Image
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt="profile"
                  className="w-6 h-6 rounded-full bg-gray-300 border"
                />
                <span>{name}</span>
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
          {teamMembers.red.map((user, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Image
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                alt="profile"
                className="w-6 h-6 rounded-full bg-gray-300 border"
              />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

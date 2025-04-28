"use client"; // If using the Next.js App Router
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
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
  const [usersList, setUsersList] = useState<string[]>([]); // State to store the list of users

  const [teamMembers, setTeamMembers] = useState({
    red: [],
    blue: [],
    spectator: [],
    admin: [],
  });
  const [error, setError] = useState<string | null>(null);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [difficulte, setDifficulte] = useState<number>(1);
  const [duree, setDuree] = useState<number>(260);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Cache le toast après 3 secondes
  };

  const goHome = () => {
    redirect("/");
  };
  const goHome = () => {
    redirect("/");
  };

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleStartGame = () => {
    if (selectedLanguages.length === 0) {
      setError("Veuillez sélectionner au moins un langage");
      return;
    }

    const queryParams = new URLSearchParams({
      languages: selectedLanguages.join(","),
      id: connectionId || "",
      difficulty: difficulte.toString(),
      duration: duree.toString(),
    }).toString();

    router.push(`/in-game?${queryParams}`);
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
  function getLanguages() {
    return [
      { id: "js", label: "JavaScript" },
      { id: "Cpp", label: "C++" },
      { id: "html", label: "Html" },
      { id: "Csharp", label: "C#" },
      { id: "PHP", label: "PHP" },
    ];
  }

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    const initializeSocket = () => {
      if (!socket.connected) {
        socket.connect(); // Explicitly connect the socket if not already connected
      }

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

      if (socket) {
        // Clean up previous listeners to avoid duplicates
        socket.off("connect");
        socket.off("disconnect");
        socket.off("assign_uuid");
        socket.off("user_joined");
        socket.off("team_update_full");
        socket.off("team_full");
        socket.off("room_joined");

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("assign_uuid", (sessionID) => {
          console.log("Received UUID from server:", sessionID);
          const currentTime = Date.now();
          localStorage.setItem("sessionID", sessionID); // Store UUID in localStorage
          localStorage.setItem("sessionTimestamp", currentTime.toString()); // Store timestamp
          localStorage.setItem("name", name);
        });

        socket.on("user_joined", (users) => {
          console.log("User joined:", users);
          setUsersList((prevUsers) =>
            Array.isArray(users) ? [...prevUsers, ...users] : prevUsers
          );
        });

        socket.on("team_update_full", (updatedTeams) => {
          console.log("Team update received:", updatedTeams);
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
        socket.off("team_update_full");
        socket.off("team_full");
        socket.off("room_joined");
        socket.disconnect(); // Explicitly disconnect the socket
      }
    };
  }, [connectionId, name]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

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
              showToastMessage("Room ID copied to clipboard!", "success");
            }
          }}
        >
          <Image
            src="/assets/img/copy.png"
            alt="Copy"
            width={32}
            height={32}
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
                {room?.name != null ? `${room.name}'s room` : "Loading..."}
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Retourner à l'accueil"
                onClick={goHome}
              >
                <Image
                  src="/assets/img/return.png"
                  alt="Return"
                  width={32}
                  height={32}
                  className="w-7 h-7"
                />
              </button>
            </div>
            {/* Gray line */}
            <hr className="border-gray-200 mt-2" />
          </div>

          {/* Join team buttons and error display */}
          {error && (
            <div className="text-red-500 font-semibold mb-4">{error}</div>
          )}

          {/* Équipe Bleu */}
          <div className="mb-4">
            <div className="flex items-center mb-2 space-x-2">
              <p className="font-semibold text-blue-500">Équipe Bleu</p>
              <Image
                src="/assets/img/t-shirt_blue.png"
                alt="Blue Team"
                width={32}
                height={32}
                className="w-7 h-7"
              />
            </div>
            {teamMembers.blue.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Image
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt="profile"
                  width={32}
                  height={32}
                  className="w-6 h-6 rounded-full bg-gray-300 border"
                />
                <span>{user}</span>
              </div>
            ))}
          </div>

          {/* Équipe Rouge */}
          <div>
            <div className="flex items-center mb-2 space-x-2">
              <p className="font-semibold text-red-500">Équipe Rouge</p>
              <Image
                src="/assets/img/t-shirt_red.png"
                alt="Red Team"
                width={32}
                height={32}
                className="w-7 h-7"
              />
            </div>
            {teamMembers.red.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Image
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt="profile"
                  className="w-6 h-6 rounded-full bg-gray-300 border"
                  width={32}
                  height={32}
                />
                <span className="text-red-500">{user}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center mb-2 space-x-2">
              <p className="font-semibold text-gray-500">Spectateurs</p>
              <Image
                src="/assets/img/eyes.png"
                alt="Spectateurs"
                width={32}
                height={32}
                className="w-7 h-7"
              />
            </div>
            {teamMembers.spectator.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Image
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt="profile"
                  width={32}
                  height={32}
                  className="w-6 h-6 rounded-full bg-gray-300 border"
                />
                <span>{user}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right Column: Maîtres du Jeu + Paramètre de Jeu */}
        <div className="flex flex-col space-y-4">
          {/* Maîtres du Jeu (still using radio buttons) */}
          <div className="rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center mb-4 space-x-2">
                <h2 className="text-xl font-semibold">Maîtres du Jeu</h2>
                <span role="img" aria-label="Game Master" className="text-2xl">
                  <Image
                    src="/assets/img/mvp.png"
                    alt="Return"
                    width={32}
                    height={32}
                    className="w-7 h-7"
                  />
                </span>
              </div>
            </div>
            {/* Gray line */}
            <hr className="border-gray-200 mb-4" />
            <div className="flex items-center space-x-2 mb-2">
              {teamMembers.admin.map((user, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Image
                    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                    alt="profile"
                    width={32}
                    height={32}
                    className="w-6 h-6 rounded-full bg-gray-300 border"
                  />
                  <span>{user}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètre de Jeu */}
          <div className="rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center mb-4 space-x-2">
              <h2 className="text-xl font-semibold">Paramètre de Jeu</h2>
              <Image
                src="/assets/img/setting.png"
                alt="Settings"
                width={32}
                height={32}
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
                <div className="rounded-2xl border-2 border-gray-200 p-4">
                  {/* Langages */}
                  <div>
                    <p className="font-medium mb-2">Langages :</p>
                    <div className="grid grid-cols-3 gap-4">
                      {getLanguages().map((lang) => (
                        <div
                          key={lang.id}
                          className="flex items-center space-x-3 p-1"
                        >
                          <label
                            htmlFor={lang.id}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={lang.id}
                              checked={selectedLanguages.includes(lang.id)}
                              onChange={() => handleLanguageToggle(lang.id)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span className="ml-2">{lang.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons container */}
                  <div className="flex justify-between mt-4 ">
                    {/* Play button */}
                    <button
                      type="button"
                      className="text-green-500 hover:text-green-700 flex items-center cursor-pointer"
                      onClick={handleStartGame}
                    >
                      <span className="mr-2">Lancer la partie</span>
                      <Image
                        src="/assets/img/play.png"
                        alt="Lancer la partie"
                        width={32}
                        height={32}
                        className="w-6 h-6"
                      />
                    </button>

                    {/* Delete button */}

                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 flex items-center cursor-pointer"
                      onClick={async () => {
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

                          showToastMessage(
                            "Partie supprimée avec succès !",
                            "success"
                          );
                          router.push("/");
                        } catch (error) {
                          console.error(
                            "Erreur lors de la suppression de la salle :",
                            error
                          );
                          showToastMessage(
                            "Une erreur s'est produite lors de la suppression de la partie.",
                            "error"
                          );
                        }
                      }}
                    >
                      <span className="mr-2">Supprimer la partie</span>
                      <Image
                        src="/assets/img/trash.png"
                        alt="Supprimer la partie"
                        width={32}
                        height={32}
                        className="w-6 h-6 "
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

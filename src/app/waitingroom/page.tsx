"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function WaitingRoom() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("id");

  // Simulate fetching initial data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`/api/getRoomFromId?id=${connectionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, [connectionId]);

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
          <Image
            src="/assets/img/copy.png"
            alt="Copy"
            width={64}
            height={64}
            className="w-6 h-6 cursor-pointer"
          />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-25 w-full h-[700px] max-w-7xl">
        {/* Équipe Bleue */}
        <div className="rounded-2xl border-2 border-blue-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-blue-500">
              Équipe Bleue
            </h2>
            <button className="text-blue-500 hover:text-blue-700 flex items-center">
              <Image
                src="/assets/img/t-shirt_blue.png"
                alt="Join Blue Team"
                width={32}
                height={32}
              />
            </button>
          </div>
        </div>

        {/* Spectateurs */}
        <div className="rounded-2xl border-2 border-gray-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-500">Spectateurs</h2>
            <button className="text-gray-500 hover:text-gray-700 flex items-center">
              <Image
                src="/assets/img/eyes.png"
                alt="Join Spectateurs"
                width={32}
                height={32}
              />
            </button>
          </div>
        </div>

        {/* Équipe Rouge */}
        <div className="rounded-2xl border-2 border-red-500 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-xl font-semibold text-red-500">Équipe Rouge</h2>
            <button className="text-red-500 hover:text-red-700 flex items-center">
              <Image
                src="/assets/img/t-shirt_red.png"
                alt="Join red Team"
                width={32}
                height={32}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

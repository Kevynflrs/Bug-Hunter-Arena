"use client";
import { useEffect, useState } from 'react';
import { socket } from '@/socket';

const UUID_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

function Editor() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      console.log('Connected to socket:', socket.id);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      // Check if UUID exists and is valid
      const storedUUID = localStorage.getItem('sessionID');
      const storedTimestamp = localStorage.getItem('sessionTimestamp');
      const currentTime = Date.now();

      if (storedUUID && storedTimestamp && currentTime - storedTimestamp < UUID_EXPIRATION_TIME) {
        console.log('Reusing existing UUID:', storedUUID);
        localStorage.setItem('sessionTimestamp', currentTime); // Reset the timer
      } else {
        console.log('Requesting new UUID from server');
        socket.emit('request_uuid'); // Request a new UUID from the server
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from socket, reason:', socket.disconnected);
      setTransport("N/A");
    }

    // Listen for UUID assignment from the server
    socket.on('assign_uuid', (sessionID) => {
      console.log('Received UUID from server:', sessionID);
      const currentTime = Date.now();
      localStorage.setItem('sessionID', sessionID); // Store UUID in localStorage
      localStorage.setItem('sessionTimestamp', currentTime); // Store timestamp
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("assign_uuid");
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
    </div>
  );
}

export default Editor;

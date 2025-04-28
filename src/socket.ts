"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(); // Initialize the socket connection only once
    }
    return socket;
};
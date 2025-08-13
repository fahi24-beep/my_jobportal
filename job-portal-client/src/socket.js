// src/socket.js
import { io } from "socket.io-client";

// Replace with your backend URL and port
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // optionally disable auto connect
});

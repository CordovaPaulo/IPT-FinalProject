import { io } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE;

export const createSocket = () => {
  return io(WS_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true
  });
};
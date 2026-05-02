import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";

export default function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL);

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return socket;
}
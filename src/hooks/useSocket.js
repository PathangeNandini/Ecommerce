import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!socketInstance) {
      socketInstance = io("http://localhost:5000", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep alive for app lifetime
    };
  }, []);

  return socketRef.current;
}

export default useSocket;

import io from "socket.io-client";

let socketInstance = null;

export const getSocket = (host) => {
  if (!host) return null;
  if (!socketInstance) {
    socketInstance = io(host, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

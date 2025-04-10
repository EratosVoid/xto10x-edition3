import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocketServer = (
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // Join a room based on locality when the client connects
      socket.on("join-locality", (locality: string) => {
        socket.join(locality);
        console.log(`Socket ${socket.id} joined room ${locality}`);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};

export const emitToLocality = (
  io: SocketIOServer,
  locality: string,
  event: string,
  data: any
) => {
  io.to(locality).emit(event, data);
};

// Events to emit
export const SOCKET_EVENTS = {
  NEW_POST: "new-post",
  NEW_DISCUSSION: "new-discussion",
  NEW_POLL_VOTE: "new-poll-vote",
  NEW_NOTIFICATION: "new-notification",
  POST_UPDATED: "post-updated",
};

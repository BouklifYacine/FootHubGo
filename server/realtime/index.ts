import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { auth } from "@/auth";
import { UNAUTHORIZED_ERROR, userRoom } from "@/lib/realtime/protocol";
import { setIO, type RealtimeServer } from "./emitter";
import { registerChatHandlers } from "./handlers/chat";
import { updatePresence } from "./handlers/presence";

/** Creates the Socket.IO server on top of the HTTP server and registers every handler. */
export function attachRealtime(httpServer: HttpServer): RealtimeServer {
  const io: RealtimeServer = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication: the better-auth session cookie is the only source of identity.
  // Client payloads never carry a user id.
  io.use(async (socket, next) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers({ cookie: socket.handshake.headers.cookie ?? "" }),
      });
      if (!session?.user) return next(new Error(UNAUTHORIZED_ERROR));

      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name;
      // Personal room: notifications and chat events for all the user's tabs.
      await socket.join(userRoom(session.user.id));
      next();
    } catch (error) {
      console.error("[realtime] authentication failed", error);
      next(new Error("authentication_failed"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data;
    registerChatHandlers(socket);

    const syncPresence = () =>
      updatePresence(io, userId).catch((error) => console.error("[realtime] presence failed", error));
    void syncPresence();
    socket.on("disconnect", () => void syncPresence());
  });

  setIO(io);
  return io;
}

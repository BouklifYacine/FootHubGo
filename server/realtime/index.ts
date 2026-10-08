import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { auth } from "@/auth";
import { UNAUTHORIZED_ERROR, userRoom } from "@/lib/realtime/protocol";
import { setIO, type RealtimeServer } from "./emitter";
import { registerChatHandlers } from "./handlers/chat";
import { updatePresence } from "./handlers/presence";
import { loggableError } from "@/lib/errors";

/** Creates the Socket.IO server on top of the HTTP server and registers every handler. */
export function attachRealtime(httpServer: HttpServer): RealtimeServer {
  const allowedOrigin = new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000").origin;
  const io: RealtimeServer = new Server(httpServer, {
    cors: { origin: allowedOrigin, credentials: true },
    // CORS does not cover the WebSocket upgrade: refuse cross-site handshakes (CSWSH).
    // Same-origin polling requests may carry no Origin header, so only a foreign one is refused.
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !origin || origin === allowedOrigin);
    },
    // Chat payloads are small (a message is sent through a server action, not the socket).
    maxHttpBufferSize: 16_000,
    connectTimeout: 10_000,
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
      // Lets sign-out close the sockets of that session only (see disconnectUserSockets).
      socket.data.sessionId = session.session.id;
      // Personal room: notifications and chat events for all the user's tabs.
      await socket.join(userRoom(session.user.id));
      next();
    } catch (error) {
      console.error("[realtime] authentication failed", loggableError(error));
      next(new Error("authentication_failed"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data;
    registerChatHandlers(socket);

    const syncPresence = () =>
      updatePresence(io, userId).catch((error) => console.error("[realtime] presence failed", loggableError(error)));
    void syncPresence();
    socket.on("disconnect", () => void syncPresence());
  });

  setIO(io);
  return io;
}

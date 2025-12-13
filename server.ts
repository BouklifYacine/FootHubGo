import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "cookie";
import { auth } from "@/auth";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || "");
      const sessionToken = cookies["better-auth.session_token"];

      if (!sessionToken) {
        console.log("❌ Connexion refusée: pas de session token");
        return next(new Error("Authentication required"));
      }

      const session = await auth.api.getSession({
        headers: {
          cookie: socket.handshake.headers.cookie || "",
        },
      });

      if (!session?.user) {
        console.log("❌ Connexion refusée: session invalide");
        return next(new Error("Invalid session"));
      }

      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name;

      socket.join(`user:${session.user.id}`);
      // Plus besoin de emit("register") côté client !
      // C'est fait côté serveur de façon sécurisée
      socket.join(`user:${session.user.id}`);

      console.log(
        `✅ ${session.user.name} authentifié et rejoint room:user:${session.user.id}`
      );

      next();
    } catch (error) {
      console.error("❌ Erreur d'authentification Socket:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Event "connection"
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    console.log(`🔌 ${userName} (${userId}) connecté`);

    // Rejoindre une conversation
    socket.on("chat:join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`👤 ${userName} a rejoint la conversation ${conversationId}`);
    });

    // Quitter une conversation
    socket.on("chat:leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Indicateur de frappe
    socket.on("chat:typing", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("chat:typing", {
        userId,
        userName,
        conversationId: data.conversationId,
      });
    });

    socket.on("chat:stop_typing", (data: { conversationId: string }) => {
      socket
        .to(`conversation:${data.conversationId}`)
        .emit("chat:stop_typing", {
          userId,
          conversationId: data.conversationId,
        });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 ${userName} déconnecté`);
    });
  });

  (global as any).io = io;

  const startServer = (port: number) => {
    httpServer
      .listen(port, () => {
        console.log(`🚀 Serveur prêt sur http://localhost:${port}`);
      })
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.log(
            `Le port ${port} est déjà utilisé, tentative sur le port ${port + 1}`
          );
          startServer(port + 1);
        } else {
          console.error(err);
        }
      });
  };

  startServer(3000);
});

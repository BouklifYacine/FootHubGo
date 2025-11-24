/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("✅ Client connecté:", socket.id);
    socket.emit("welcome", { message: "Bienvenue sur le serveur!" });
    socket.on("register", (userId: string) => {
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} enregistré`);
    });
    socket.on("disconnect", () => {
      console.log("❌ Client déconnecté:", socket.id);
    });
  });

  (global as any).io = io;

  const startServer = (port: number) => {
    httpServer.listen(port, () => {
      console.log(`🚀 Serveur prêt sur http://localhost:${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Le port ${port} est déjà utilisé, tentative sur le port ${port + 1}`);
        startServer(port + 1); // Essaye le port suivant
      } else {
        console.error(err);
      }
    });
  };

  startServer(3000);
});

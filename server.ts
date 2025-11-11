/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = 3000;

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

  // 🆕 AJOUTE ÇA (pour que ton helper puisse utiliser io)
  (global as any).io = io;

  httpServer.listen(port, () => {
    console.log(`🚀 Serveur prêt sur http://localhost:${port}`);
  });
});

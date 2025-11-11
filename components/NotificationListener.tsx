"use client";

import { useEffect } from "react";
import { io } from "socket.io-client"; 
import toast from "react-hot-toast"; 

export function NotificationListener({ userId }: { userId?: string }) {
  useEffect(() => {
    if (!userId) return;

    const socket = io();

    // S'enregistre
    socket.emit("register", userId);

    // Écoute les notifications
    socket.on("notification", (notif) => {
      console.log("📩 Notification reçue:", notif);

      // Affiche le toast avec react-hot-toast
      toast.success(`${notif.title}\n${notif.message}`, {
        duration: 5000,
        position: "top-center",
      });
    });

    // 🔧 CORRECTION : return direct de la fonction cleanup
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return null;
}

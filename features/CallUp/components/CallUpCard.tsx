import { BadgeTexteIcone } from "@/components/Badge/BadgeTexteIcone";
import React from "react";

function CallUpCard() {
  return (
    <div className="bg-purple-500 rounded-lg">
      <div className="flex justify-end items-center">
        <BadgeTexteIcone texte="Salut"></BadgeTexteIcone>
      </div>
    </div>
  );
}

export default CallUpCard;

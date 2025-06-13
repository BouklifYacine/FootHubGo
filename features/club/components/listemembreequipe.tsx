"use client"
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";

function Listemembreequipe() {
  const { data, isLoading } = useInfosClub();
  return (
    <>
      {data?.membres.map((m) => (
        <div key={m.id} className="flex gap-3">
          <p>{m.user.name}</p>
          <p>{m.role}</p>
          <p>{m.poste == null ? "Sans poste" : "Gardien"}</p>
          <p>{m.isLicensed == false ? "Non" : ""}</p>
        </div>
      ))}
    </>
  );
}

export default Listemembreequipe;

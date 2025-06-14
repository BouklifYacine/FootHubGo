"use client";
import React from "react";
import { useInfosClub } from "../hooks/useinfosclub";
import Image from "next/image";

function Listemembreequipe() {
  const { data, isLoading } = useInfosClub();

  if (isLoading) return <p>Ca charge </p>;
  return (
    <>
      {data?.membres.map((m) => (
        <div key={m.id} className="flex gap-3 mt-4">
          <Image
            className="rounded-full"
            src={m.user.image || ""}
            width={30}
            height={30}
            alt={m.user.name}
          ></Image>
          <p>{m.user.name}</p>
          <p>{m.role}</p>
          <p>{m.poste == null ? "Sans poste" : "Gardien"}</p>
          <p>{m.isLicensed == false ? "Non" : ""}</p>
          <p>{m.user.email}</p>
        </div>
      ))}
    </>
  );
}

export default Listemembreequipe;

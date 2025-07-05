"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

function PageTest() {
  const [todos, setTodos] = useState([
    { id: 1, tache: "manger", checked: false },
    { id: 2, tache: "dormir", checked: false },
    { id: 3, tache: "sport", checked: false },
  ]);

  const [newtodos, setNewtodos] = useState("");
  const [errormessage, setErrormessage] = useState("");

  const addTodos = () => {
    if (newtodos.trim() === "") {
      setErrormessage("Erreur input");
      return;
    }

    setTodos((prev) => [
      ...prev,
      { id: Date.now(), tache: newtodos, checked: false },
    ]);
    setErrormessage("");
    setNewtodos("");
  };

  const deleteTodos = (id: number) => {
    setTodos((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteAllTodos = () => {
    setTodos((prev) => prev.splice(0, prev.length))
  }

  const CheckTask = (id : number) => {
    setTodos(prev => prev.map((t) => t.id === id ? {...t , checked : !t.checked} : t))
  }

  return (
    <div className="">
      <div className="m-2 flex gap-2">
        <Input
          placeholder="salut"
          className="w-40"
          value={newtodos}
          onChange={(e) => setNewtodos(e.target.value)}
        ></Input>
        <Button onClick={addTodos}>Ajouter </Button>
             <Button onClick={deleteAllTodos} className="text-red-500">Supprimer tout </Button>
    
        <p></p>
      </div>
      {errormessage && <p className="text-red-500">{errormessage}</p>}
      <ul>
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <Checkbox onClick={() => CheckTask(t.id)}></Checkbox>
            <p className={`${t.checked ? "text-red-500" : ""}`}>{t.tache}</p>
            <Button onClick={() => deleteTodos(t.id)}>Supprimer</Button>
          </li>
        ))}
      </ul>
      <p> Nombre de taches : {todos.length}</p>
    </div>
  );
}

export default PageTest;

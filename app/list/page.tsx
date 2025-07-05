"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function PageTest() {
  const taches = [
    { id: 1, tache: "manger", checked: false },
    { id: 2, tache: "dormir", checked: false },
    { id: 3, tache: "sport", checked: false },
  ];
  const [todos, setTodos] = useState(taches);
  const [newtodos, setNewtodos] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

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
    setTodos([]);
  };

  const CheckTask = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const fetchApi = async () => {
    setIsLoading(true);
    try {
      const reponse = await fetch("https://jsonplaceholder.typicode.com/posts");
      if (!reponse.ok) {
        console.log("erreur call api");
      }

      const data = await reponse.json();
      setPosts(data);
    } catch {
      console.log("test")
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApi();
  }, []);

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
        <Button onClick={deleteAllTodos} className="text-red-500">
          Supprimer tout{" "}
        </Button>

        <p></p>
      </div>
      {errormessage && <p className="text-red-500">{errormessage}</p>}
      <ul>
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <Checkbox onClick={() => CheckTask(t.id)}></Checkbox>
            <p className={`${t.checked ? "text-red-500 line-through" : ""}`}>
              {t.tache}
            </p>
            <Button onClick={() => deleteTodos(t.id)}>Supprimer</Button>
          </li>
        ))}
      </ul>
      <p> Nombre de taches : {todos.length}</p>

      <div>
        {" "}
        {isLoading ? (
          <p className="text-green-200"> Chargement </p>
        ) : (
          posts.map((post) => (
            <div key={post.id}>
              <h3 className="text-green-500 font-bold">{post.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PageTest;

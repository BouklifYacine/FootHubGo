import { Button } from "@/components/ui/button";
import { Calendar, House } from "lucide-react";
import React from "react";

function ListeEvenement() {
  return (
    <div className="">
      <div className="mb-4">
        <Button className=" "> Créer un évenement </Button>
      </div>
      <div className="flex gap-4 flex-wrap items-center ">
        <div className="bg-purple-500 rounded-xl w-2xl">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl mb-4 mt-4 ml-4 font-bold text-white tracking-tighter">
              {" "}
              Manchester United vs Liverpool{" "}
            </h1>

          

            <div className="flex flex-col gap-2 mb-4 ml-4">

                  <div className="flex gap-2  ">
              <Calendar />
              <p>10 Janvier 2026 </p>
            </div>

            <div className="flex gap-2 ">
              <House />

              <p>Stade : Old Trafford </p>
            </div>
            </div>

          </div>
          <Button className="my-5 mx-4 "> Achetez votre place </Button>
        </div>

      <div className="bg-purple-500 rounded-xl w-2xl">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl mb-4 mt-4 ml-4 font-bold text-white tracking-tighter">
              {" "}
              Manchester United vs Liverpool{" "}
            </h1>

          

            <div className="flex flex-col gap-2 mb-4 ml-4">

                  <div className="flex gap-2  ">
              <Calendar />
              <p>10 Janvier 2026 </p>
            </div>

            <div className="flex gap-2 ">
              <House />

              <p>Stade : Old Trafford </p>
            </div>
            </div>

          </div>
          <Button className="my-5 mx-4 "> Achetez votre place </Button>
        </div>
         <div className="bg-purple-500 rounded-xl w-2xl">
          <div className="flex flex-col items-start">
            <h1 className="text-xl md:text-3xl mb-4 mt-4 ml-4 font-bold text-white tracking-tighter">
              {" "}
              Manchester United vs Liverpool{" "}
            </h1>

          

            <div className="flex flex-col gap-2 mb-4 ml-4">

                  <div className="flex gap-2  ">
              <Calendar />
              <p>10 Janvier 2026 </p>
            </div>

            <div className="flex gap-2 ">
              <House />

              <p>Stade : Old Trafford </p>
            </div>
            </div>

          </div>
          <Button className="my-5 mx-4 "> Achetez votre place </Button>
        </div>
         <div className="bg-purple-500 rounded-xl w-2xl">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl mb-4 mt-4 ml-4 font-bold text-white tracking-tighter">
              {" "}
              Manchester United vs Liverpool{" "}
            </h1>

          

            <div className="flex flex-col gap-2 mb-4 ml-4">

                  <div className="flex gap-2  ">
              <Calendar />
              <p>10 Janvier 2026 </p>
            </div>

            <div className="flex gap-2 ">
              <House />

              <p>Stade : Old Trafford </p>
            </div>
            </div>

          </div>
          <Button className="my-5 mx-4 "> Achetez votre place </Button>
        </div>
      </div>
    </div>
  );
}

export default ListeEvenement;

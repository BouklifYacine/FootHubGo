"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreationEquipeSchema } from '@/features/equipe/schemas/SchemaEquipe';
import { useCreerEquipe } from '@/features/equipe/hooks/useCreerEquipe';


type CreationEquipeInputs = z.infer<typeof CreationEquipeSchema>;

export function CreerEquipe({ className,...props}: React.ComponentPropsWithoutRef<"div">) {

  const { mutate, isPending, error } = useCreerEquipe();
  const {  register, handleSubmit, formState: { errors }} = useForm<CreationEquipeInputs>({resolver: zodResolver(CreationEquipeSchema)});

  const onSubmit = (data: CreationEquipeInputs) => {mutate(data)};

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Créer une équipe</CardTitle>
          <CardDescription>Rentrez vos informations en dessous</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom de votre équipe</Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="FC SAINT PRIEST"
                  {...register("nom")}
                />
                {errors.nom && (
                  <p className="text-red-500 text-sm">{errors.nom.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Description optionnelle de votre équipe"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending}
              >
                {isPending ? 'Création en cours...' : 'Créer équipe'}
              </Button>

              {error && (
                <p className="text-red-500 text-sm">{error.message}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


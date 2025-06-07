"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Competition, ResultatMatch } from "../types/statistiquesequipetypes";
import { useAjouterStatistiqueEquipe } from "../hooks/useAjouterStatistiqueEquipe";
import { StatistiqueEquipeSchema } from "../schemas/SchemaStatistique";
import { useModifierStatistiqueEquipe } from "../hooks/useModifierStatistiqueEquipe";


// Type pour les props du composant
interface FormulaireStatistiquesEquipeProps {
  evenementId: string;
  equipeId: string;
  isModification?: boolean;
  onSubmitSuccess?: () => void;
}

// Type pour les valeurs du formulaire
type FormValues = z.infer<typeof StatistiqueEquipeSchema>;

export default function FormulaireStatistiquesEquipe({
  evenementId,
  equipeId,
  isModification = false,
  onSubmitSuccess,
}: FormulaireStatistiquesEquipeProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const ajouterStats = useAjouterStatistiqueEquipe();
  const modifierStats = useModifierStatistiqueEquipe();
  
  // Création du formulaire avec react-hook-form et zod pour la validation
  const form = useForm<FormValues>({
    resolver: zodResolver(StatistiqueEquipeSchema),
    defaultValues: {
      resultatMatch: "MATCH_NUL" as ResultatMatch,
      butsMarques: 0,
      butsEncaisses: 0,
      cleanSheet: false,
      tirsTotal: 0,
      tirsCadres: 0,
      domicile: true,
      competition: "CHAMPIONNAT" as Competition,
      adversaire: ""
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      if (isModification) {
        await modifierStats.mutateAsync({ 
          evenementId, 
          equipeId, 
          data 
        });
      } else {
        await ajouterStats.mutateAsync({ 
          evenementId, 
          equipeId, 
          data 
        });
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission des statistiques:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Résultat du match */}
        <FormField
          control={form.control}
          name="resultatMatch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résultat du match</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le résultat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VICTOIRE">Victoire</SelectItem>
                  <SelectItem value="DEFAITE">Défaite</SelectItem>
                  <SelectItem value="MATCH_NUL">Match nul</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-sm font-medium mt-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Buts marqués */}
          <FormField
            control={form.control}
            name="butsMarques"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buts marqués <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Nombre de buts marqués"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />

          {/* Buts encaissés */}
          <FormField
            control={form.control}
            name="butsEncaisses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buts encaissés <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Nombre de buts encaissés"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />
        </div>

        {/* Clean Sheet */}
        <FormField
          control={form.control}
          name="cleanSheet"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Clean Sheet</FormLabel>
                <FormDescription>
                  Cochez si l&apos;équipe n&apos;a pas encaissé de but
                </FormDescription>
              </div>
              <FormMessage className="text-red-500 text-sm font-medium mt-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tirs totaux */}
          <FormField
            control={form.control}
            name="tirsTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tirs totaux</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Nombre de tirs totaux"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />

          {/* Tirs cadrés */}
          <FormField
            control={form.control}
            name="tirsCadres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tirs cadrés</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Nombre de tirs cadrés"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Domicile */}
          <FormField
            control={form.control}
            name="domicile"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Match à domicile</FormLabel>
                  <FormDescription>
                    Cochez si l&apos;équipe jouait à domicile
                  </FormDescription>
                </div>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />

          {/* Compétition */}
          <FormField
            control={form.control}
            name="competition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compétition</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de compétition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
                    <SelectItem value="COUPE">Coupe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500 text-sm font-medium mt-1" />
              </FormItem>
            )}
          />
        </div>

        {/* Adversaire */}
        <FormField
          control={form.control}
          name="adversaire"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adversaire <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Nom de l'équipe adverse"
                  disabled={isLoading} 
                />
              </FormControl>
              <FormDescription>
                Le nom de l&apos;équipe adverse est obligatoire.
              </FormDescription>
              <FormMessage className="text-red-500 text-sm font-medium mt-1" />
            </FormItem>
          )}
        />

        {/* Bouton de soumission */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isModification ? "Modification en cours..." : "Ajout en cours..."}
            </>
          ) : (
            isModification ? "Modifier les statistiques" : "Ajouter les statistiques"
          )}
        </Button>
      </form>
    </Form>
  );
} 
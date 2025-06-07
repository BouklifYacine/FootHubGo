"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAjouterStatistiqueJoueur } from "../hooks/useAjouterStatistiquesjoueur";
import { useModifierStatistiqueJoueur } from "../hooks/useModifierStatistiqueJoueur";
import { StatistiqueJoueurInputs } from "../types/StatsJoueurTypes";
import { StatistiqueJoueurSchema } from "../schemas/SchemasStatistiqueJoueur";



interface FormulaireStatistiquesJoueurProps {
  evenementId: string;
  isModification?: boolean;
  onSubmitSuccess?: () => void;
}

export default function FormulaireStatistiquesJoueur({ 
  evenementId, 
  isModification = false, 
  onSubmitSuccess 
}: FormulaireStatistiquesJoueurProps) {
  const [ouvert, setOuvert] = useState(false);
  
  // On utilise le hook d'ajout ou de modification selon le cas
  const { mutate: ajouterStats, isPending: isAjoutPending } = useAjouterStatistiqueJoueur();
  const { mutate: modifierStats, isPending: isModificationPending } = useModifierStatistiqueJoueur();
  
  // On récupère les statistiques existantes pour pré-remplir le formulaire en mode modification
  const { data: statistiquesExistantes, isLoading: isLoadingStats } = useStatistiqueJoueur(
    isModification ? evenementId : ""
  );

  const isPending = isAjoutPending || isModificationPending;

  // Définition des valeurs par défaut pour le formulaire
  const defaultFormValues = {
    buts: statistiquesExistantes?.buts ?? 0,
    passes: statistiquesExistantes?.passes ?? 0,
    minutesJouees: statistiquesExistantes?.minutesJouees ?? 0,
    note: statistiquesExistantes?.note ?? 5,
    titulaire: statistiquesExistantes?.titulaire ?? false,
    poste: statistiquesExistantes?.poste ?? "ATTAQUANT"
  };

  const form = useForm<StatistiqueJoueurInputs>({
    resolver: zodResolver(StatistiqueJoueurSchema),
    defaultValues: defaultFormValues,
    // Recharger les valeurs quand les statistiques changent
    values: defaultFormValues
  });

  const onSubmit = (data: StatistiqueJoueurInputs) => {
    if (isModification) {
      modifierStats(
        { evenementId, data },
        {
          onSuccess: (response) => {
            if (response.success) {
              if (onSubmitSuccess) {
                onSubmitSuccess();
              } else {
                setOuvert(false);
              }
              form.reset(defaultFormValues);
            }
          },
        }
      );
    } else {
      ajouterStats(
        { evenementId, data },
        {
          onSuccess: (response) => {
            if (response.success) {
              setOuvert(false);
              form.reset(defaultFormValues);
            }
          },
        }
      );
    }
  };

  // Si on est en mode modification directe (sans dialog), on affiche directement le formulaire
  if (isModification) {
    if (isLoadingStats) {
      return <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buts marqués</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passes décisives</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minutesJouees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minutes jouées</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (sur 10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="poste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poste occupé</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GARDIEN">Gardien</SelectItem>
                    <SelectItem value="DEFENSEUR">Défenseur</SelectItem>
                    <SelectItem value="MILIEU">Milieu</SelectItem>
                    <SelectItem value="ATTAQUANT">Attaquant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="titulaire"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Titulaire</FormLabel>
                  <FormDescription>
                    Avez-vous débuté le match?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isModification ? "Mise à jour en cours..." : "Envoi en cours..."}
              </>
            ) : (
              isModification ? "Mettre à jour mes statistiques" : "Enregistrer mes statistiques"
            )}
          </Button>
        </form>
      </Form>
    );
  }

  // Mode dialog standard (ajout)
  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Ajouter stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mes statistiques de match</DialogTitle>
          <DialogDescription>
            Renseignez les statistiques de votre performance pour ce match.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buts marqués</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passes décisives</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minutesJouees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes jouées</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (sur 10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="poste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste occupé</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un poste" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GARDIEN">Gardien</SelectItem>
                      <SelectItem value="DEFENSEUR">Défenseur</SelectItem>
                      <SelectItem value="MILIEU">Milieu</SelectItem>
                      <SelectItem value="ATTAQUANT">Attaquant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titulaire"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Titulaire</FormLabel>
                    <FormDescription>
                      Avez-vous débuté le match?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Enregistrer mes statistiques"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
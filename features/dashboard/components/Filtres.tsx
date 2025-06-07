import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface FiltersSectionProps {
  filtreabonnement: boolean;
  setFiltreAbonnement: (value: boolean) => void;
  filtreabommentannuel: boolean;
  setFiltreAbonnementAnnuel: (value: boolean) => void;
  filtreabonnementmensuel: boolean;
  setFiltreAbonnementMensuel: (value: boolean) => void;
  filtreAdmin: boolean;
  setFiltreAdmin: (value: boolean) => void;
  recherche: string;
  setRecherche: (value: string) => void;
}

export const Filtres: React.FC<FiltersSectionProps> = ({
  filtreabonnement,
  setFiltreAbonnement,
  filtreAdmin,
  setFiltreAdmin,
  filtreabommentannuel,
  setFiltreAbonnementAnnuel,
  filtreabonnementmensuel,
  setFiltreAbonnementMensuel,
  recherche,
  setRecherche,
}) => {
  // Calculer le nombre de filtres actifs directement dans le rendu
  const activeFiltersCount = [
    filtreabonnement,
    filtreAdmin,
    filtreabommentannuel,
    filtreabonnementmensuel
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-2 mb-5">
      {/* Version mobile avec dropdown */}
      <div className="flex sm:hidden w-full justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter size={16} />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem 
              onClick={() => setFiltreAbonnement(!filtreabonnement)}
              className={filtreabonnement ? "bg-primary/10" : ""}
            >
              {filtreabonnement ? "✓ " : ""} Abonnement
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFiltreAdmin(!filtreAdmin)}
              className={filtreAdmin ? "bg-primary/10" : ""}
            >
              {filtreAdmin ? "✓ " : ""} Admin
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFiltreAbonnementAnnuel(!filtreabommentannuel)}
              className={filtreabommentannuel ? "bg-primary/10" : ""}
            >
              {filtreabommentannuel ? "✓ " : ""} Abo annuel
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFiltreAbonnementMensuel(!filtreabonnementmensuel)}
              className={filtreabonnementmensuel ? "bg-primary/10" : ""}
            >
              {filtreabonnementmensuel ? "✓ " : ""} Abo mensuel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-1"
          type="text"
          placeholder="Rechercher par pseudo"
        />
      </div>

      {/* Version desktop avec boutons */}
      <div className="hidden sm:flex justify-end gap-2">
        <Button
          onClick={() => setFiltreAbonnement(!filtreabonnement)}
          variant={filtreabonnement ? "default" : "outline"}
        >
          Abonnement
        </Button>
        <Button
          onClick={() => setFiltreAdmin(!filtreAdmin)}
          variant={filtreAdmin ? "default" : "outline"}
        >
          Admin
        </Button>
        <Button
          onClick={() => setFiltreAbonnementAnnuel(!filtreabommentannuel)}
          variant={filtreabommentannuel ? "default" : "outline"}
        >
          Abo annuel
        </Button>
        <Button
          onClick={() => setFiltreAbonnementMensuel(!filtreabonnementmensuel)}
          variant={filtreabonnementmensuel ? "default" : "outline"}
        >
          Abo mensuel
        </Button>
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-52"
          type="text"
          placeholder="Pseudo"
        />
      </div>
    </div>
  );
};

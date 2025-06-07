import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Utiliser une fonction pour obtenir la valeur initiale de l'input
  const [inputPage, setInputPage] = useState<string>(currentPage.toString());
  
  // Ne pas afficher la pagination s'il n'y a qu'une seule page
  if (totalPages <= 1) {
    return null;
  }

  // Si la page courante change (via les props), mettre à jour l'input
  if (currentPage.toString() !== inputPage && document.activeElement !== document.getElementById('page-input')) {
    setInputPage(currentPage.toString());
  }

  // Fonction pour générer les numéros de page à afficher
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    // Si peu de pages, afficher toutes les pages
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Toujours afficher la première page
    pages.push(1);
    
    // Calculer la plage de pages à afficher
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Ajouter des ellipses si nécessaire
    if (startPage > 2) {
      pages.push("...");
    }
    
    // Ajouter les pages intermédiaires
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Ajouter des ellipses si nécessaire
    if (endPage < totalPages - 1) {
      pages.push("...");
    }
    
    // Toujours afficher la dernière page si elle existe
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accepter uniquement les chiffres
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputPage(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateToInputPage();
    }
  };

  const handleInputBlur = () => {
    navigateToInputPage();
  };

  const navigateToInputPage = () => {
    const pageNumber = parseInt(inputPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      // Réinitialiser l'input si la valeur n'est pas valide
      setInputPage(currentPage.toString());
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => {
        if (typeof page === "string") {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              {page}
            </span>
          );
        }
        
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {totalPages > 7 && (
        <div className="flex items-center ml-2">
          <span className="text-sm mr-2">Aller à</span>
          <Input
            id="page-input"
            className="w-16 h-8 text-center"
            value={inputPage}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            aria-label="Aller à la page"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <span className="text-sm ml-2">/ {totalPages}</span>
        </div>
      )}
    </div>
  );
}

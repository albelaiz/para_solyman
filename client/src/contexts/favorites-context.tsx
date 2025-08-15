import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string, productName?: string) => void;
  getFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pharmaCare_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pharmaCare_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (productId: string) => {
    setFavorites(current => {
      if (!current.includes(productId)) {
        return [...current, productId];
      }
      return current;
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(current => current.filter(id => id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = (productId: string, productName?: string) => {
    setFavorites(current => {
      const isCurrentlyFavorite = current.includes(productId);
      
      if (isCurrentlyFavorite) {
        toast({
          title: "Retiré des favoris",
          description: productName ? `${productName} retiré de vos favoris` : "Produit retiré de vos favoris",
        });
        return current.filter(id => id !== productId);
      } else {
        toast({
          title: "Ajouté aux favoris",
          description: productName ? `${productName} ajouté à vos favoris` : "Produit ajouté à vos favoris",
        });
        return [...current, productId];
      }
    });
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoritesCount,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@shared/schema";

export default function ProductList() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (product: Product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      medicaments: "Médicaments",
      cosmetiques: "Cosmétiques",
      bio: "Bio & Naturel",
      bebe: "Bébé & Maman",
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold text-xl text-primary-600">
            Liste des Produits
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <span className="text-sm text-gray-500">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "Aucun produit trouvé pour cette recherche" : "Aucun produit disponible"}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(Number(product.price))}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-blue-600 hover:bg-blue-50 border-blue-200"
                    onClick={() => {
                      toast({
                        title: "Modification du produit",
                        description: `Ouverture de l'éditeur pour "${product.name}"`,
                      });
                      // Scroll to form
                      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleDelete(product)}
                    disabled={deleteProductMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

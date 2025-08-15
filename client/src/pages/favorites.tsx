import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { useFavorites } from "@/contexts/favorites-context";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@shared/schema";

export default function Favorites() {
  const { favorites, getFavoritesCount } = useFavorites();
  const { getTotalItems } = useCart();

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                <h1 className="text-2xl font-bold text-amber-900">Mes Favoris</h1>
                <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded-full">
                  {getFavoritesCount()}
                </span>
              </div>
            </div>

            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Panier
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {favoriteProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Aucun favori</h2>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore ajouté de produits à vos favoris.
            </p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Découvrir nos produits
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl text-gray-600">
                {favoriteProducts.length} produit{favoriteProducts.length !== 1 ? 's' : ''} dans vos favoris
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
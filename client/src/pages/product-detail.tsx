import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, Clock } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/contexts/cart-context";
import { useFavorites } from "@/contexts/favorites-context";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getTotalItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Produit non trouvé</h2>
            <p className="text-gray-500 mb-6">Le produit que vous recherchez n'existe pas.</p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id, product.name);
  };

  const categoryNames: Record<string, string> = {
    medicaments: "Médicaments",
    cosmetiques: "Cosmétiques",
    bio: "Bio & Naturel",
    bebe: "Bébé & Maman",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
              <Badge className="absolute top-6 left-6 bg-green-100 text-green-700">
                En stock
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {categoryNames[product.category] || product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(Number(product.rating))
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} avis)
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-amber-600 mb-4">
                {formatCurrency(Number(product.price))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantité:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-12"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  className={`h-12 px-4 ${
                    isFavorite(product.id)
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-gray-300"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite(product.id) ? "fill-current" : ""
                    }`}
                  />
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Livraison gratuite à partir de 300 DH</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Produits authentiques garantis</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Livraison en 24-48h</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
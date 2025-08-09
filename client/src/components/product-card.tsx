import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      medicaments: { label: "Antidouleur", color: "bg-blue-100 text-blue-800" },
      cosmetiques: { label: "Cosmétique", color: "bg-pink-100 text-pink-800" },
      bio: { label: "Bio & Naturel", color: "bg-green-100 text-green-800" },
      bebe: { label: "Bébé & Maman", color: "bg-purple-100 text-purple-800" },
    };
    return categoryMap[category as keyof typeof categoryMap] || { label: category, color: "bg-gray-100 text-gray-800" };
  };

  const categoryInfo = getCategoryBadge(product.category);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <motion.div 
      className="bg-white rounded-3xl overflow-hidden premium-shadow product-card-hover cursor-pointer"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        {Number(product.price) < 100 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -15%
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <Badge className={`${categoryInfo.color} text-xs px-2 py-1`}>
            {categoryInfo.label}
          </Badge>
        </div>

        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(Number(product.price))}
            </span>
            {Number(product.price) < 100 && (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(Number(product.price) * 1.15)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.floor(Number(product.rating)) ? 'fill-current' : ''
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Ajouter au panier
        </Button>
      </div>
    </motion.div>
  );
}

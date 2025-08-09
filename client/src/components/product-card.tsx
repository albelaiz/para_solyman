import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { orderViaWhatsApp } from "@/lib/whatsapp";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

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

  const handleOrder = () => {
    orderViaWhatsApp(product.name, formatCurrency(Number(product.price)));
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
          onClick={handleOrder}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          size="lg"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.267"/>
          </svg>
          Commander sur WhatsApp
        </Button>
      </div>
    </motion.div>
  );
}

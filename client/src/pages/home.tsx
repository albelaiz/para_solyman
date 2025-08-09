import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Search, Shield, Truck, UserRound, MessageCircle, PillBottle, Sparkles, Leaf, Baby } from "lucide-react";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { orderViaWhatsApp } from "@/lib/whatsapp";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const categories = [
    { id: "medicaments", name: "Médicaments", icon: PillBottle, color: "bg-blue-500" },
    { id: "cosmetiques", name: "Cosmétiques", icon: Sparkles, color: "bg-pink-500" },
    { id: "bio", name: "Bio & Naturel", icon: Leaf, color: "bg-green-500" },
    { id: "bebe", name: "Bébé & Maman", icon: Baby, color: "bg-purple-500" },
  ];

  // Handler functions
  const handleFavoriteToggle = () => {
    toast({
      title: "Favoris",
      description: `Vous avez ${favorites.length} produit${favorites.length !== 1 ? 's' : ''} dans vos favoris`,
    });
  };

  const handleCartClick = () => {
    toast({
      title: "Panier",
      description: `Votre panier contient ${cartItems.length} article${cartItems.length !== 1 ? 's' : ''}`,
    });
  };

  const handleViewAllProducts = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    // Scroll to products section
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
    toast({
      title: "Tous les produits",
      description: "Affichage de tous nos produits disponibles",
    });
  };

  const handleViewProducts = () => {
    // Scroll to products section
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsAppContact = () => {
    orderViaWhatsApp("", "");
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFooterLinkClick = (linkName: string) => {
    toast({
      title: linkName,
      description: `Page ${linkName} sera bientôt disponible`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <PillBottle className="text-white text-xl" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-primary-600">PharmaCare</h1>
                <p className="text-xs text-primary-500 font-medium">Premium</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 hover:text-primary-600"
                onClick={handleFavoriteToggle}
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{favorites.length}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 hover:text-primary-600"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItems.length}</span>
              </Button>
              <div 
                className="hidden lg:flex items-center space-x-2 text-primary-600 cursor-pointer hover:text-primary-700 transition-colors"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold">Commande rapide</p>
                  <p className="text-xs">+212 612 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
                  Votre Santé,
                  <span className="text-accent-gold"> Notre Priorité</span>
                </h1>
                <p className="text-xl text-green-100 mb-8 leading-relaxed">
                  Découvrez notre sélection premium de produits pharmaceutiques et parapharmaceutiques. 
                  Qualité garantie, livraison rapide, conseils d'experts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-accent-gold hover:bg-accent-copper text-primary-700 font-semibold px-8 py-4 rounded-2xl"
                    onClick={handleViewProducts}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Voir nos produits
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 font-semibold px-8 py-4 rounded-2xl"
                    onClick={handleWhatsAppContact}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Commander via WhatsApp
                  </Button>
                </div>
              </motion.div>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Modern pharmacy interior" 
                  className="rounded-3xl premium-shadow" 
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 premium-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Shield className="text-primary-600 h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-600">98% Satisfaction</p>
                      <p className="text-sm text-gray-500">Clients satisfaits</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary-600 mb-4">
              Nos Catégories Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des produits soigneusement sélectionnés pour répondre à tous vos besoins de santé et bien-être
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 text-center transition-all duration-300 premium-shadow group-hover:shadow-2xl">
                  <div className={`w-20 h-20 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="text-white h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-xl text-primary-600 mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {category.id === "medicaments" && "Antidouleurs, vitamines, compléments"}
                    {category.id === "cosmetiques" && "Soins visage, corps, cheveux"}
                    {category.id === "bio" && "Produits biologiques et naturels"}
                    {category.id === "bebe" && "Soins pour bébé et maman"}
                  </p>
                  <span className="inline-flex items-center text-primary-500 font-semibold">
                    Voir les produits
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary-600 mb-4">
                Produits Vedettes
              </h2>
              <p className="text-xl text-gray-600">
                Les produits les plus populaires et recommandés par nos experts
              </p>
            </motion.div>
            <motion.div 
              className="mt-6 lg:mt-0"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </motion.div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 mb-4"></div>
                  <div className="bg-gray-200 rounded h-8"></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-2xl"
              onClick={handleViewAllProducts}
            >
              Voir tous les produits
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-primary-600 mb-4">
              Pourquoi Nous Choisir ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expertise pharmaceutique au service de votre bien-être
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Qualité Garantie", description: "Tous nos produits sont certifiés et respectent les normes pharmaceutiques les plus strictes.", color: "from-primary-500 to-primary-600" },
              { icon: Truck, title: "Livraison Rapide", description: "Livraison express en 24h dans tout le Maroc avec suivi en temps réel.", color: "from-green-500 to-green-600" },
              { icon: UserRound, title: "Conseils d'Experts", description: "Notre équipe de pharmaciens qualifiés vous accompagne dans vos choix.", color: "from-accent-gold to-accent-copper" },
              { icon: MessageCircle, title: "Support 24/7", description: "Assistance disponible 24h/24 via WhatsApp pour toutes vos questions.", color: "from-blue-500 to-blue-600" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-primary-600 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <PillBottle className="text-white h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">PharmaCare</h3>
                  <p className="text-primary-200">Premium</p>
                </div>
              </div>
              <p className="text-primary-200 mb-6">
                Votre parapharmacie de confiance pour tous vos besoins de santé et bien-être.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Catégories</h4>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => handleCategoryClick(category.id)}
                      className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick("Contact")}
                    className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick("FAQ")}
                    className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick("Livraison")}
                    className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Livraison
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick("Retours")}
                    className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Retours
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick("Garantie")}
                    className="text-primary-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Garantie
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <div className="space-y-4 text-primary-200">
                <p>123 Avenue Mohammed V, Casablanca</p>
                <p>+212 522 123 456</p>
                <p>+212 612 345 678</p>
                <p>contact@pharmacare.ma</p>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-500 mt-12 pt-8 text-center">
            <p className="text-primary-200">
              &copy; 2024 PharmaCare Premium. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

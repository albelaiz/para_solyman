import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, LogOut, Package, BarChart3, Settings as SettingsIcon, Home, Pill, Sparkles, Baby, Phone, HelpCircle, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ProductForm from "@/components/admin/product-form";
import ProductList from "@/components/admin/product-list";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeNavItem, setActiveNavItem] = useState("admin");

  const navigationItems = [
    { id: "categories", label: "Catégories", icon: Home, action: () => handleNavClick("categories") },
    { id: "medicaments", label: "Médicaments", icon: Pill, action: () => handleNavClick("medicaments") },
    { id: "cosmetiques", label: "Cosmétiques", icon: Sparkles, action: () => handleNavClick("cosmetiques") },
    { id: "bio", label: "Bio & Naturel", icon: Package, action: () => handleNavClick("bio") },
    { id: "bebe", label: "Bébé & Maman", icon: Baby, action: () => handleNavClick("bebe") },
    { id: "contact", label: "Contact", icon: Phone, action: () => handleNavClick("contact") },
    { id: "faq", label: "FAQ", icon: HelpCircle, action: () => handleNavClick("faq") },
    { id: "livraison", label: "Livraison", icon: Truck, action: () => handleNavClick("livraison") },
    { id: "retours", label: "Retours", icon: RotateCcw, action: () => handleNavClick("retours") },
    { id: "garantie", label: "Garantie", icon: ShieldCheck, action: () => handleNavClick("garantie") },
  ];

  const handleNavClick = (itemId: string) => {
    setActiveNavItem(itemId);
    toast({
      title: `Navigation vers ${navigationItems.find(item => item.id === itemId)?.label}`,
      description: `Section ${itemId} sélectionnée`,
    });
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans le panneau d'administration",
      });
    },
    onError: () => {
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setLoginForm({ username: "", password: "" });
      queryClient.clear();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-500 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md premium-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white h-8 w-8" />
              </div>
              <CardTitle className="font-display text-2xl font-bold text-primary-600">
                Administration
              </CardTitle>
              <p className="text-gray-600 mt-2">Accès sécurisé au panneau d'administration</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Entrez votre mot de passe"
                    required
                    className="mt-2"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Shield className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-primary-600">Administration</h1>
                <p className="text-xs text-gray-500">PharmaCare Premium</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-3 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeNavItem === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={item.action}
                  className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${
                    activeNavItem === item.id 
                      ? "bg-primary-500 text-white shadow-md" 
                      : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-primary-600 mb-2">
              {activeNavItem === "admin" ? "Panneau d'Administration" : 
               navigationItems.find(item => item.id === activeNavItem)?.label || "Panneau d'Administration"}
            </h2>
            <p className="text-gray-600">
              {activeNavItem === "admin" ? "Gestion des produits et paramètres" : 
               `Section ${navigationItems.find(item => item.id === activeNavItem)?.label || "Administration"}`}
            </p>
          </div>

          {/* Conditional Content Based on Active Navigation */}
          {activeNavItem === "admin" ? (
            <Tabs defaultValue="products" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                <TabsTrigger value="products" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Produits</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Paramètres</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <ProductForm />
                  </div>
                  <div className="lg:col-span-2">
                    <ProductList />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres généraux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="+212 6XX XXX XXX"
                        defaultValue="+212 612345678"
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Numéro utilisé pour les commandes WhatsApp
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <select 
                        id="currency"
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        defaultValue="DH"
                      >
                        <option value="DH">Dirham (DH)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="whatsapp-message">Message WhatsApp par défaut</Label>
                      <textarea
                        id="whatsapp-message"
                        rows={3}
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        defaultValue="Bonjour, je souhaite commander [PRODUCT] pour [PRICE] DH"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Utilisez [PRODUCT] et [PRICE] comme variables
                      </p>
                    </div>
                    <Button 
                      className="bg-primary-500 hover:bg-primary-600"
                      onClick={() => {
                        toast({
                          title: "Paramètres sauvegardés",
                          description: "Les modifications ont été enregistrées avec succès",
                        });
                      }}
                    >
                      Sauvegarder
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  {(() => {
                    const currentItem = navigationItems.find(item => item.id === activeNavItem);
                    if (currentItem) {
                      const Icon = currentItem.icon;
                      return (
                        <>
                          <Icon className="h-6 w-6 text-primary-500" />
                          <span>{currentItem.label}</span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const currentItem = navigationItems.find(item => item.id === activeNavItem);
                      if (currentItem) {
                        const Icon = currentItem.icon;
                        return <Icon className="h-8 w-8 text-primary-500" />;
                      }
                      return null;
                    })()}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Section {navigationItems.find(item => item.id === activeNavItem)?.label}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Cette section est en cours de développement. Contenu spécifique à venir.
                  </p>
                  <Button
                    onClick={() => setActiveNavItem("admin")}
                    variant="outline"
                    className="border-primary-200 text-primary-600 hover:bg-primary-50"
                  >
                    Retour à l'administration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

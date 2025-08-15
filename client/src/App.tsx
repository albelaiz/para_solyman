import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Cart from "@/pages/cart";
import Favorites from "@/pages/favorites";
import ProductDetail from "@/pages/product-detail";
import Admin from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cart" component={Cart} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/admin-secret-2024" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

export default App;

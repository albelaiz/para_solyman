import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
}

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.email.trim()) {
        toast({
          title: "Informations manquantes",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      // Create order summary
      const orderSummary = items.map(item => 
        `${item.product.name} x${item.quantity} - ${formatCurrency(Number(item.product.price) * item.quantity)}`
      ).join('\n');

      const totalPrice = formatCurrency(getTotalPrice());
      
      const message = `🛒 NOUVELLE COMMANDE
      
👤 Client: ${checkoutForm.name}
📞 Téléphone: ${checkoutForm.phone}  
📧 Email: ${checkoutForm.email}

📦 PRODUITS:
${orderSummary}

💰 TOTAL: ${totalPrice}

Merci de confirmer cette commande.`;

      // Send order via WhatsApp Business API (backend)
      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: checkoutForm,
          items: items,
          total: getTotalPrice(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear cart and show success
        clearCart();
        setShowCheckout(false);
        setCheckoutForm({ name: '', phone: '', email: '' });
        
        toast({
          title: "Commande envoyée ✅",
          description: result.message,
        });
      } else {
        // Show error message
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la commande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 shadow-lg"
            >
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
              <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
              <Link href="/">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                  Continuer vos achats
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer vos achats
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Mon Panier</h1>
            <p className="text-gray-600">{getTotalItems()} article{getTotalItems() !== 1 ? 's' : ''} dans votre panier</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.product.description}</p>
                        <p className="text-primary-600 font-bold text-lg mt-2">
                          {formatCurrency(Number(item.product.price))}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              {!showCheckout ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{formatCurrency(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className="text-green-600">Gratuite</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">{formatCurrency(getTotalPrice())}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-primary-500 hover:bg-primary-600"
                      size="lg"
                    >
                      Procéder au checkout
                    </Button>
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Vider le panier
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Votre nom complet"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Numéro de téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+212 6XX XXX XXX"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Adresse email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="votre@email.com"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold mb-4">
                          <span>Total à payer</span>
                          <span className="text-primary-600">{formatCurrency(getTotalPrice())}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Envoi en cours...' : 'Finaliser la commande'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowCheckout(false)}
                            variant="outline"
                            className="w-full"
                          >
                            Retour au panier
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
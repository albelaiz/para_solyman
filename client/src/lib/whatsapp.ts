export function orderViaWhatsApp(productName: string, price: string) {
  const phoneNumber = "212612345678"; // This should come from settings
  const message = `Bonjour, je souhaite commander ${productName} pour ${price}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
}

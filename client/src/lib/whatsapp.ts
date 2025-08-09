export function orderViaWhatsApp(productName: string, price: string) {
  const phoneNumber = "212612345678"; // Morocco WhatsApp number
  let message = "";
  
  if (productName && price) {
    message = `Bonjour, je souhaite commander ${productName} pour ${price}`;
  } else {
    message = "Bonjour, j'aimerais obtenir plus d'informations sur vos produits pharmaceutiques. Merci !";
  }
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
}

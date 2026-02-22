async function createCheckoutSession(cartItems) {
  try {
    // Cambia l'endpoint al server di produzione
    const response = await fetch('https://sbobinamente.it/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    });

    const { url } = await response.json();
    
    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
    alert('Si è verificato un errore durante la creazione della sessione di pagamento.');
  }
}

// Example: Add to your cart checkout button
document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('checkoutButton');
  
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      const cartItems = getCartItems(); // Get items from localStorage or cart state
      createCheckoutSession(cartItems);
    });
  }
});

function getCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return cart.map(item => ({
    name: item.title,
    description: item.description,
    price: item.price,
    quantity: item.quantity || 1,
  }));
}

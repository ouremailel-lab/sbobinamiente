async function createCheckoutSession(cartItems) {
  try {
    // Usa sempre il server di produzione
    const API_URL = 'https://sbobinamente.it/api/create-checkout-session';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    });

    // Controllo errore di certificato SSL
    if (!response.ok && response.type === 'opaque') {
      alert(
        'Errore di connessione SSL.\n' +
        'Il certificato del server non è valido o non corrisponde al dominio.\n' +
        'Contatta il supporto tecnico o verifica la configurazione HTTPS del backend.'
      );
      throw new Error('Certificato SSL non valido');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      alert(
        'Errore di connessione.\n' +
        'Verifica che il server sia raggiungibile e abbia un certificato SSL valido.\n' +
        'Se il problema persiste, contatta il supporto tecnico.'
      );
    } else {
      alert('Si è verificato un errore durante la creazione della sessione di pagamento.');
    }
    console.error('Error:', error);
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

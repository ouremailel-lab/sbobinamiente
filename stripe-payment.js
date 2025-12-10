// Stripe Payment Integration con Apple Pay e Google Pay
// Documentazione: https://stripe.com/docs/payments/payment-element

// Chiave pubblica Stripe (da sostituire con la tua)
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY';

let stripe;
let elements;
let paymentElement;

// Inizializza Stripe
function initializeStripe() {
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js non caricato');
        return;
    }
    
    stripe = Stripe(STRIPE_PUBLIC_KEY);
    console.log('Stripe inizializzato');
}

// Crea il Payment Intent e mostra il form di pagamento
async function showStripeCheckout() {
    if (!stripe) {
        alert('Sistema di pagamento in caricamento, riprova tra un secondo');
        return;
    }
    
    if (cart.length === 0) {
        alert('Il carrello è vuoto');
        return;
    }
    
    // Calcola il totale
    const total = cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0);
    const totalCents = Math.round(total * 100); // Stripe usa centesimi
    
    try {
        // Crea Payment Intent tramite la tua API
        const response = await fetch('/.netlify/functions/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalCents,
                currency: 'eur',
                items: cart.map(item => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.prezzo
                }))
            })
        });
        
        const { clientSecret, error } = await response.json();
        
        if (error) {
            throw new Error(error);
        }
        
        // Mostra il form di pagamento Stripe
        await displayStripePaymentForm(clientSecret, total);
        
    } catch (error) {
        console.error('Errore creazione pagamento:', error);
        alert('Errore durante l\'inizializzazione del pagamento: ' + error.message);
    }
}

// Mostra il form di pagamento Stripe con Apple Pay/Google Pay
async function displayStripePaymentForm(clientSecret, total) {
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (!checkoutForm) return;
    
    // Sostituisci il contenuto del modal con il form Stripe
    checkoutForm.innerHTML = `
        <div class="form-group">
            <label>Nome Completo:</label>
            <input type="text" id="customerName" required>
        </div>
        <div class="form-group">
            <label>Email:</label>
            <input type="email" id="customerEmail" required value="${currentUser?.email || ''}">
        </div>
        <div class="form-group">
            <label>Metodo di Pagamento:</label>
            <div id="payment-element" style="margin-top: 10px;">
                <!-- Stripe Payment Element (include Apple Pay/Google Pay) -->
            </div>
        </div>
        <div class="cart-summary">
            <div class="summary-row">
                <span>Totale:</span>
                <span class="checkout-total">${total.toFixed(2)}€</span>
            </div>
        </div>
        <button type="submit" id="submit-payment" class="btn btn-primary" style="width: 100%;">
            Paga ${total.toFixed(2)}€
        </button>
        <div id="payment-message" style="margin-top: 15px; color: #e74c3c; display: none;"></div>
    `;
    
    // Crea il Payment Element con Apple Pay/Google Pay
    elements = stripe.elements({
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#f5a6c9',
                borderRadius: '8px'
            }
        }
    });
    
    paymentElement = elements.create('payment', {
        layout: 'tabs',
        wallets: {
            applePay: 'auto',  // Apple Pay su Safari/iOS
            googlePay: 'auto'   // Google Pay su Chrome/Android
        }
    });
    
    paymentElement.mount('#payment-element');
    
    // Gestisci il submit del form
    checkoutForm.addEventListener('submit', handleStripeSubmit);
}

// Gestisce il pagamento Stripe
async function handleStripeSubmit(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submit-payment');
    const messageDiv = document.getElementById('payment-message');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Elaborazione...';
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    
    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/payment-success.html',
                payment_method_data: {
                    billing_details: {
                        name: customerName,
                        email: customerEmail
                    }
                }
            },
            redirect: 'if_required'
        });
        
        if (error) {
            // Mostra errore
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Paga ' + document.querySelector('.checkout-total').textContent;
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Pagamento riuscito!
            await handleSuccessfulPayment(paymentIntent);
        }
        
    } catch (err) {
        console.error('Errore pagamento:', err);
        messageDiv.textContent = 'Errore durante il pagamento. Riprova.';
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Paga ' + document.querySelector('.checkout-total').textContent;
    }
}

// Gestisce il pagamento riuscito
async function handleSuccessfulPayment(paymentIntent) {
    // Salva l'ordine
    const order = {
        id: paymentIntent.id,
        userId: currentUser?.id || 'guest',
        items: cart,
        total: paymentIntent.amount / 100,
        status: 'completed',
        paymentMethod: paymentIntent.payment_method_types[0],
        date: new Date().toISOString()
    };
    
    // Salva su Supabase
    if (window.supabaseClient) {
        await saveOrderToSupabase(order);
    }
    
    // Invia email di conferma
    if (typeof sendOrderConfirmation === 'function') {
        await sendOrderConfirmation(order);
    }
    
    // Svuota il carrello
    cart = [];
    saveCart();
    updateCartCount();
    
    // Chiudi modal e mostra successo
    closeCheckout();
    
    // Mostra messaggio di successo
    alert('🎉 Pagamento completato! Riceverai una email con i dettagli dell\'ordine.');
    
    // Reindirizza alla pagina di successo
    window.location.href = 'payment-success.html?order=' + paymentIntent.id;
}

// Salva l'ordine su Supabase
async function saveOrderToSupabase(order) {
    try {
        const { data, error } = await window.supabaseClient
            .from('orders')
            .insert([order]);
            
        if (error) throw error;
        console.log('Ordine salvato:', data);
    } catch (error) {
        console.error('Errore salvataggio ordine:', error);
    }
}

// Inizializza quando Stripe.js è caricato
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStripe);
} else {
    initializeStripe();
}

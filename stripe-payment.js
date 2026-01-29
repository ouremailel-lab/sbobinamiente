// Questo file gestisce i pagamenti Stripe dal sito. Assicurati che la chiave pubblica e l'endpoint serverless siano corretti.
// Sistema di pagamento semplice
const STRIPE_PUBLIC_KEY = 'pk_live_51Scdi3RqQxAAz0zVWpRBO1z2OU7juhkr4K1tO9QsCqdxFL6I8F3uNk5Rc6r4SnUtqdCX899U7S43New76YpQh1Hm00wiXT0PUR';

let stripe;
let elements;
let paymentElement;

function initializeStripe() {
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js non caricato');
        return;
    }
    stripe = Stripe(STRIPE_PUBLIC_KEY);
    console.log('Stripe inizializzato');
}

async function showStripeCheckout() {
    if (!stripe) {
        alert('Sistema di pagamento in caricamento, riprova tra un secondo');
        return;
    }
    
    if (cart.length === 0) {
        alert('Il carrello è vuoto');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0);
    const totalCents = Math.round(total * 100);
    
    try {
        const response = await fetch('https://lighthearted-biscuit-1bda10.netlify.app/.netlify/functions/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalCents,
                currency: 'eur'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Errore HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        await displayStripePaymentForm(data.clientSecret, total);
        
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore pagamento: ' + error.message);
    }
}

async function displayStripePaymentForm(clientSecret, total) {
    const checkoutContainer = document.getElementById('checkoutContainer');
    if (!checkoutContainer) return;

    checkoutContainer.innerHTML = `
        <h3>Scegli metodo di pagamento</h3>
        <button type="button" id="btn-stripe" class="btn btn-primary" style="width:100%; margin-bottom:10px;">💳 Paga con Carta</button>
        <button type="button" id="btn-paypal" class="btn btn-secondary" style="width:100%;">💰 Paga con PayPal</button>
        
        <div id="stripe-form" style="display:none; margin-top:20px;">
            <form id="checkoutForm">
                <div class="form-group">
                    <label>Nome:</label>
                    <input type="text" id="customerName" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="customerEmail" required value="${currentUser?.email || ''}">
                </div>
                <div id="payment-element"></div>
                <div style="margin:15px 0;">
                    <strong>Totale: ${total.toFixed(2)}€</strong>
                </div>
                <button type="submit" id="submit-payment" class="btn btn-primary" style="width:100%;">
                    Paga ${total.toFixed(2)}€
                </button>
                <div id="payment-message" style="margin-top:15px; color:red; display:none;"></div>
            </form>
        </div>
    `;

    elements = stripe.elements({ clientSecret });
    paymentElement = elements.create('payment', {
        layout: 'tabs',
        wallets: { applePay: 'auto', googlePay: 'auto' }
    });

    document.getElementById('btn-stripe').onclick = () => {
        document.getElementById('stripe-form').style.display = 'block';
        paymentElement.mount('#payment-element');
    };

    document.getElementById('btn-paypal').onclick = () => {
        if (typeof payWithPayPal === 'function') {
            payWithPayPal();
        } else {
            alert('PayPal non disponibile');
        }
    };

    document.getElementById('checkoutForm').onsubmit = handleStripeSubmit;
}

async function handleStripeSubmit(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submit-payment');
    const messageDiv = document.getElementById('payment-message');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Elaborazione...';
    
    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/payment-success.html',
                payment_method_data: {
                    billing_details: {
                        name: document.getElementById('customerName').value,
                        email: document.getElementById('customerEmail').value
                    }
                }
            },
            redirect: 'if_required'
        });
        
        if (error) {
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Riprova';
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            alert('✅ Pagamento completato!');
            cart = [];
            saveCart();
            updateCartCount();
            closeCheckout();
            window.location.href = 'payment-success.html?order=' + paymentIntent.id;
        }
    } catch (err) {
        messageDiv.textContent = 'Errore: ' + err.message;
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Riprova';
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

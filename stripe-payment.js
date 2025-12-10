// Stripe Payment Integration con Apple Pay e Google Pay
// Documentazione: https://stripe.com/docs/payments/payment-element

// Chiave pubblica Stripe (da sostituire con la tua)
const STRIPE_PUBLIC_KEY = 'pk_live_51Scdi3RqQxAAz0zVWpRBO1z2OU7juhkr4K1tO9QsCqdxFL6I8F3uNk5Rc6r4SnUtqdCX899U7S43New76YpQh1Hm00wiXT0PUR';

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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
            throw new Error(errorData.error || `Errore HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        const { clientSecret } = data;
        
        // Mostra il form di pagamento Stripe
        await displayStripePaymentForm(clientSecret, total);
        
    } catch (error) {
        console.error('Errore creazione pagamento:', error);
        alert('Errore durante l\'inizializzazione del pagamento: ' + error.message);
    }
}

// Mostra il form di pagamento Stripe con Apple Pay/Google Pay
async function displayStripePaymentForm(clientSecret, total) {
    const checkoutContainer = document.getElementById('checkoutContainer');
    if (!checkoutContainer) return;

    // UI con due opzioni: Stripe (carta/Apple Pay/Google Pay) e PayPal
    checkoutContainer.innerHTML = `
        <div class="payment-tabs" style="display:flex; gap:8px; margin-bottom:12px;">
            <button id="tab-stripe" class="btn btn-primary" style="flex:1;">Carta / Apple Pay / Google Pay</button>
            <button id="tab-paypal" class="btn btn-secondary" style="flex:1;">PayPal</button>
        </div>

        <form id="checkoutForm">
            <div class="form-group">
                <label>Nome Completo:</label>
                <input type="text" id="customerName" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="customerEmail" required value="${currentUser?.email || ''}">
            </div>

            <div id="stripe-area">
                <div class="form-group">
                    <label>Metodo di Pagamento:</label>
                    <div id="payment-element" style="margin-top: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
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
            </div>

            <div id="paypal-area" style="display:none; margin-top: 12px;">
                <p style="margin-bottom:10px;">Paga con PayPal. Ti chiederemo conferma.</p>
                <button type="button" id="paypal-button" class="btn btn-secondary" style="width: 100%;">Paga con PayPal</button>
            </div>
        </form>
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

    // Logica tab Stripe/PayPal
    let activeTab = 'stripe';
    const tabStripe = document.getElementById('tab-stripe');
    const tabPayPal = document.getElementById('tab-paypal');
    const stripeArea = document.getElementById('stripe-area');
    const paypalArea = document.getElementById('paypal-area');

    function setTab(tab) {
        activeTab = tab;
        if (tab === 'stripe') {
            tabStripe.classList.add('btn-primary');
            tabStripe.classList.remove('btn-secondary');
            tabPayPal.classList.add('btn-secondary');
            tabPayPal.classList.remove('btn-primary');
            stripeArea.style.display = 'block';
            paypalArea.style.display = 'none';
        } else {
            tabPayPal.classList.add('btn-primary');
            tabPayPal.classList.remove('btn-secondary');
            tabStripe.classList.add('btn-secondary');
            tabStripe.classList.remove('btn-primary');
            stripeArea.style.display = 'none';
            paypalArea.style.display = 'block';
        }
    }

    tabStripe?.addEventListener('click', (e) => { e.preventDefault(); setTab('stripe'); });
    tabPayPal?.addEventListener('click', (e) => { e.preventDefault(); setTab('paypal'); });
    setTab('stripe');

    // Submit solo se tab Stripe attivo
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            if (activeTab !== 'stripe') {
                e.preventDefault();
                return;
            }
            handleStripeSubmit(e);
        });
    }

    // Pulsante PayPal
    const paypalButton = document.getElementById('paypal-button');
    if (paypalButton) {
        paypalButton.addEventListener('click', () => {
            payWithPayPal();
        });
    }
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

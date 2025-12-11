// Sistema di pagamento semplice
const STRIPE_PUBLIC_KEY = 'pk_live_51Scdi3RqQxAAz0zVWpRBO1z2OU7juhkr4K1tO9QsCqdxFL6I8F3uNk5Rc6r4SnUtqdCX899U7S43New76YpQh1Hm00wiXT0PUR';

// Dati bonifico: aggiorna con il tuo IBAN e intestatario prima di andare live
const BANK_TRANSFER_DETAILS = {
    iban: 'IT00A0000000000000000000000',
    holder: 'NOME INTESTATARIO',
    bank: 'La tua banca',
    reasonPrefix: 'Ordine SbobinaMente'
};

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

    const bankOrderRef = `BON-${Date.now()}`;

    checkoutContainer.innerHTML = `
        <h3>Scegli il metodo di pagamento</h3>
        <div style="display:flex; gap:8px; margin:12px 0;">
            <button type="button" id="tab-card" class="btn btn-primary" style="flex:1;">💳 Carta</button>
            <button type="button" id="tab-bank" class="btn btn-secondary" style="flex:1;">🏦 Bonifico</button>
        </div>

        <div id="stripe-form" style="margin-top:20px;">
            <form id="checkoutForm">
                <div class="form-group">
                    <label>Nome completo</label>
                    <input type="text" id="customerName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="customerEmail" required value="${currentUser?.email || ''}">
                </div>
                <div id="payment-element"></div>
                <div style="margin:15px 0;">
                    <strong>Totale: ${total.toFixed(2)}€</strong>
                </div>
                <button type="submit" id="submit-payment" class="btn btn-primary" style="width:100%;">
                    Paga con Carta (${total.toFixed(2)}€)
                </button>
                <div id="payment-message" style="margin-top:15px; color:red; display:none;"></div>
            </form>
        </div>

        <div id="bank-form" style="margin-top:20px; display:none;">
            <div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-bottom:12px;">
                <p style="margin:4px 0;"><strong>Intestatario:</strong> ${BANK_TRANSFER_DETAILS.holder}</p>
                <p style="margin:4px 0;"><strong>Banca:</strong> ${BANK_TRANSFER_DETAILS.bank}</p>
                <p style="margin:4px 0;"><strong>IBAN:</strong> ${BANK_TRANSFER_DETAILS.iban}</p>
                <p style="margin:4px 0;"><strong>Causale consigliata:</strong> ${BANK_TRANSFER_DETAILS.reasonPrefix} ${bankOrderRef}</p>
            </div>
            <form id="bankTransferForm">
                <div class="form-group">
                    <label>Nome completo</label>
                    <input type="text" id="bankCustomerName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="bankCustomerEmail" required value="${currentUser?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Note (opzionale)</label>
                    <textarea id="bankCustomerNote" rows="2" placeholder="Inserisci eventuali note"></textarea>
                </div>
                <div style="margin:15px 0;">
                    <strong>Totale da bonificare: ${total.toFixed(2)}€</strong>
                </div>
                <button type="submit" id="submit-bank-transfer" class="btn btn-secondary" style="width:100%;">
                    Registra ordine e ricevi IBAN
                </button>
                <div id="bank-transfer-message" style="margin-top:15px; color:red; display:none;"></div>
            </form>
        </div>
    `;

    const tabs = {
        card: document.getElementById('tab-card'),
        bank: document.getElementById('tab-bank')
    };
    const sections = {
        card: document.getElementById('stripe-form'),
        bank: document.getElementById('bank-form')
    };

    function switchMethod(method) {
        if (method === 'card') {
            tabs.card.classList.add('btn-primary');
            tabs.card.classList.remove('btn-secondary');
            tabs.bank.classList.add('btn-secondary');
            tabs.bank.classList.remove('btn-primary');
            sections.card.style.display = 'block';
            sections.bank.style.display = 'none';
            mountPaymentElement(clientSecret);
        } else {
            tabs.bank.classList.add('btn-primary');
            tabs.bank.classList.remove('btn-secondary');
            tabs.card.classList.add('btn-secondary');
            tabs.card.classList.remove('btn-primary');
            sections.card.style.display = 'none';
            sections.bank.style.display = 'block';
        }
    }

    tabs.card.onclick = () => switchMethod('card');
    tabs.bank.onclick = () => switchMethod('bank');

    mountPaymentElement(clientSecret);
    switchMethod('card');

    document.getElementById('checkoutForm').onsubmit = handleStripeSubmit;
    document.getElementById('bankTransferForm').onsubmit = (event) => handleBankTransferSubmit(event, total, bankOrderRef);
}

function mountPaymentElement(clientSecret) {
    if (paymentElement) return;
    elements = stripe.elements({ clientSecret });
    paymentElement = elements.create('payment', {
        layout: 'tabs',
        paymentMethodOrder: ['card'],
        wallets: { applePay: 'auto', googlePay: 'auto' }
    });
    paymentElement.mount('#payment-element');
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

async function handleBankTransferSubmit(event, total, orderRef) {
    event.preventDefault();

    const submitButton = document.getElementById('submit-bank-transfer');
    const messageDiv = document.getElementById('bank-transfer-message');
    messageDiv.style.display = 'none';
    messageDiv.textContent = '';

    const customerName = document.getElementById('bankCustomerName').value.trim();
    const customerEmail = document.getElementById('bankCustomerEmail').value.trim();
    const customerNote = document.getElementById('bankCustomerNote').value.trim();

    if (!customerName || !customerEmail) {
        messageDiv.textContent = 'Inserisci nome ed email per registrare il bonifico.';
        messageDiv.style.display = 'block';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Registro ordine...';

    try {
        const orderId = orderRef || `BON-${Date.now()}`;
        const paymentInstructions = {
            iban: BANK_TRANSFER_DETAILS.iban,
            holder: BANK_TRANSFER_DETAILS.holder,
            bank: BANK_TRANSFER_DETAILS.bank,
            reason: `${BANK_TRANSFER_DETAILS.reasonPrefix} ${orderId}`,
            amount: total.toFixed(2)
        };

        const order = {
            order_id: orderId,
            user_name: customerName,
            user_email: customerEmail,
            items: cart,
            total: total,
            deliveryInfo: {
                nome: customerName,
                email: customerEmail,
                note: customerNote,
                method: 'bank_transfer'
            },
            order_date: new Date().toISOString(),
            status: 'pending_bank_transfer',
            paymentMethod: 'bank_transfer',
            payment_instructions: paymentInstructions
        };

        if (typeof saveOrderToSupabase === 'function') {
            await saveOrderToSupabase(order);
        }

        sessionStorage.setItem('lastBankTransfer', JSON.stringify({
            orderId,
            ...paymentInstructions,
            email: customerEmail
        }));

        cart = [];
        saveCart();
        updateCartCount();
        closeCheckout();

        window.location.href = `payment-success.html?order=${encodeURIComponent(orderId)}&method=bank_transfer`;
    } catch (err) {
        console.error('Errore bonifico:', err);
        messageDiv.textContent = 'Errore nel salvataggio dell\'ordine: ' + err.message;
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Registra ordine e ricevi IBAN';
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

// Variabili globali
const productList = Array.isArray(window.products) ? window.products : [];
let cart = [];
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let filteredProducts = productList;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    if (document.getElementById('productsGrid')) {
        renderProducts(productList);
    }
    updateCartCount();
    checkUserStatus();
    if (window.location.hash === '#login' && !currentUser && document.getElementById('authContainer')) {
        openAuth();
    }
});

// ==================== GESTIONE PRODOTTI ====================

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Nessun prodotto trovato</p>';
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-content">
                <span class="product-type ${product.tipo}">${product.tipo === 'digitale' ? 'PDF Protetto' : 'Stampato'}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-materia">${product.materia.charAt(0).toUpperCase() + product.materia.slice(1)}</p>
                <p class="product-description">${product.descrizione}</p>
                <div class="product-footer">
                    <span class="product-price">${product.prezzo.toFixed(2)}€</span>
                    <button class="add-to-cart-btn btn-small" onclick="viewProduct(${product.id})">Dettagli</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function viewProduct(productId) {
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    const detailDiv = document.getElementById('productDetail');
    let pdfAccessSection = '';
    
    if (product.tipo === 'digitale' && product.pdfFile) {
        pdfAccessSection = `<p style="color: var(--primary-green); font-size: 13px; font-weight: 600;">📥 Accesso istantaneo al PDF dopo l'acquisto</p>`;
    }
    
    detailDiv.innerHTML = `
        <div class="detail-image">${product.emoji}</div>
        <h2 class="detail-title">${product.title}</h2>
        <span class="product-type ${product.tipo}">${product.tipo === 'digitale' ? '📄 PDF Protetto' : '📕 Stampato'}</span>
        <p class="detail-price">${product.prezzo.toFixed(2)}€</p>
        <p class="detail-description">${product.descrizione}</p>
        <div class="detail-specs">
            <p><strong>Descrizione dettagliata:</strong><br>${product.dettagli}</p>
            <p><strong>Pagine:</strong> ${product.pages}</p>
            ${product.tipo === 'digitale' ? `<p><strong>Formato:</strong> PDF protetto da password</p><p><strong>Accesso:</strong> Immediato dopo l'acquisto</p>` : '<p><strong>Spedizione:</strong> Inclusa in tutta Italia</p>'}
        </div>
        ${pdfAccessSection}
        <div class="quantity-selector">
            <label>Quantità:</label>
            <input type="number" id="quantityInput" value="1" min="1" max="10">
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id})">Aggiungi al Carrello</button>
    `;

    openModal('productModal');
}

// ==================== CARRELLO ====================

function addToCart(productId) {
    const product = productList.find(p => p.id === productId);
    if (!product) return;

    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    closeProductModal();
    showNotification('Prodotto aggiunto al carrello!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCartDisplay();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.textContent = count;
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-message">Il carrello è vuoto</p>';
        const totalPrice = document.querySelector('.total-price');
        if (totalPrice) totalPrice.textContent = '0€';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.prezzo * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">
                        ${item.prezzo.toFixed(2)}€ × <input type="number" value="${item.quantity}" min="1" 
                        onchange="updateCartQuantity(${item.id}, this.value)" style="width: 40px;">
                        = <strong>${itemTotal.toFixed(2)}€</strong>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="removeFromCart(${item.id})">Rimuovi</button>
                </div>
            </div>
        `;
    });

    cartItemsDiv.innerHTML = html;
    const totalPrice = document.querySelector('.total-price');
    if (totalPrice) totalPrice.textContent = total.toFixed(2) + '€';
}

// ==================== CARRELLO UI ====================

const cartLink = document.getElementById('cartLink');
if (cartLink) {
    cartLink.addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });
}

function openCart() {
    updateCartDisplay();
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        openModal('cartModal');
    } else {
        window.location.href = 'index.html#cart';
    }
}

function closeCart() {
    closeModal('cartModal');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto');
        return;
    }

    if (!currentUser) {
        alert('Devi accedere per procedere con l\'acquisto');
        closeCart();
        openAuth();
        return;
    }

    let total = cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0);
    document.querySelector('.checkout-total').textContent = total.toFixed(2) + '€';
    
    closeCart();
    openModal('checkoutModal');
}

// ==================== FILTRI ====================

function applyFilters() {
    const filterType = document.getElementById('filterType').value;
    const filterMateria = document.getElementById('filterMateria').value;
    const filterPrezzo = document.getElementById('filterPrezzo').value;
    
    document.getElementById('prezzoDisplay').textContent = filterPrezzo + '€';

    filteredProducts = productList.filter(product => {
        const typeMatch = !filterType || product.tipo === filterType;
        const materiaMatch = !filterMateria || product.materia === filterMateria;
        const prezzoMatch = product.prezzo <= parseInt(filterPrezzo);
        
        return typeMatch && materiaMatch && prezzoMatch;
    });

    renderProducts(filteredProducts);
}

// ==================== AUTENTICAZIONE ====================

const userLink = document.getElementById('userLink');
if (userLink) {
    userLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentUser) {
            window.location.href = 'user-area.html';
        } else if (document.getElementById('authContainer')) {
            openAuth();
        } else {
            window.location.href = 'index.html#login';
        }
    });
}

function openAuth() {
    const modalEl = document.getElementById('authModal');
    const container = document.getElementById('authContainer');
    if (!modalEl || !container) {
        window.location.href = 'index.html#login';
        return;
    }
    container.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="switchAuthTab('login')">Accedi</button>
            <button class="auth-tab" onclick="switchAuthTab('register')">Registrati</button>
        </div>
        
        <form class="auth-form active" id="loginForm" onsubmit="handleLogin(event)">
            <div class="form-group">
                <label>Email:</label>
                <input type="email" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input id="loginPassword" type="password" required style="flex:1;">
                    <button type="button" onclick="togglePassword('loginPassword', this)" style="padding: 6px 10px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px; cursor: pointer;">👁️</button>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Accedi</button>
        </form>

        <form class="auth-form" id="registerForm" onsubmit="handleRegister(event)">
            <div class="form-group">
                <label>Nome Completo:</label>
                <input type="text" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input id="registerPassword" type="password" required style="flex:1;">
                    <button type="button" onclick="togglePassword('registerPassword', this)" style="padding: 6px 10px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px; cursor: pointer;">👁️</button>
                </div>
            </div>
            <div class="form-group">
                <label>Conferma Password:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input id="registerConfirmPassword" type="password" required style="flex:1;">
                    <button type="button" onclick="togglePassword('registerConfirmPassword', this)" style="padding: 6px 10px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 6px; cursor: pointer;">👁️</button>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Registrati</button>
            <p style="font-size: 12px; color: #888; margin-top: 12px;">Ti invieremo un email di conferma</p>
        </form>
    `;
    openModal('authModal');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function togglePassword(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
}

function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('#loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password && u.verified);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUserLink();
        closeAuth();
        showNotification('Accesso effettuato con successo!');
    } else {
        alert('Email o password incorretti, oppure account non verificato');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const nome = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('#registerPassword').value;
    const confirmPassword = form.querySelector('#registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('❌ Le password non coincidono');
        return;
    }

    if (password.length < 6) {
        alert('❌ La password deve essere di almeno 6 caratteri');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('❌ Questo email è già registrato');
        return;
    }

    const newUser = {
        id: Date.now(),
        nome: nome,
        email: email,
        password: password,
        verified: true, // Verificato automaticamente
        registrationDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Salva su Supabase
    saveUserToSupabase(newUser);
    
    // INVIA EMAIL DI CONFERMA REGISTRAZIONE
    sendRegistrationEmail(newUser);
    
    // INVIA NOTIFICA WHATSAPP
    if (window.whatsappNotify) {
        window.whatsappNotify.registration(newUser);
    }
    
    closeAuth();
    showNotification('✅ Registrazione completata! Ti abbiamo inviato una email di conferma.');
}

async function sendRegistrationEmail(user) {
    try {
        await emailjs.send('service_a410o74', 'template_j7hwc4l', {
            email: user.email,
            name: user.nome,
            title: '🎉 Benvenuto su SbobinaMente!',
            message: `Ciao ${user.nome}!\n\nLa tua registrazione è stata completata con successo.\n\n📧 Email: ${user.email}\n📅 Data registrazione: ${new Date(user.registrationDate).toLocaleDateString('it-IT')}\n\nIl tuo account è ora attivo e puoi accedere a tutti i nostri servizi.\n\nBuono studio!\nTeam SbobinaMente`
        });
        console.log('✅ Email di registrazione inviata a:', user.email);
    } catch (error) {
        console.error('❌ Errore invio email registrazione:', error);
    }
}

async function saveUserToSupabase(user) {
    try {
        const userData = {
            nome: user.nome,
            email: user.email,
            password: user.password,
            verified: user.verified,
            registration_date: user.registrationDate
        };
        
        // ⚠️ Salvataggio utenti via localStorage per ora
        // In futuro: crea una Netlify Function per salvataggio sicuro utenti
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const existingIndex = users.findIndex(u => u.email === userData.email);
        if (existingIndex >= 0) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Utente salvato su localStorage:', userData);
    } catch (error) {
        console.error('❌ Errore salvataggio utente:', error);
    }
}

async function saveOrderToSupabase(order) {
    try {
        const orderData = {
            order_id: order.order_id || 'ORD-' + order.id,
            user_name: order.user_name || order.user?.nome || order.deliveryInfo?.nome || 'Cliente',
            user_email: order.user_email || order.user?.email || order.deliveryInfo?.email || '',
            items: order.items,
            total: order.total,
            delivery_info: order.deliveryInfo || order.delivery_info,
            order_date: order.order_date || order.orderDate,
            status: order.status
        };
        
        // ✅ USA NETLIFY FUNCTION (SICURO)
        if (window.API && window.API.createOrder) {
            const result = await window.API.createOrder(orderData);
            console.log('✅ Ordine salvato via API:', result.order);
        } else {
            // Fallback: localStorage se API non disponibile
            console.warn('⚠️ API non disponibile, salvataggio su localStorage');
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));
        }
        
        // Invia notifica WhatsApp
        if (window.whatsappNotify) {
            await window.whatsappNotify.order(orderData);
        }
    } catch (error) {
        console.error('❌ Errore salvataggio ordine:', error);
        // Fallback: salva almeno su localStorage
        try {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push({
                order_id: order.order_id || 'ORD-' + order.id,
                user_email: order.user_email || order.user?.email || order.deliveryInfo?.email || '',
                items: order.items,
                total: order.total
            });
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (e) {
            console.error('Errore anche fallback localStorage:', e);
        }
    }
}

// Rendi disponibile globalmente per altri file
window.saveOrderToSupabase = saveOrderToSupabase;

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserLink();
    showNotification('Logout effettuato');
}

function checkUserStatus() {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    updateUserLink();
}

function updateUserLink() {
    const userLink = document.getElementById('userLink');
    if (!userLink) return;
    if (currentUser) {
        userLink.textContent = `${currentUser.nome.split(' ')[0]} · Area personale`;
        userLink.setAttribute('href', 'user-area.html');
    } else {
        userLink.textContent = 'Accedi';
        userLink.setAttribute('href', '#');
    }
}

// ==================== CHECKOUT ====================

function submitCheckout(e) {
    e.preventDefault();
    // Qui si potrebbe aggiungere validazione ulteriore
    payWithPayPal();
}

function payWithPayPal() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0);
    
    // Raccogli i dati del form
    const formElements = document.getElementById('checkoutForm').elements;
    const orderData = {
        items: cart,
        total: total.toFixed(2),
        customerInfo: {
            nome: formElements[0].value,
            email: formElements[1].value,
            indirizzo: formElements[2].value,
            città: formElements[3].value,
            cap: formElements[4].value
        }
    };

    // IN MODALITÀ TEST: Completa il pagamento direttamente (senza PayPal)
    // In produzione, sostituir con vero redirect PayPal
    closeCheckout();
    processOrderDirect(orderData);
}

function processOrderDirect(orderData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Errore: Utente non trovato');
        return;
    }

    // Crea l'ordine completato
    const order = {
        id: Date.now(),
        order_id: 'ORD-' + Date.now(),
        user: currentUser,
        user_email: currentUser.email,
        user_name: currentUser.nome,
        items: cart,
        total: parseFloat(orderData.total),
        deliveryInfo: orderData.customerInfo,
        delivery_info: orderData.customerInfo,
        orderDate: new Date().toISOString(),
        order_date: new Date().toISOString(),
        status: 'pagato',
        paymentMethod: 'paypal_test'
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Salva su Supabase e invia WhatsApp
    saveOrderToSupabase(order);

    // Genera credenziali PDF protetti con link al viewer
    const digitalsAccess = [];
    cart.forEach(item => {
        if (item.tipo === 'digitale' && item.pdfFile) {
            const password = generatePassword();
            const viewerUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}viewer-pdf.html?order=${order.id}&pwd=${password}&product=${item.id}`;
            
                digitalsAccess.push({
                    orderId: order.id,
                    userEmail: currentUser.email,
                    productId: item.id,
                    title: item.title,
                    pdfFile: item.pdfFile,
                    password: password,
                    accessUrl: viewerUrl,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
        }
    });

    localStorage.setItem('myDigitalsAccess', JSON.stringify(
        [...JSON.parse(localStorage.getItem('myDigitalsAccess')) || [], ...digitalsAccess]
    ));
    
    // Invia email di conferma al cliente
    if (typeof sendPaymentConfirmationEmail === 'function') {
        sendPaymentConfirmationEmail(order, digitalsAccess);
    }

    // Pulisci i dati temporanei
    localStorage.removeItem('pendingOrder');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Mostra la conferma
    showOrderSuccessModal(order, digitalsAccess);
}

function showOrderSuccessModal(order, digitalsAccess) {
    let html = `
        <div style="text-align: center;">
            <h2 style="color: #7cb342;">✅ Pagamento Completato!</h2>
            <p style="font-size: 16px; margin: 20px 0;">Il tuo ordine è stato processato con successo.</p>
            
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <p><strong>Numero Ordine:</strong> ${order.id}</p>
                <p><strong>Data:</strong> ${new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
                <p><strong>Totale Pagato:</strong> ${order.total.toFixed(2)}€</p>
                <p><strong>Email Ricevuta:</strong> ${order.deliveryInfo.email}</p>
            </div>

            <h3 style="margin-top: 30px;">📦 Articoli Ordinati:</h3>
            <div style="text-align: left;">
    `;

    order.items.forEach(item => {
        html += `<p>• ${item.title} (${item.tipo === 'digitale' ? '📄 PDF' : '📕 Stampato'}) × ${item.quantity}</p>`;
    });

    html += `</div>`;

    if (digitalsAccess.length > 0) {
        html += `
            <h3 style="margin-top: 30px; color: #2e7d32;">🔐 I Tuoi PDF Protetti - Accesso Immediato</h3>
            <p style="color: #666; font-size: 13px;">Clicca sul link sottostante per accedere al viewer protetto</p>
        `;
        digitalsAccess.forEach(access => {
            html += `
                <div style="background: linear-gradient(135deg, #b3d9e8 0%, #b8d4c8 100%); padding: 16px; margin: 12px 0; border-radius: 6px; text-align: left;">
                    <strong style="color: #4a6fa5;">📄 ${access.title}</strong><br>
                    <small style="color: #666;">Password: <code style="background: white; padding: 3px 6px; border-radius: 3px; font-weight: 600;">${access.password}</code></small><br>
                    <a href="${access.accessUrl}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 10px 16px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; cursor: pointer;">🔗 Apri Viewer Protetto</a>
                </div>
            `;
        });
        html += `
            <p style="color: #ff9800; font-size: 12px; margin-top: 16px;">⚠️ <strong>Importante:</strong> Il PDF è protetto da copia e download. Puoi visualizzarlo nel browser protetto.</p>
        `;
    }

    if (order.items.some(item => item.tipo === 'fisico')) {
        html += `
            <div style="background: #e8f5e9; padding: 16px; margin: 20px 0; border-radius: 6px; text-align: left;">
                <p style="color: #2e7d32; font-weight: 600;">📦 Dati di Spedizione:</p>
                <p><strong>${order.deliveryInfo.nome}</strong><br>
                ${order.deliveryInfo.indirizzo}<br>
                ${order.deliveryInfo.cap} ${order.deliveryInfo.città}</p>
                <p style="color: var(--primary-green); font-weight: bold;">Consegna prevista: 3-5 giorni lavorativi</p>
            </div>
        `;
    }

    html += `
            <div style="margin-top: 30px;">
                <button onclick="window.location.href='index.html'" style="padding: 12px 24px; background-color: #4a6fa5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px;">Torna alla Home</button>
            </div>
        </div>
    `;

    // Mostra il modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white;
        padding: 40px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    content.innerHTML = html;

    modal.appendChild(content);
    document.body.appendChild(modal);
}

function processOrder() {
    const formElements = document.getElementById('checkoutForm').elements;
    const order = {
        id: Date.now(),
        order_id: 'ORD-' + Date.now(),
        user: currentUser,
        user_email: currentUser.email,
        user_name: currentUser.nome,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0),
        deliveryInfo: {
            nome: formElements[0].value,
            email: formElements[1].value,
            indirizzo: formElements[2].value,
            città: formElements[3].value,
            cap: formElements[4].value
        },
        delivery_info: {
            nome: formElements[0].value,
            email: formElements[1].value,
            indirizzo: formElements[2].value,
            città: formElements[3].value,
            cap: formElements[4].value
        },
        orderDate: new Date().toISOString(),
        order_date: new Date().toISOString(),
        status: 'completato'
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Salva su Supabase e invia WhatsApp
    saveOrderToSupabase(order);

    // Genera credenziali PDF protetti
    const digitalsAccess = [];
    cart.forEach(item => {
        if (item.tipo === 'digitale' && item.pdfFile) {
            const password = generatePassword();
            const viewerUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}viewer-pdf.html?order=${order.id}&pwd=${password}&product=${item.id}`;
            digitalsAccess.push({
                orderId: order.id,
                userEmail: currentUser.email,
                productId: item.id,
                title: item.title,
                pdfFile: item.pdfFile,
                password: password,
                accessUrl: viewerUrl,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
    });

    localStorage.setItem('myDigitalsAccess', JSON.stringify(
        [...JSON.parse(localStorage.getItem('myDigitalsAccess')) || [], ...digitalsAccess]
    ));
    
    // Invia email di conferma al cliente
    if (typeof sendPaymentConfirmationEmail === 'function') {
        sendPaymentConfirmationEmail(order, digitalsAccess);
    }

    closeCheckout();
    cart = [];
    saveCart();
    updateCartCount();
    
    showNotification(`✅ Ordine completato! Numero ordine: ${order.id}`);
    setTimeout(() => {
        showOrderConfirmation(order, digitalsAccess);
    }, 500);
}

function generatePassword() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function showOrderConfirmation(order, digitalsAccess) {
    let confirmationHtml = `
        <h3>✅ Ordine Confermato!</h3>
        <p><strong>Numero Ordine:</strong> ${order.id}</p>
        <p><strong>Data:</strong> ${new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
        <p><strong>Totale:</strong> ${order.total.toFixed(2)}€</p>
        <h4>Articoli Ordinati:</h4>
        <ul>
    `;

    order.items.forEach(item => {
        confirmationHtml += `<li>${item.title} (${item.tipo === 'digitale' ? 'PDF' : 'Stampato'}) - Qty: ${item.quantity}</li>`;
    });

    confirmationHtml += `</ul>`;

    if (digitalsAccess.length > 0) {
        confirmationHtml += `
            <h4>🔐 I Tuoi PDF - Download Immediato:</h4>
            <p style="color: #d32f2f; font-weight: bold;">⚠️ Salva questi file in un luogo sicuro!</p>
        `;
        digitalsAccess.forEach(access => {
            confirmationHtml += `
                <div style="background: linear-gradient(135deg, #b3d9e8 0%, #b8d4c8 100%); padding: 16px; margin: 12px 0; border-radius: 6px; border-left: 4px solid #4a6fa5;">
                    <strong style="color: #4a6fa5;">${access.title}</strong><br>
                    <small style="color: #666;">Password: <code style="background: white; padding: 3px 6px; border-radius: 3px; font-weight: 600;">${access.password}</code></small><br>
                    <a href="${access.accessUrl}" download="${access.pdfFile}" style="display: inline-block; margin-top: 8px; padding: 10px 16px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; cursor: pointer;">📥 Scarica PDF Ora</a>
                </div>
            `;
        });
    }

    confirmationHtml += `
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
            Una email di conferma è stata inviata a ${order.deliveryInfo.email}
        </p>
    `;

    alert(confirmationHtml);
}

function closeCheckout() {
    closeModal('checkoutModal');
}

// ==================== UTILITY ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function closeAuth() {
    closeModal('authModal');
}

function closeProductModal() {
    closeModal('productModal');
}

function scrollToProdotti() {
    document.getElementById('prodotti').scrollIntoView({ behavior: 'smooth' });
}

function showNotification(message) {
    // Creazione notifica semplice
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4a6fa5;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animazioni notifiche
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Chiudi modali cliccando fuori
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Variabili globali
let cart = [];
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let filteredProducts = [];

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    filterCartaceoProducts();
    updateCartCount();
    checkUserStatus();
});

// ==================== GESTIONE PRODOTTI CARTACEI ====================

function filterCartaceoProducts() {
    // Filtra solo i prodotti fisici (cartacei)
    filteredProducts = products.filter(p => p.tipo === 'fisico');
    renderProducts(filteredProducts);
}

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
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
                <span class="product-type fisico">📕 Stampato</span>
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const detailDiv = document.getElementById('productDetail');
    detailDiv.innerHTML = `
        <div class="detail-image">${product.emoji}</div>
        <h2 class="detail-title">${product.title}</h2>
        <span class="product-type fisico">📕 Stampato</span>
        <p class="detail-price">${product.prezzo.toFixed(2)}€</p>
        <p class="detail-description">${product.descrizione}</p>
        <div class="detail-specs">
            <p><strong>Descrizione dettagliata:</strong><br>${product.dettagli}</p>
            <p><strong>Pagine:</strong> ${product.pages}</p>
            <p><strong>Spedizione:</strong> Inclusa in tutta Italia (3-5 giorni)</p>
            <p><strong>Stato:</strong> Nuovo, rilegato professionalmente</p>
        </div>
        <div class="quantity-selector">
            <label>Quantità:</label>
            <input type="number" id="quantityInput" value="1" min="1" max="10">
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id})">Aggiungi al Carrello</button>
    `;

    openModal('productModal');
}

// ==================== FILTRI ====================

function applyFilters() {
    const filterMateria = document.getElementById('filterMateria').value;
    const filterPrezzo = document.getElementById('filterPrezzo').value;
    
    document.getElementById('prezzoDisplay').textContent = filterPrezzo + '€';

    filteredProducts = products.filter(product => {
        const typeMatch = product.tipo === 'fisico'; // Solo cartacei
        const materiaMatch = !filterMateria || product.materia === filterMateria;
        const prezzoMatch = product.prezzo <= parseInt(filterPrezzo);
        
        return typeMatch && materiaMatch && prezzoMatch;
    });

    renderProducts(filteredProducts);
}

// ==================== CARRELLO ====================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
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
    document.querySelector('.cart-count').textContent = count;
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-message">Il carrello è vuoto</p>';
        document.querySelector('.total-price').textContent = '0€';
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
    document.querySelector('.total-price').textContent = total.toFixed(2) + '€';
}

// ==================== CARRELLO UI ====================

document.getElementById('cartLink').addEventListener('click', function(e) {
    e.preventDefault();
    openCart();
});

function openCart() {
    updateCartDisplay();
    openModal('cartModal');
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

// ==================== AUTENTICAZIONE ====================

document.getElementById('userLink').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
        logout();
    } else {
        openAuth();
    }
});

function openAuth() {
    const container = document.getElementById('authContainer');
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
                <input type="password" required>
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
                <input type="password" required>
            </div>
            <div class="form-group">
                <label>Conferma Password:</label>
                <input type="password" required>
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

function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

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
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        alert('Le password non coincidono');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('Questo email è già registrato');
        return;
    }

    const newUser = {
        id: Date.now(),
        nome: nome,
        email: email,
        password: password,
        verified: false,
        registrationDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeAuth();
    showNotification('Registrazione completata! Controlla la tua email per la verifica. (Simulato: clicca qui per verificare)');
    
    setTimeout(() => {
        simulateEmailVerification(newUser.email);
    }, 2000);
}

function simulateEmailVerification(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        user.verified = true;
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Email verificata! Puoi ora accedere.');
    }
}

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
    if (currentUser) {
        userLink.textContent = `${currentUser.nome.split(' ')[0]}`;
    } else {
        userLink.textContent = 'Accedi';
    }
}

// ==================== CHECKOUT ====================

function submitCheckout(e) {
    e.preventDefault();
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
        items: cart.map(item => ({
            name: item.title,
            sku: `SBOB-${item.id}`,
            quantity: item.quantity,
            price: item.prezzo.toFixed(2)
        })),
        total: total.toFixed(2),
        customerInfo: {
            nome: formElements[0].value,
            email: formElements[1].value,
            indirizzo: formElements[2].value,
            città: formElements[3].value,
            cap: formElements[4].value
        }
    };

    // Salva i dati dell'ordine temporaneamente
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));

    // Crea il form PayPal
    const paypalForm = document.createElement('form');
    paypalForm.method = 'POST';
    paypalForm.action = 'https://www.paypal.com/cgi-bin/webscr';
    paypalForm.style.display = 'none';
    
    const inputs = {
        'cmd': '_xclick',
        'business': 'iannonelsia@gmail.com',
        'item_name': 'Ordine SbobinaMente',
        'item_number': `ORD-${Date.now()}`,
        'amount': total.toFixed(2),
        'currency_code': 'EUR',
        'invoice': `${Date.now()}`,
        'custom': JSON.stringify(orderData),
        'return': window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/index.html?payment=success',
        'cancel_return': window.location.origin + window.location.pathname,
        'rm': '2',
        'no_shipping': '2',
        'charset': 'utf-8'
    };

    for (let key in inputs) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = inputs[key];
        paypalForm.appendChild(input);
    }

    document.body.appendChild(paypalForm);
    paypalForm.submit();
}

function processOrder() {
    const formElements = document.getElementById('checkoutForm').elements;
    const order = {
        id: Date.now(),
        user: currentUser,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.prezzo * item.quantity), 0),
        deliveryInfo: {
            nome: formElements[0].value,
            email: formElements[1].value,
            indirizzo: formElements[2].value,
            città: formElements[3].value,
            cap: formElements[4].value
        },
        orderDate: new Date().toISOString(),
        status: 'completato',
        type: 'cartaceo'
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    closeCheckout();
    cart = [];
    saveCart();
    updateCartCount();
    
    showNotification(`✅ Ordine completato! Numero ordine: ${order.id}`);
    setTimeout(() => {
        showOrderConfirmation(order);
    }, 500);
}

function showOrderConfirmation(order) {
    let confirmationHtml = `
        <h3>Ordine Confermato!</h3>
        <p><strong>Numero Ordine:</strong> ${order.id}</p>
        <p><strong>Data:</strong> ${new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
        <p><strong>Totale:</strong> ${order.total.toFixed(2)}€</p>
        <h4>Articoli Ordinati:</h4>
        <ul>
    `;

    order.items.forEach(item => {
        confirmationHtml += `<li>${item.title} - Qty: ${item.quantity}</li>`;
    });

    confirmationHtml += `</ul>`;

    confirmationHtml += `
        <h4>📦 Dati di Spedizione:</h4>
        <div style="background: #f0f0f0; padding: 12px; margin: 8px 0; border-radius: 6px;">
            <p><strong>${order.deliveryInfo.nome}</strong><br>
            ${order.deliveryInfo.indirizzo}<br>
            ${order.deliveryInfo.cap} ${order.deliveryInfo.città}</p>
        </div>
        <p style="color: var(--primary-green); font-weight: bold;">Consegna prevista: 3-5 giorni lavorativi</p>
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

function showNotification(message) {
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

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

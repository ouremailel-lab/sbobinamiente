// Gestione del ritorno da PayPal
document.addEventListener('DOMContentLoaded', function() {
    // Controlla se siamo in ritorno da PayPal
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('payment') === 'success') {
        handlePayPalSuccess();
    }
});

function handlePayPalSuccess() {
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    
    if (!pendingOrder) {
        console.error('Nessun ordine in sospeso');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Crea l'ordine completato
    const order = {
        id: Date.now(),
        user: currentUser,
        items: cart.filter(item => {
            // Trova il prodotto completo
            return products.find(p => p.id === item.id);
        }).map(item => {
            const product = products.find(p => p.id === item.id);
            return {
                ...product,
                quantity: item.quantity
            };
        }),
        total: parseFloat(pendingOrder.total),
        deliveryInfo: pendingOrder.customerInfo,
        orderDate: new Date().toISOString(),
        status: 'pagato',
        paymentMethod: 'paypal'
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Genera credenziali PDF protetti
    const digitalsAccess = [];
    order.items.forEach(item => {
        if (item.tipo === 'digitale' && item.pdfFile) {
            digitalsAccess.push({
                productId: item.id,
                title: item.title,
                pdfFile: item.pdfFile,
                password: generatePassword(),
                accessUrl: `PDF/${encodeURIComponent(item.pdfFile)}`,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
    });

    localStorage.setItem('myDigitalsAccess', JSON.stringify(
        [...JSON.parse(localStorage.getItem('myDigitalsAccess')) || [], ...digitalsAccess]
    ));

    // Pulisci i dati temporanei
    localStorage.removeItem('pendingOrder');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    // Mostra la conferma
    showPaymentSuccessModal(order, digitalsAccess);
}

function showPaymentSuccessModal(order, digitalsAccess) {
    let html = `
        <div style="text-align: center;">
            <h2 style="color: #7cb342;">✅ Pagamento Confermato!</h2>
            <p style="font-size: 16px; margin: 20px 0;">Il tuo ordine è stato processato con successo.</p>
            
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                <p><strong>Numero Ordine:</strong> ${order.id}</p>
                <p><strong>Data:</strong> ${new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
                <p><strong>Totale Pagato:</strong> ${order.total.toFixed(2)}€</p>
                <p><strong>Metodo Pagamento:</strong> PayPal</p>
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
            <h3 style="margin-top: 30px; color: #d32f2f;">🔐 I Tuoi PDF - Download Immediato</h3>
            <p style="color: #d32f2f; font-weight: bold;">⚠️ Salva questi file in un luogo sicuro!</p>
        `;
        digitalsAccess.forEach(access => {
            html += `
                <div style="background: linear-gradient(135deg, #b3d9e8 0%, #b8d4c8 100%); padding: 16px; margin: 12px 0; border-radius: 6px; text-align: left;">
                    <strong style="color: #4a6fa5;">${access.title}</strong><br>
                    <small style="color: #666;">Password: <code style="background: white; padding: 3px 6px; border-radius: 3px; font-weight: 600;">${access.password}</code></small><br>
                    <a href="${access.accessUrl}" download="${access.pdfFile}" style="display: inline-block; margin-top: 8px; padding: 10px 16px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; cursor: pointer;">📥 Scarica PDF</a>
                </div>
            `;
        });
    }

    html += `
        <div style="margin-top: 30px;">
            <p style="font-size: 12px; color: #888;">Una email di conferma con i dettagli dell'ordine è stata inviata a <strong>${order.deliveryInfo.email}</strong></p>
    `;

    if (order.items.some(item => item.tipo === 'fisico')) {
        html += `
            <p style="font-size: 12px; color: #888; margin-top: 10px;">📦 <strong>Spedizione:</strong> Il tuo ordine verrà spedito a breve. Riceverai un numero di tracking via email.</p>
        `;
    }

    html += `
            <button onclick="window.location.href='index.html'" style="margin-top: 20px; padding: 12px 24px; background-color: #4a6fa5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px;">Torna alla Home</button>
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

function generatePassword() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

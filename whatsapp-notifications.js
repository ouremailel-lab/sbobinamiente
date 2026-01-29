// Configurazione notifiche WhatsApp via CallMeBot
const WHATSAPP_PHONE = '393933082204';
const WHATSAPP_API_KEY = '5951328';

async function sendWhatsAppNotification(message) {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodedMessage}&apikey=${WHATSAPP_API_KEY}`;

    console.log('📤 Invio WhatsApp a:', WHATSAPP_PHONE);
    console.log('📝 Messaggio:', message);
    console.log('🔗 URL:', url);

    // Browser: usare image ping per bypassare CORS su GET semplici (no body)
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.onload = () => {
                    console.log('✅ Notifica WhatsApp (image ping) inviata con successo');
                    resolve(true);
                };
                img.onerror = (err) => {
                    console.error('❌ Errore invio WhatsApp (image ping):', err);
                    resolve(false);
                };
                // Avvia la richiesta
                img.src = url + '&_=' + Date.now();
            } catch (err) {
                console.error('❌ Errore invio WhatsApp (image ping exception):', err);
                resolve(false);
            }
        });
    }

    // Server / environment with fetch available: usare fetch normale (senza no-cors)
    if (typeof fetch !== 'undefined') {
        try {
            const response = await fetch(url); // aspettarsi redirect o 200 dalla API
            if (response.ok) {
                console.log('✅ Notifica WhatsApp inviata con successo (fetch)');
                return true;
            } else {
                console.error('❌ Errore invio WhatsApp (fetch):', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Errore invio WhatsApp (fetch exception):', error);
            return false;
        }
    }

    console.error('❌ Nessun metodo disponibile per inviare la notifica (né window/Image né fetch).');
    return false;
}

// Notifica per nuova registrazione
async function notifyNewRegistration(user) {
    const message = `🎉 *NUOVA REGISTRAZIONE*\n\n` +
                   `👤 Nome: ${user.nome}\n` +
                   `📧 Email: ${user.email}\n` +
                   `📅 Data: ${new Date().toLocaleString('it-IT')}`;
    
    await sendWhatsAppNotification(message);
}

// Notifica per nuovo ordine
async function notifyNewOrder(order) {
    console.log('📦 Creazione notifica ordine:', order);

    // semplice validazione
    if (!order || typeof order.total !== 'number') {
        console.error('❌ Ordine non valido per la notifica:', order);
        return false;
    }
    
    const items = (order.items || []).map(item => 
        `- ${item.title} (x${item.quantity || 1})`
    ).join('\n');
    
    const message = `🛒 *NUOVO ORDINE*\n\n` +
                   `📦 Ordine: ${order.order_id || order.id || 'N/A'}\n` +
                   `👤 Cliente: ${order.user_name || order.userName || 'N/A'}\n` +
                   `📧 Email: ${order.user_email || order.userEmail || 'N/A'}\n` +
                   `💰 Totale: €${(order.total || 0).toFixed(2)}\n\n` +
                   `📋 Prodotti:\n${items || '- nessun prodotto -'}`;
    
    return await sendWhatsAppNotification(message);
}

// Export per uso negli altri file (browser e Node)
const exportsObj = {
    registration: notifyNewRegistration,
    order: notifyNewOrder
};

if (typeof window !== 'undefined') {
    window.whatsappNotify = exportsObj;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsObj;
}

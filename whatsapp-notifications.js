// Configurazione notifiche WhatsApp via CallMeBot
const WHATSAPP_PHONE = '393933082204';
const WHATSAPP_API_KEY = '5951328';

async function sendWhatsAppNotification(message) {
    try {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodedMessage}&apikey=${WHATSAPP_API_KEY}`;
        
        await fetch(url);
        console.log('✅ Notifica WhatsApp inviata');
    } catch (error) {
        console.error('❌ Errore invio WhatsApp:', error);
    }
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
    const items = order.items.map(item => 
        `- ${item.title} (x${item.quantity})`
    ).join('\n');
    
    const message = `🛒 *NUOVO ORDINE*\n\n` +
                   `📦 Ordine #${order.id}\n` +
                   `👤 Cliente: ${order.userName}\n` +
                   `📧 Email: ${order.userEmail}\n` +
                   `💰 Totale: ${order.total.toFixed(2)}€\n\n` +
                   `📋 Prodotti:\n${items}`;
    
    await sendWhatsAppNotification(message);
}

// Export per uso negli altri file
window.whatsappNotify = {
    registration: notifyNewRegistration,
    order: notifyNewOrder
};

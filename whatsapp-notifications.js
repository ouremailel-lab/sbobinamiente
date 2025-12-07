// Configurazione notifiche WhatsApp via CallMeBot
const WHATSAPP_PHONE = '393933082204';
const WHATSAPP_API_KEY = '5951328';

async function sendWhatsAppNotification(message) {
    try {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodedMessage}&apikey=${WHATSAPP_API_KEY}`;
        
        console.log('📤 Invio WhatsApp a:', WHATSAPP_PHONE);
        console.log('📝 Messaggio:', message);
        console.log('🔗 URL:', url);
        
        const response = await fetch(url, { mode: 'no-cors' });
        console.log('✅ Notifica WhatsApp inviata con successo');
        return true;
    } catch (error) {
        console.error('❌ Errore invio WhatsApp:', error);
        return false;
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
    console.log('📦 Creazione notifica ordine:', order);
    
    const items = order.items.map(item => 
        `- ${item.title} (x${item.quantity || 1})`
    ).join('\n');
    
    const message = `🛒 *NUOVO ORDINE*\n\n` +
                   `📦 Ordine: ${order.order_id || order.id}\n` +
                   `👤 Cliente: ${order.user_name || order.userName}\n` +
                   `📧 Email: ${order.user_email || order.userEmail}\n` +
                   `💰 Totale: €${order.total.toFixed(2)}\n\n` +
                   `📋 Prodotti:\n${items}`;
    
    return await sendWhatsAppNotification(message);
}

// Export per uso negli altri file
window.whatsappNotify = {
    registration: notifyNewRegistration,
    order: notifyNewOrder
};

// ==================== SERVIZIO EMAIL EMAILJS ====================
const EMAILJS_SERVICE_ID = 'service_a410o74';
const EMAILJS_TEMPLATE_REGISTRATION = 'template_j7hwc4l';
const EMAILJS_TEMPLATE_ORDER = 'template_b69xo05';

// Funzione helper per inviare email via EmailJS
async function sendEmailViaEmailJS(email, name, title, message, templateId) {
    try {
        const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, {
            email: email,
            name: name,
            title: title,
            message: message
        });
        console.log('✅ Email inviata:', result.status);
        return true;
    } catch (error) {
        console.error('❌ Errore:', error);
        return false;
    }
}

// 1. EMAIL DI CONFERMA REGISTRAZIONE
async function sendRegistrationConfirmationEmail(user) {
    const title = '🎉 Benvenuto su SbobinaMente';
    const message = `Benvenuto/a ${user.nome}! La tua registrazione è stata completata con successo. Email: ${user.email}. Il tuo account è ora attivo.`;
    
    return sendEmailViaEmailJS(user.email, user.nome, title, message, EMAILJS_TEMPLATE_REGISTRATION);
}

// 2. EMAIL DI CONFERMA PAGAMENTO
async function sendPaymentConfirmationEmail(order, digitalsAccess) {
    let itemsList = '';
    order.items.forEach(item => {
        itemsList += `• ${item.title} × ${item.quantity}\n`;
    });

    const title = `✅ Ordine Confermato #${order.id}`;
    const message = `Grazie per il tuo acquisto!\n\nOrdine: ${order.id}\nTotale: ${order.total.toFixed(2)}€\n\nArticoli:\n${itemsList}\n\nRiceverai presto i dettagli.`;
    
    return sendEmailViaEmailJS(order.deliveryInfo.email, order.deliveryInfo.fullName, title, message, EMAILJS_TEMPLATE_ORDER);
}

// 3. EMAIL CON PDF (richiesta dal cliente)
async function sendPDFDownloadEmail(customerEmail, customerName, pdfAccess) {
    const title = `📥 Scarica il tuo PDF: ${pdfAccess.title}`;
    const message = `Ciao ${customerName},\n\nAccedi al tuo PDF qui:\nLink: https://sbobinamente.netlify.app/viewer-pdf.html?file=${pdfAccess.pdfFile}\nPassword: ${pdfAccess.password}\n\nBuona lettura!`;
    
    return sendEmailViaEmailJS(customerEmail, customerName, title, message, EMAILJS_TEMPLATE_ORDER);
}

// 4. EMAIL GENERICA DI ASSISTENZA
async function sendSupportEmail(senderEmail, senderName, subject, message) {
    return sendEmailViaEmailJS(senderEmail, senderName, `Assistenza: ${subject}`, message, EMAILJS_TEMPLATE_REGISTRATION);
}

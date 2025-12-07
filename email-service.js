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
    const deliveryInfo = order.deliveryInfo || {};
    const customerName = deliveryInfo.nomeCompleto || deliveryInfo.fullName || 
                        (deliveryInfo.nome && deliveryInfo.cognome ? `${deliveryInfo.nome} ${deliveryInfo.cognome}` : deliveryInfo.nome) || 
                        'Cliente';
    const customerEmail = deliveryInfo.email || order.user?.email;
    
    if (!customerEmail) {
        console.error('❌ Email cliente non trovata nell\'ordine');
        return false;
    }
    
    // Lista prodotti dettagliata per il body
    let itemsList = '';
    order.items.forEach(item => {
        const quantity = item.quantity || 1;
        const prezzo = item.prezzo || item.price || 0;
        const subtotal = prezzo * quantity;
        itemsList += `• ${item.title}\n  ${item.tipo === 'digitale' ? '📄 PDF Digitale' : '📕 Appunti Stampati'} - Qty: ${quantity} × €${prezzo.toFixed(2)} = €${subtotal.toFixed(2)}\n`;
    });
    
    // Informazioni PDF se presenti
    let pdfInfo = '';
    if (digitalsAccess && digitalsAccess.length > 0) {
        pdfInfo = '\n\n📥 ACCESSO AI TUOI PDF DIGITALI:\n';
        digitalsAccess.forEach(access => {
            pdfInfo += `\n• ${access.title}\n  🔐 Password: ${access.password}\n  🔗 Link: ${access.accessUrl || 'Disponibile nel tuo account'}\n`;
        });
    }
    
    // Dati di spedizione/consegna
    let deliveryDetails = '';
    if (deliveryInfo.indirizzo || deliveryInfo.address) {
        const nomeSpedizione = deliveryInfo.nomeCompleto || 
                               (deliveryInfo.nome && deliveryInfo.cognome ? `${deliveryInfo.nome} ${deliveryInfo.cognome}` : deliveryInfo.nome) || 
                               deliveryInfo.fullName || customerName;
        deliveryDetails = `\n\n📦 INDIRIZZO DI SPEDIZIONE:\n${nomeSpedizione}\n${deliveryInfo.indirizzo || deliveryInfo.address || ''}\n${deliveryInfo.città || deliveryInfo.city || ''} ${deliveryInfo.cap || ''}\n`;
        if (deliveryInfo.telefono || deliveryInfo.phone) {
            deliveryDetails += `Tel: ${deliveryInfo.telefono || deliveryInfo.phone}\n`;
        }
    }

    const fullMessage = `Stato: ${order.status === 'pagato' ? 'Pagato ✓' : order.status === 'completato' ? 'Completato ✓' : order.status}${pdfInfo}${deliveryDetails}\n\nGrazie per aver scelto SbobinaMente! 📚`;

    try {
        // Invia con tutti i parametri che il template si aspetta
        const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ORDER, {
            to_email: customerEmail,
            to_name: customerName,
            email: customerEmail,
            name: customerName,
            order_number: order.id,
            order_date: new Date(order.orderDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            total: order.total.toFixed(2),
            items: itemsList,
            message: fullMessage,
            title: `Ordine Confermato #${order.id}`
        });
        console.log('✅ Email ordine inviata:', result.status);
        return true;
    } catch (error) {
        console.error('❌ Errore invio email ordine:', error);
        return false;
    }
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

// 5. REPORT MENSILE REGISTRAZIONI
async function sendMonthlyRegistrationReport() {
    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.length === 0) {
            console.log('⚠️ Nessun utente registrato questo mese');
            return false;
        }

        // Filtra utenti registrati questo mese
        const now = new Date();
        const thisMonthUsers = users.filter(u => {
            const regDate = new Date(u.registrationDate);
            return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
        });

        // Crea lista in formato tabella
        let usersList = 'EMAIL | NOME | COGNOME | DATA REGISTRAZIONE\n';
        usersList += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        thisMonthUsers.forEach(user => {
            const regDate = new Date(user.registrationDate).toLocaleDateString('it-IT');
            usersList += `${user.email} | ${user.nome} | - | ${regDate}\n`;
        });

        usersList += `\nTotale registrazioni questo mese: ${thisMonthUsers.length}`;

        const title = `📊 Report Registrazioni ${now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`;
        const message = `Ciao!\n\nEcco il report mensile delle registrazioni:\n\n${usersList}\n\nAccedi al pannello admin per maggiori dettagli.\n\nTeam SbobinaMente`;

        await emailjs.send('service_a410o74', 'template_iljizfb', {
            email: 'ouremailel@gmail.com',
            name: 'Admin SbobinaMente',
            title: title,
            message: message
        });

        console.log('✅ Report mensile inviato a ouremailel@gmail.com');
        return true;
    } catch (error) {
        console.error('❌ Errore invio report:', error);
        return false;
    }
}

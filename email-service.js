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
        const quantity = item.quantity || 1;
        itemsList += `• ${item.title} × ${quantity}\n`;
    });

    const title = `✅ Ordine Confermato #${order.id}`;
    const message = `Grazie per il tuo acquisto!\n\nOrdine: ${order.id}\nTotale: ${order.total.toFixed(2)}€\n\nArticoli:\n${itemsList}\n\nRiceverai presto i dettagli.`;
    
    const customerName = order.deliveryInfo?.fullName || order.deliveryInfo?.nome || 'Cliente';
    const customerEmail = order.deliveryInfo?.email || order.user?.email;
    
    if (!customerEmail) {
        console.error('❌ Email cliente non trovata nell\'ordine');
        return false;
    }
    
    return sendEmailViaEmailJS(customerEmail, customerName, title, message, EMAILJS_TEMPLATE_ORDER);
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

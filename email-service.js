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
    
    // Lista prodotti dettagliata
    let itemsList = '';
    order.items.forEach(item => {
        const quantity = item.quantity || 1;
        const prezzo = item.prezzo || item.price || 0;
        const subtotal = prezzo * quantity;
        itemsList += `• ${item.title}\n  Tipo: ${item.tipo === 'digitale' ? 'PDF Digitale' : 'Appunti Stampati'}\n  Quantità: ${quantity} × €${prezzo.toFixed(2)} = €${subtotal.toFixed(2)}\n\n`;
    });
    
    // Informazioni PDF se presenti
    let pdfInfo = '';
    if (digitalsAccess && digitalsAccess.length > 0) {
        pdfInfo = '\n\n📥 ACCESSO AI PDF DIGITALI:\n';
        digitalsAccess.forEach(access => {
            pdfInfo += `\n• ${access.title}\n  Password: ${access.password}\n  Link: ${access.accessUrl || 'Disponibile nel tuo account'}\n`;
        });
    }
    
    // Dati di spedizione/consegna
    let deliveryDetails = '';
    if (deliveryInfo.indirizzo || deliveryInfo.address) {
        const nomeSpedizione = deliveryInfo.nomeCompleto || 
                               (deliveryInfo.nome && deliveryInfo.cognome ? `${deliveryInfo.nome} ${deliveryInfo.cognome}` : deliveryInfo.nome) || 
                               deliveryInfo.fullName || customerName;
        deliveryDetails = `\n\n📦 DATI DI CONSEGNA:\nNome Completo: ${nomeSpedizione}\nEmail: ${deliveryInfo.email || customerEmail}\nIndirizzo: ${deliveryInfo.indirizzo || deliveryInfo.address || ''}\nCittà: ${deliveryInfo.città || deliveryInfo.city || ''}\nCAP: ${deliveryInfo.cap || ''}\n`;
        if (deliveryInfo.telefono || deliveryInfo.phone) {
            deliveryDetails += `Telefono: ${deliveryInfo.telefono || deliveryInfo.phone}\n`;
        }
    }

    const title = `✅ Ordine Confermato #${order.id}`;
    const message = `Gentile ${customerName},\n\nGrazie per il tuo acquisto su SbobinaMente!\n\n📋 DETTAGLI ORDINE:\nNumero Ordine: #${order.id}\nData: ${new Date(order.orderDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\nStato: ${order.status === 'pagato' ? 'Pagato ✓' : order.status === 'completato' ? 'Completato ✓' : order.status}\nMetodo di Pagamento: ${order.paymentMethod || 'Non specificato'}\n\n🛒 ARTICOLI ACQUISTATI:\n${itemsList}\n💰 TOTALE: €${order.total.toFixed(2)}${pdfInfo}${deliveryDetails}\n\nPer qualsiasi domanda o assistenza, contattaci a info@sbobinamante.com\n\nGrazie per aver scelto SbobinaMente!\nBuono studio! 📚\n\n---\nTeam SbobinaMente`;
    
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

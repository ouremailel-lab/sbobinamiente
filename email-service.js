// ==================== SERVIZIO EMAIL EMAILJS ====================
const EMAILJS_PUBLIC_KEY = 'Bo-Kyor5W-Q_BRDf3';
const EMAILJS_SERVICE_ID = 'sAJlIG2M63bqNohFuCqje';
const EMAILJS_TEMPLATE_ID = 'template_j7hwc4l';

// Inizializza EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Funzione helper per inviare email via EmailJS
async function sendEmailViaEmailJS(to_email, to_name, subject, message) {
    try {
        const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            email: to_email,
            name: to_name,
            subject: subject,
            message: message
        });
        console.log('✅ Email inviata con successo:', result.status);
        return true;
    } catch (error) {
        console.error('❌ Errore nell\'invio email:', error);
        return false;
    }
}

// 1. EMAIL DI CONFERMA REGISTRAZIONE
async function sendRegistrationConfirmationEmail(user) {
    const subject = '🎉 Benvenuto su SbobinaMente - Email di Conferma Registrazione';
    const message = `Caro/a ${user.nome},

Benvenuto/a su SbobinaMente! 🎉

La tua registrazione è stata completata con successo. 
Email: ${user.email}
Data Iscrizione: ${new Date().toLocaleDateString('it-IT')}

Il tuo account è ora attivo e puoi iniziare a navigare nel catalogo dei nostri prodotti.

🔐 Informazioni Account:
- Username: ${user.email}
- Account creato: ${new Date(user.registrationDate).toLocaleString('it-IT')}

Cosa puoi fare adesso:
1️⃣ Navigare tra i nostri prodotti
2️⃣ Acquistare PDF protetti con accesso immediato
3️⃣ Ordinare appunti stampati
4️⃣ Ricevere i tuoi acquisti direttamente via email

Se hai domande, non esitare a contattarci!

Cordiali saluti,
Il Team di SbobinaMente

---
SbobinaMente - Appunti e PDF Protetti
Email: info@sbobinamente.com`;

    await sendEmailViaEmailJS(user.email, user.nome, subject, message);
}

// 2. EMAIL DI CONFERMA PAGAMENTO + DATI ORDINE
async function sendPaymentConfirmationEmail(order, digitalsAccess) {
    let itemsList = '';
    order.items.forEach(item => {
        itemsList += `• ${item.title} (${item.tipo === 'digitale' ? '📄 PDF' : '📕 Stampato'}) × ${item.quantity} = ${(item.prezzo * item.quantity).toFixed(2)}€\n`;
    });

    let digitalAccessInfo = '';
    if (digitalsAccess.length > 0) {
        digitalAccessInfo = `\n📚 I TUOI PDF PROTETTI - ACCESSO IMMEDIATO:\n`;
        digitalsAccess.forEach((access, idx) => {
            digitalAccessInfo += `\n${idx + 1}. ${access.title}\n   Password: ${access.password}\n   Link di accesso: https://sbobinamente.netlify.app/viewer-pdf.html?file=${access.pdfFile}\n   Scadenza accesso: ${new Date(access.expiryDate).toLocaleDateString('it-IT')}\n`;
        });
    }

    let shippingInfo = '';
    if (order.deliveryInfo) {
        shippingInfo = `\n📦 INFORMAZIONI DI SPEDIZIONE:\nDestinatario: ${order.deliveryInfo.fullName}\nIndirizzo: ${order.deliveryInfo.address}\nCittà: ${order.deliveryInfo.city}\nCAP: ${order.deliveryInfo.cap}\n`;
    }

    const subject = `✅ Ordine Confermato #${order.id} - SbobinaMente`;
    const message = `Caro/a ${order.deliveryInfo.fullName},

Grazie per il tuo acquisto! ✅

NUMERO ORDINE: ${order.id}
Data Ordine: ${new Date(order.orderDate).toLocaleDateString('it-IT')}
Metodo Pagamento: PayPal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ARTICOLI ORDINATI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Totale Pagato: ${order.total.toFixed(2)}€
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${digitalAccessInfo}${shippingInfo}
PROSSIMI PASSI:
✅ Pagamento confermato
📧 Riceverai una conferma a breve
📚 Per i PDF: accedi istantaneamente dal link sopra
📦 Per gli articoli stampati: la spedizione avverrà entro 3-5 giorni lavorativi

Hai domande? Contattaci:
📧 Email: info@sbobinamente.com
📞 Assistenza disponibile 24/7

Grazie per aver scelto SbobinaMente!

Il Team di SbobinaMente`;

    await sendEmailViaEmailJS(order.deliveryInfo.email, order.deliveryInfo.fullName, subject, message);
}

// 3. EMAIL CON PDF (richiesta dal cliente)
async function sendPDFDownloadEmail(customerEmail, customerName, pdfAccess) {
    const subject = `📥 Scarica il tuo PDF: ${pdfAccess.title}`;
    const message = `Caro/a ${customerName},

Qui di seguito troverai il link per scaricare il tuo PDF protetto: ${pdfAccess.title}

🔐 ACCESSO AL PDF:
Link: https://sbobinamente.netlify.app/viewer-pdf.html?file=${pdfAccess.pdfFile}
Password: ${pdfAccess.password}

📌 ISTRUZIONI:
1. Clicca sul link sopra
2. Inserisci la password: ${pdfAccess.password}
3. Visualizza e prendi appunti direttamente dal viewer
4. Per scaricare: usa il pulsante "Scarica" nel visualizzatore

🛡️ PROTEZIONE:
- Il file è protetto da password
- Accesso valido fino al: ${new Date(pdfAccess.expiryDate).toLocaleDateString('it-IT')}
- Non è possibile copiare il testo (protezione anti-copia)

Se hai problemi nell'accesso o domande:
📧 Email: info@sbobinamente.com
💬 Assistenza 24/7 disponibile

Buona lettura! 📚

Il Team di SbobinaMente`;

    await sendEmailViaEmailJS(customerEmail, customerName, subject, message);
}

// 4. EMAIL GENERICA DI ASSISTENZA
async function sendSupportEmail(senderEmail, senderName, subject, message) {
    const fullMessage = `Richiesta ricevuta da: ${senderName}
Email: ${senderEmail}

Argomento: ${subject}

Messaggio:
${message}

---
Riceverai una risposta dal nostro team entro 24 ore.
Grazie per aver contattato SbobinaMente!`;

    await sendEmailViaEmailJS(senderEmail, senderName, `Richiesta Assistenza: ${subject}`, fullMessage);
}

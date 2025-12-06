// ==================== SERVIZIO EMAIL FORMSPREE ====================
const FORMSPREE_ID = 'myzrpqav';
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

// 1. EMAIL DI CONFERMA REGISTRAZIONE
async function sendRegistrationConfirmationEmail(user) {
    const emailData = {
        email: user.email,
        name: user.nome,
        _subject: '🎉 Benvenuto su SbobinaMente - Email di Conferma Registrazione',
        _replyto: user.email,
        message: `
Caro/a ${user.nome},

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
Email: info@sbobinamente.com
        `
    };

    try {
        await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        console.log('✅ Email di registrazione inviata a:', user.email);
    } catch (error) {
        console.error('❌ Errore nell\'invio email di registrazione:', error);
    }
}

// 2. EMAIL DI CONFERMA PAGAMENTO + DATI ORDINE
async function sendPaymentConfirmationEmail(order, digitalsAccess) {
    let itemsList = '';
    order.items.forEach(item => {
        itemsList += `• ${item.title} (${item.tipo === 'digitale' ? '📄 PDF' : '📕 Stampato'}) × ${item.quantity} = ${(item.prezzo * item.quantity).toFixed(2)}€\n`;
    });

    let digitalAccessInfo = '';
    if (digitalsAccess.length > 0) {
        digitalAccessInfo = `

📚 I TUOI PDF PROTETTI - ACCESSO IMMEDIATO:
${digitalsAccess.map((access, idx) => `
${idx + 1}. ${access.title}
   Password: ${access.password}
   Link di accesso: https://sbobinamente.netlify.app/viewer-pdf.html?file=${access.pdfFile}
   Scadenza accesso: ${new Date(access.expiryDate).toLocaleDateString('it-IT')}
`).join('')}
`;
    }

    let shippingInfo = '';
    if (order.deliveryInfo) {
        shippingInfo = `

📦 INFORMAZIONI DI SPEDIZIONE:
Destinatario: ${order.deliveryInfo.fullName}
Indirizzo: ${order.deliveryInfo.address}
Città: ${order.deliveryInfo.city}
CAP: ${order.deliveryInfo.cap}
`;
    }

    const emailData = {
        email: order.deliveryInfo.email,
        name: order.deliveryInfo.fullName,
        _subject: `✅ Ordine Confermato #${order.id} - SbobinaMente`,
        _replyto: order.deliveryInfo.email,
        message: `
Caro/a ${order.deliveryInfo.fullName},

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
${digitalAccessInfo}
${shippingInfo}

PROSSIMI PASSI:
✅ Pagamento confermato
📧 Riceverai una conferma a breve
📚 Per i PDF: accedi istantaneamente dal link sopra
📦 Per gli articoli stampati: la spedizione avverrà entro 3-5 giorni lavorativi

Hai domande? Contattaci:
📧 Email: info@sbobinamente.com
📞 Assistenza disponibile 24/7

Grazie per aver scelto SbobinaMente!

Il Team di SbobinaMente
        `
    };

    try {
        await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        console.log('✅ Email di conferma pagamento inviata a:', order.deliveryInfo.email);
    } catch (error) {
        console.error('❌ Errore nell\'invio email di pagamento:', error);
    }
}

// 3. EMAIL CON PDF (richiesta dal cliente)
async function sendPDFDownloadEmail(customerEmail, customerName, pdfAccess) {
    const emailData = {
        email: customerEmail,
        name: customerName,
        _subject: `📥 Scarica il tuo PDF: ${pdfAccess.title}`,
        _replyto: customerEmail,
        message: `
Caro/a ${customerName},

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

Il Team di SbobinaMente
        `
    };

    try {
        await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        console.log('✅ Email di download PDF inviata a:', customerEmail);
    } catch (error) {
        console.error('❌ Errore nell\'invio email PDF:', error);
    }
}

// 4. EMAIL GENERICA DI ASSISTENZA
async function sendSupportEmail(senderEmail, senderName, subject, message) {
    const emailData = {
        email: senderEmail,
        name: senderName,
        _subject: `Richiesta Assistenza: ${subject}`,
        _replyto: senderEmail,
        message: `
Richiesta ricevuta da: ${senderName}
Email: ${senderEmail}

Argomento: ${subject}

Messaggio:
${message}

---
Riceverai una risposta dal nostro team entro 24 ore.
Grazie per aver contattato SbobinaMente!
        `
    };

    try {
        await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        console.log('✅ Email di assistenza inviata');
    } catch (error) {
        console.error('❌ Errore nell\'invio email assistenza:', error);
    }
}

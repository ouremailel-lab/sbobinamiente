// Configurazione EmailJS per invio credenziali PDF

const EMAIL_CONFIG = {
  serviceId: 'service_r952gjr',
  templateId: 'template_mgtk7fk',
  publicKey: 'XhJ4ib2UUOt20rMxV'
};

// Funzione per inviare email con credenziali PDF
async function sendPDFCredentialsEmail(customerEmail, customerName, sessionId, pdfAccesses) {
  try {
    // Controllo email valida
    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      console.error('❌ Email destinatario non valida:', customerEmail);
      return { success: false, error: { message: 'Indirizzo email destinatario non valido.' } };
    }

    const credentialsText = pdfAccesses.map(pdf => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 ${pdf.productName}

🔑 Password: ${pdf.password}
🔗 Link: ${pdf.accessUrl}
⏰ Valido fino al: ${new Date(pdf.expiryDate).toLocaleDateString('it-IT')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `).join('\n');

    const templateParams = {
      to_email: customerEmail,
      customer_name: customerName || 'Cliente',
      session_id: sessionId,
      pdf_credentials: credentialsText,
      order_date: new Date().toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.publicKey
    );

    if (response.status !== 200) {
      console.error('❌ EmailJS non ha risposto con successo:', response);
      return { success: false, error: { message: 'EmailJS non ha risposto con successo.' } };
    }

    console.log('✅ Email inviata con successo!', response);
    return { success: true, response };

  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return { success: false, error: { message: error.message || 'Errore sconosciuto.' } };
  }
}

// Export per uso in altri file
if (typeof window !== 'undefined') {
  window.sendPDFCredentialsEmail = sendPDFCredentialsEmail;
  window.EMAIL_CONFIG = EMAIL_CONFIG;
}

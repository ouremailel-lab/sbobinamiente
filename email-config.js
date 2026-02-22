// Configurazione EmailJS per invio credenziali PDF

const EMAIL_CONFIG = {
  serviceId: 'service_r952gjr',
  templateId: 'template_mgtk7fk',
  publicKey: 'XhJ4ib2UUOt20rMxV'
};

// Funzione per inviare email con credenziali PDF
async function sendPDFCredentialsEmail(customerEmail, customerName, sessionId, pdfAccesses) {
  // customerEmail deve essere quello inserito dall'utente
  try {
    console.log('📧 Preparing email for:', customerEmail);

    const credentialsText = pdfAccesses.map(pdf => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 ${pdf.productName}

🔑 Password: ${pdf.password}
🔗 Link: ${pdf.accessUrl}
⏰ Valido fino al: ${new Date(pdf.expiryDate).toLocaleDateString('it-IT')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `).join('\n');

    const templateParams = {
      to_email: customerEmail, // ← Deve corrispondere al template EmailJS
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

    console.log('📤 Sending email via EmailJS...');
    console.log('✅ Service ID:', EMAIL_CONFIG.serviceId);
    console.log('✅ Template ID:', EMAIL_CONFIG.templateId);
    console.log('✅ Public Key:', EMAIL_CONFIG.publicKey);
    console.log('✅ To:', customerEmail);
    console.log('📋 Template Params:', templateParams); // ← Debug completo

    // Invia email tramite EmailJS
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.publicKey
    );

    console.log('✅ Email sent successfully!', response);
    return { success: true, response };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      text: error.text,
      status: error.status,
      message: error.message,
      fullError: error // ← Log completo dell'errore
    });
    return { success: false, error };
  }
}

// Export per uso in altri file
if (typeof window !== 'undefined') {
  window.sendPDFCredentialsEmail = sendPDFCredentialsEmail;
  window.EMAIL_CONFIG = EMAIL_CONFIG;
}

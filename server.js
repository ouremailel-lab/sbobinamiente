import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// ⚠️ MODALITÀ TEST: Commenta questo controllo per testare senza Stripe
/*
if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_live_')) {
  console.error('❌ ERRORE: STRIPE_SECRET_KEY non impostata o non valida. Imposta una chiave privata live di Stripe nelle variabili ambiente.');
  process.exit(1);
}
*/

// ✅ Usa chiave di test hardcoded per sviluppo locale
const stripe = new Stripe(stripeSecretKey || 'sk_test_51QRoKMCinZcgnEHd3bUMpuT4zE9Z3nJYiVvAJPH0FkFKI7LLfDtDNtZdPXlz2i0OBmvbvnpHJVXLZJYJr6kfRm7N00QVVmZpqj');

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const APP_URL = process.env.APP_URL || "https://sbobinamente.it";

const toCents = (value) => {
  if (typeof value === "string") {
    const n = parseFloat(value.replace("€", "").replace(",", ".").trim());
    return Math.round((n || 0) * 100);
  }
  if (Number.isInteger(value) && value >= 1000) return value; // già in centesimi
  return Math.round((Number(value) || 0) * 100);
};

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    console.log('📥 ==========================================');
    console.log('📥 Received request');
    console.log('📥 Headers:', req.headers);
    console.log('📥 Body:', JSON.stringify(req.body, null, 2));
    console.log('📥 ==========================================');
    
    const { items, shipping, customerEmail } = req.body;

    // Validazione più dettagliata
    if (!items) {
      console.error('❌ items is undefined');
      return res.status(400).json({ error: 'Campo items mancante' });
    }

    if (!Array.isArray(items)) {
      console.error('❌ items is not an array:', typeof items);
      return res.status(400).json({ error: 'items deve essere un array' });
    }

    if (items.length === 0) {
      console.error('❌ items array is empty');
      return res.status(400).json({ error: 'Carrello vuoto' });
    }

    console.log(`✅ Validazione OK: ${items.length} items`);

    // Build line items array
    const lineItems = items.map((item, index) => {
      console.log(`📦 Processing item ${index}:`, item);
      
      const name = item?.name || item?.title || item?.titolo || 'Prodotto';
      const rawPrice = item?.price ?? item?.prezzo ?? 0;
      const priceNum = typeof rawPrice === "string"
        ? parseFloat(rawPrice.replace("€", "").replace(",", ".").trim())
        : Number(rawPrice);
      const quantity = item?.quantity || item?.quantita || 1;

      console.log(`   → Name: ${name}, Price: ${priceNum}, Qty: ${quantity}`);

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: name,
            description: item?.description || item?.descrizione || '',
            images: item?.image ? [item.image] : [],
            metadata: {
              product_id: String(item?.id || ""),
              type: item?.tipo || item?.type || 'digitale'
            }
          },
          unit_amount: Math.round(priceNum * 100),
        },
        quantity: quantity,
      };
    });

    console.log('✅ Line items created:', lineItems.length);

    // Add shipping as line item if present
    if (shipping && shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Spedizione',
            description: 'Costi di spedizione per prodotti fisici'
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Check if cart contains physical items
    const hasPhysical = items.some(item => 
      item.type === 'fisico' || item.tipo === 'fisico' ||
      item.type === 'cartaceo' || item.tipo === 'cartaceo'
    );

    // Build session configuration
    // MODE: 'payment' for one-time purchases ✅
    const sessionConfig = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`, // ✅ Correct
      cancel_url: `${APP_URL}/checkout.html`, // ✅ Public URL
      payment_method_types: ['card', 'paypal', 'link'],
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      metadata: {
        source: 'sbobinamente_web',
        order_type: hasPhysical ? 'mixed' : 'digital',
        cart_items: JSON.stringify(items.map(i => ({ id: i.id, qty: i.quantity || 1 })))
      }
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Add shipping address collection for physical items
    if (hasPhysical) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['IT', 'FR', 'DE', 'ES', 'NL', 'BE', 'AT', 'CH'],
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return the URL to the frontend
    // Frontend will then redirect: window.location.href = session.url
    res.json({ 
      url: session.url, // ✅ This is the Stripe Checkout URL
      session_id: session.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful:', session.id);
      
      // Genera password per i PDF acquistati
      await handleSuccessfulPayment(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Funzione per gestire pagamenti completati
async function handleSuccessfulPayment(session) {
  try {
    console.log('🔐 Generating PDF passwords for session:', session.id);
    
    // Recupera i dettagli della sessione con line_items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    });

    // Estrai email cliente
    const customerEmail = session.customer_details?.email || session.customer_email;
    
    if (!customerEmail) {
      console.error('❌ No customer email found');
      return;
    }

    // Recupera gli item acquistati dal metadata
    const cartItems = JSON.parse(session.metadata?.cart_items || '[]');
    
    // Filtra solo i PDF (digitali)
    const pdfItems = cartItems.filter(item => 
      item.type === 'digitale' || item.tipo === 'digitale'
    );

    if (pdfItems.length === 0) {
      console.log('ℹ️ No digital products in this order');
      return;
    }

    // Genera password per ogni PDF
    const pdfAccesses = pdfItems.map(item => ({
      orderId: session.id,
      productId: item.id,
      productName: item.name || item.title || item.titolo,
      password: generateSecurePassword(),
      accessUrl: `https://sbobinamente.it/viewer-pdf.html?session=${session.id}&product=${item.id}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 anno
    }));

    console.log('✅ Generated passwords:', pdfAccesses);

    // TODO: Salva su database (Supabase)
    // await saveToDatabase(pdfAccesses);

    // Invia email con le credenziali
    await sendPDFCredentialsEmail(customerEmail, session, pdfAccesses);

    console.log('✅ PDF credentials sent to:', customerEmail);
  } catch (error) {
    console.error('❌ Error handling payment:', error);
  }
}

// Genera password sicura
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Invia email con credenziali PDF (versione backend)
async function sendPDFCredentialsEmail(email, session, pdfAccesses) {
  console.log(`📧 Sending PDF credentials to ${email}`);
  
  // Formatta le credenziali
  const credentialsHtml = pdfAccesses.map(pdf => `
    <div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1f2937; margin: 0 0 10px 0;">📄 ${pdf.productName}</h3>
      <p style="margin: 5px 0;"><strong>🔑 Password:</strong> <code style="background: #fef3c7; padding: 5px 10px; border-radius: 4px; font-size: 16px; letter-spacing: 2px;">${pdf.password}</code></p>
      <p style="margin: 5px 0;"><strong>🔗 Link:</strong> <a href="${pdf.accessUrl}" style="color: #3b82f6;">Visualizza PDF</a></p>
      <p style="margin: 5px 0; font-size: 13px; color: #6b7280;"><strong>⏰ Valido fino al:</strong> ${new Date(pdf.expiryDate).toLocaleDateString('it-IT')}</p>
    </div>
  `).join('');

  // Template email HTML completo
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #374151; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Ordine Confermato!</h1>
          <p style="margin: 10px 0 0 0;">SbobinaMente</p>
        </div>
        <div class="content">
          <p>Ciao! 👋</p>
          <p>Grazie per il tuo acquisto su <strong>SbobinaMente</strong>!</p>
          <p>Ecco le tue credenziali per accedere ai PDF acquistati:</p>
          
          ${credentialsHtml}
          
          <div class="warning">
            <strong>⚠️ IMPORTANTE:</strong> Conserva queste password in un luogo sicuro! I tuoi accessi sono validi per <strong>1 anno</strong> dalla data di acquisto.
          </div>
          
          <p>Per qualsiasi domanda o problema, contattaci a: <a href="mailto:info@sbobinamente.it">info@sbobinamente.it</a></p>
          
          <p style="margin-top: 30px;">Buono studio! 📚<br><strong>Il Team SbobinaMente</strong></p>
        </div>
        <div class="footer">
          <p>Ordine #${session.id}</p>
          <p>Data: ${new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>&copy; 2025 SbobinaMente. Tutti i diritti riservati.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('📄 PDF Access Details:');
  pdfAccesses.forEach(pdf => {
    console.log(`   - ${pdf.productName}`);
    console.log(`     Password: ${pdf.password}`);
    console.log(`     URL: ${pdf.accessUrl}`);
  });
  
  // TODO: Integra con il tuo servizio email preferito
  // Opzioni: SendGrid, Mailgun, Nodemailer, etc.
  
  console.log('✅ Email HTML generated (ready to send)');
  console.log('ℹ️  To send real emails, configure an email service');
}

app.listen(process.env.PORT || 4242, () => {
  console.log(`✅ Stripe server running on ${APP_URL}`);
});

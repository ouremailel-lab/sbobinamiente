require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const appUrl = process.env.APP_URL || 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart, total } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Carrello vuoto' });
    }

    // Converti i prodotti in line_items per Stripe
    const line_items = cart.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Appunti PDF',
          description: item.description || 'PDF protetto da SbobinaMente'
        },
        unit_amount: Math.round(parseFloat(item.price) * 100) // Stripe usa centesimi
      },
      quantity: parseInt(item.quantity) || 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line_items,
      success_url: `${appUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout.html?error=cancelled`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const port = process.env.PORT || 4242;
app.listen(port, () => {
  console.log(`✅ Stripe server running on http://localhost:${port}`);
});

require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const app = express();

// Usa la chiave segreta da variabile d'ambiente
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'YOUR_PRICE_ID', // Inserisci l'ID del prezzo Stripe
                quantity: 1,
            }],
            mode: 'payment',
            currency: 'eur',
            success_url: 'https://www.sbobinamente.it/success',
            cancel_url: 'https://www.sbobinamente.it/cancel',
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running'));

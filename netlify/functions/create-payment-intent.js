// Netlify Function per creare Payment Intent Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    // Solo POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { amount, currency, items } = JSON.parse(event.body);
        
        // Crea il Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: JSON.stringify(items)
            }
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret
            })
        };
        
    } catch (error) {
        console.error('Errore Payment Intent:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

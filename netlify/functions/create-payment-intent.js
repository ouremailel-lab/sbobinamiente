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
        // Verifica che la secret key sia disponibile
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY non configurata');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Stripe non è configurato correttamente' })
            };
        }
        
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }
        
        const { amount, currency, items } = body;
        
        if (!amount || amount <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid amount' })
            };
        }
        
        // Crea il Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency || 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: JSON.stringify(items || [])
            }
        });
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret
            })
        };
        
    } catch (error) {
        console.error('Errore Payment Intent:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: error.message || 'Errore durante la creazione del pagamento'
            })
        };
    }
};

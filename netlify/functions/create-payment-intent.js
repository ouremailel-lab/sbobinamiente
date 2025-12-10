// Netlify Function per creare Payment Intent Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY not configured');
}

let stripe;
try {
    stripe = require('stripe')(stripeKey || 'sk_test_missing');
} catch (e) {
    console.error('Stripe module error:', e);
}

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        if (!stripeKey) {
            throw new Error('Stripe secret key not configured');
        }
        
        const body = JSON.parse(event.body || '{}');
        const { amount, currency } = body;
        
        if (!amount || amount <= 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid amount' })
            };
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency || 'eur',
            automatic_payment_methods: { enabled: true }
        });
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
        };
        
    } catch (error) {
        console.error('Payment error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Payment failed' })
        };
    }
};

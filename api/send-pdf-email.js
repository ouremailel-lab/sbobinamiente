// Serverless function to send PDF delivery emails via Resend
// Requires environment variable RESEND_API_KEY set in Vercel project settings

/**
 * Expected POST body: { email, name, title, message }
 */
export default async function handler(req, res) {
    // Basic CORS handling for browser calls
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name, title, message } = req.body || {};

    if (!email || !title || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('Missing RESEND_API_KEY');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    try {
        const htmlContent = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#333;">
<div style="max-width:640px;margin:0 auto;padding:16px;">
  <h2 style="margin-bottom:12px;">${title}</h2>
  <p style="white-space:pre-line;">${message}</p>
  <p style="margin-top:16px;font-size:12px;color:#777;">Questa email è stata inviata da SbobinaMente.</p>
</div>
</body></html>`;

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Mittente temporaneo Resend: sostituire con dominio verificato quando pronto
                from: 'SbobinaMente <onboarding@resend.dev>',
                to: [email],
                subject: title,
                html: htmlContent,
                text: message
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Resend error:', errText);
            return res.status(502).json({ error: 'Email sending failed', details: errText });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, id: data?.id });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal error' });
    }
}
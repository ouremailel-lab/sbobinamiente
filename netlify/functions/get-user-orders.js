// Netlify Function - Recupera ordini utente da Supabase
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Solo GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email da query params
    const { user_email } = event.queryStringParameters || {};

    if (!user_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing user_email parameter' })
      };
    }

    // Query ordini dell'utente
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_email', user_email)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        orders: data 
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

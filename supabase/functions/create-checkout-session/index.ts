import { serve } from "https://deno.land/std@0.221.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL") || "https://sbobinamente.it";

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY mancante" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const cart = Array.isArray(body?.cart) ? body.cart : [];
    const shipping = Number(body?.shipping || 0);
    const customerEmail = body?.customerEmail;

    if (!cart.length) {
      return new Response(JSON.stringify({ error: "Carrello vuoto" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build line items array
    const lineItems = [];
    
    for (const item of cart) {
      const name = item?.name || item?.title || item?.titolo || "Prodotto";
      const rawPrice = item?.price ?? item?.prezzo ?? 0;
      const priceNum = typeof rawPrice === "string"
        ? parseFloat(rawPrice.replace("€", "").replace(",", ".").trim())
        : Number(rawPrice);
      const quantity = Number(item?.quantity || item?.quantita || 1);

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: name,
            description: item?.description || item?.descrizione || "",
            metadata: {
              product_id: String(item?.id || ""),
              type: item?.tipo || item?.type || "digitale"
            }
          },
          unit_amount: Math.round(priceNum * 100),
        },
        quantity: quantity,
      });
    }

    // Add shipping if present
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Spedizione",
            description: "Costi di spedizione per prodotti fisici"
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Check if cart contains physical items
    const hasPhysical = cart.some(item => 
      item?.type === "fisico" || 
      item?.tipo === "fisico" || 
      item?.type === "cartaceo" || 
      item?.tipo === "cartaceo"
    );

    // Build session configuration
    // MODE OPTIONS:
    // - 'payment': One-time payment (current implementation) ✓
    // - 'subscription': Recurring payments (e.g., monthly subscriptions)
    // - 'setup': Save payment method for future use without charging now
    const sessionConfig = {
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`, // ✅ Correct
      cancel_url: `${appUrl}/checkout.html`,

      payment_method_types: ["card", "paypal", "link"],
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      metadata: {
        source: "sbobinamente_web",
        order_type: hasPhysical ? "mixed" : "digital",
        cart_items: JSON.stringify(cart.map(i => ({ id: i.id, qty: i.quantity || 1 })))
      }
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Add shipping address collection for physical items
    if (hasPhysical) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ["IT", "FR", "DE", "ES", "NL", "BE", "AT", "CH"]
      };
    }

    // Create Stripe Checkout Session using direct API call
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || !stripeData?.url) {
      console.error("Stripe error:", stripeData);
      return new Response(JSON.stringify({ error: stripeData?.error?.message || "Stripe error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      url: stripeData.url, // ✅ Stripe Checkout URL
      session_id: stripeData.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

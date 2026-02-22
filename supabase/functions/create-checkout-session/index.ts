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

    if (!cart.length) {
      return new Response(JSON.stringify({ error: "Carrello vuoto" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${appUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${appUrl}/checkout.html`);

    let idx = 0;
    for (const item of cart) {
      const name = item?.name || item?.title || item?.titolo || "Prodotto";
      const rawPrice = item?.price ?? item?.prezzo ?? 0;
      const priceNum = typeof rawPrice === "string"
        ? parseFloat(rawPrice.replace("€", "").replace(",", ".").trim())
        : Number(rawPrice);
      const quantity = Number(item?.quantity || item?.quantita || 1);

      params.append(`line_items[${idx}][price_data][currency]`, "eur");
      params.append(`line_items[${idx}][price_data][product_data][name]`, name);
      params.append(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(priceNum * 100)));
      params.append(`line_items[${idx}][quantity]`, String(quantity));
      idx++;
    }

    if (shipping > 0) {
      params.append(`line_items[${idx}][price_data][currency]`, "eur");
      params.append(`line_items[${idx}][price_data][product_data][name]`, "Spedizione");
      params.append(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(shipping * 100)));
      params.append(`line_items[${idx}][quantity]`, "1");
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok || !stripeData?.url) {
      return new Response(JSON.stringify({ error: stripeData?.error?.message || "Stripe error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: stripeData.url }), {
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

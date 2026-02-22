import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const APP_URL = process.env.APP_URL || "http://localhost:4242";

const toCents = (value) => {
  if (typeof value === "string") {
    const n = parseFloat(value.replace("€", "").replace(",", ".").trim());
    return Math.round((n || 0) * 100);
  }
  if (Number.isInteger(value) && value >= 1000) return value; // già in centesimi
  return Math.round((Number(value) || 0) * 100);
};

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart = [], shipping = 0 } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Carrello vuoto" });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name || item.title || item.titolo || "Prodotto" },
        unit_amount: toCents(item.price ?? item.prezzo ?? 0)
      },
      quantity: Number(item.quantity || item.quantita || 1)
    }));

    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Spedizione" },
          unit_amount: toCents(shipping)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${APP_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(process.env.PORT || 4242, () => {
  console.log(`✅ Stripe server running on ${APP_URL}`);
});

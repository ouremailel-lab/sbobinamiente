import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const allowedOrigins = [
  "https://www.sbobinamente.it",
  "https://sbobinamente.it"
];

function setCors(res, origin) {
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCors(res, origin);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: "Missing Supabase credentials" });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const orderId = body?.orderId;
    const productId = body?.productId;
    const userEmail = body?.email || null;
    const expiryDays = Number(body?.expiryDays || 7);

    if (!orderId || !productId) {
      res.status(400).json({ error: "Missing orderId or productId" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("pdf_access_tokens")
      .insert([
        {
          token,
          order_id: String(orderId),
          product_id: String(productId),
          user_email: userEmail,
          expires_at: expiresAt
        }
      ])
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({
      token: data.token,
      expiresAt: data.expires_at
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

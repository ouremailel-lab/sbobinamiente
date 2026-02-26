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
    const token = body?.token;
    const productId = body?.productId;
    const deviceHash = body?.deviceHash;

    if (!token || !productId || !deviceHash) {
      res.status(400).json({ error: "Missing token, productId or deviceHash" });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("pdf_access_tokens")
      .select("*")
      .eq("token", token)
      .eq("product_id", String(productId))
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data) {
      res.status(404).json({ error: "Token non valido" });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
      res.status(410).json({ error: "Token scaduto" });
      return;
    }

    if (data.device_hash && data.device_hash !== deviceHash) {
      res.status(403).json({ error: "Questo link è già associato a un altro dispositivo" });
      return;
    }

    const updatePayload = {
      last_access_at: now.toISOString(),
      access_count: (data.access_count || 0) + 1
    };

    if (!data.device_hash) {
      updatePayload.device_hash = deviceHash;
      updatePayload.device_locked_at = now.toISOString();
    }

    await supabase
      .from("pdf_access_tokens")
      .update(updatePayload)
      .eq("token", token);

    res.status(200).json({
      ok: true,
      expiresAt: data.expires_at
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

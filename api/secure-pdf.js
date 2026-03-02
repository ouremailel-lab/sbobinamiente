import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const allowedOrigins = [
  "https://www.sbobinamente.it",
  "https://sbobinamente.it"
];

const DEFAULT_BUCKET = "premium-pdfs";
let productPdfMapCache = null;

function setCors(res, origin) {
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizePdfPath(value) {
  return String(value || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/^PDF\//i, "");
}

function loadProductPdfMap() {
  if (productPdfMapCache) {
    return productPdfMapCache;
  }

  const filePath = path.join(process.cwd(), "products-data.js");
  const source = fs.readFileSync(filePath, "utf8");
  const map = {};

  const objectRegex = /\{[\s\S]*?id:\s*(\d+)[\s\S]*?pdfFile:\s*"([^"]+)"[\s\S]*?\}/g;
  let match = objectRegex.exec(source);

  while (match) {
    const [, id, pdfFile] = match;
    map[String(id)] = normalizePdfPath(pdfFile);
    match = objectRegex.exec(source);
  }

  productPdfMapCache = map;
  return map;
}

function generatePassword(sessionId, productId) {
  const seed = `${sessionId}-${productId}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    const code = seed.charCodeAt(index);
    hash = ((hash << 5) - hash) + code;
    hash |= 0;
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  let num = Math.abs(hash);

  for (let index = 0; index < 12; index += 1) {
    password += chars[num % chars.length];
    num = Math.floor(num / chars.length) + (seed.charCodeAt(index % seed.length) || 1);
  }

  return password;
}

async function verifyTokenAccess({ supabase, token, productId, deviceHash }) {
  const { data, error } = await supabase
    .from("pdf_access_tokens")
    .select("token, product_id, expires_at, device_hash, access_count")
    .eq("token", token)
    .eq("product_id", String(productId))
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, message: error.message };
  }

  if (!data) {
    return { ok: false, status: 404, message: "Token non valido" };
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    return { ok: false, status: 410, message: "Token scaduto" };
  }

  if (data.device_hash && deviceHash && data.device_hash !== deviceHash) {
    return {
      ok: false,
      status: 403,
      message: "Questo link è già associato a un altro dispositivo"
    };
  }

  const updatePayload = {
    last_access_at: now.toISOString(),
    access_count: (data.access_count || 0) + 1
  };

  if (!data.device_hash && deviceHash) {
    updatePayload.device_hash = deviceHash;
    updatePayload.device_locked_at = now.toISOString();
  }

  await supabase
    .from("pdf_access_tokens")
    .update(updatePayload)
    .eq("token", token);

  return { ok: true };
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
    const bucketName = process.env.SUPABASE_PDF_BUCKET || DEFAULT_BUCKET;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: "Missing Supabase credentials" });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const token = body?.token;
    const sessionId = body?.sessionId;
    const password = body?.password;
    const deviceHash = body?.deviceHash;
    const productId = String(body?.productId || "").trim();

    if (!productId) {
      res.status(400).json({ error: "Missing productId" });
      return;
    }

    if (!token && !(sessionId && password)) {
      res.status(400).json({ error: "Missing token or session credentials" });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (token) {
      const tokenCheck = await verifyTokenAccess({
        supabase,
        token,
        productId,
        deviceHash
      });

      if (!tokenCheck.ok) {
        res.status(tokenCheck.status).json({ error: tokenCheck.message });
        return;
      }
    } else {
      const expectedPassword = generatePassword(sessionId, productId);
      if (password !== expectedPassword) {
        res.status(403).json({ error: "Credenziali sessione non valide" });
        return;
      }
    }

    const productMap = loadProductPdfMap();
    const mappedPath = normalizePdfPath(productMap[productId]);

    if (!mappedPath) {
      res.status(404).json({ error: "Percorso PDF non trovato per questo prodotto" });
      return;
    }

    let { data, error } = await supabase.storage
      .from(bucketName)
      .download(mappedPath);

    if (error || !data) {
      const fileNameOnly = mappedPath.split("/").pop();
      if (fileNameOnly && fileNameOnly !== mappedPath) {
        const fallbackResult = await supabase.storage
          .from(bucketName)
          .download(fileNameOnly);
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    }

    if (error || !data) {
      res.status(404).json({ error: "PDF non trovato nel bucket privato" });
      return;
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Content-Disposition", "inline; filename=protected.pdf");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
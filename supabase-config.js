// Configurazione Supabase - CREDENZIALI RIMOSSE PER SICUREZZA
// Le operazioni database ora passano attraverso Netlify Functions

// ⚠️ NON USARE PIÙ QUESTO CLIENT PER SCRIVERE DATI
// Usa invece le API functions:
// - POST /.netlify/functions/create-order per creare ordini
// - GET /.netlify/functions/get-user-orders?user_email=xxx per recuperare ordini

// Se serve un client Supabase client-side (SOLO LETTURA), configuralo così:
// const SUPABASE_URL = 'https://kmfjswmlwgglytktynzp.supabase.co';
// const SUPABASE_ANON_KEY = 'la_tua_anon_key'; // Ma configura RLS su Supabase!

// Per ora, tutte le operazioni passano attraverso le Netlify Functions
window.supabaseClient = null; // Disabilitato - usa API

window.supabaseConfig = {
  url: "https://YOUR_PROJECT.supabase.co",
  key: "YOUR_ANON_KEY"
};

window.SUPABASE_URL = window.supabaseConfig.url;
window.supabaseUrl = window.supabaseConfig.url;

console.log("✅ Supabase configurato in modalità sicura (solo backend API)");


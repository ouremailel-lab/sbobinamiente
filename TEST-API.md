# 🧪 TEST API - Netlify Functions

Guida per testare le API backend sicure.

## ✅ Prerequisiti

1. **Netlify deploy attivo**: https://dynamic-strudel-1fd60b.netlify.app/
2. **Variabili d'ambiente configurate** su Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
3. **curl** installato (su Mac: `brew install curl`)

---

## 1️⃣ TEST: Creare un Ordine (POST)

```bash
curl -X POST https://dynamic-strudel-1fd60b.netlify.app/.netlify/functions/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST-001",
    "user_name": "Test User",
    "user_email": "test@example.com",
    "items": [
      {
        "id": 1,
        "title": "Test Product",
        "price": 19.99
      }
    ],
    "total": 19.99,
    "delivery_info": {
      "address": "Via Test 123",
      "city": "Milano"
    },
    "order_date": "2025-12-09T10:00:00Z",
    "status": "pending"
  }'
```

**Risultato atteso:**
```json
{
  "success": true,
  "order": {
    "order_id": "TEST-001",
    "user_email": "test@example.com",
    "total": 19.99,
    ...
  }
}
```

---

## 2️⃣ TEST: Recuperare Ordini Utente (GET)

```bash
curl -X GET "https://dynamic-strudel-1fd60b.netlify.app/.netlify/functions/get-user-orders?user_email=test@example.com" \
  -H "Content-Type: application/json"
```

**Risultato atteso:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": "TEST-001",
      "user_email": "test@example.com",
      ...
    }
  ]
}
```

---

## 3️⃣ TEST: Verificare Errori (Dati Mancanti)

```bash
curl -X POST https://dynamic-strudel-1fd60b.netlify.app/.netlify/functions/create-order \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Risultato atteso:**
```json
{
  "error": "Missing required fields"
}
```
Status: `400`

---

## 4️⃣ TEST: RLS Security (Frontend)

Nel browser, vai a `https://dynamic-strudel-1fd60b.netlify.app/test-order.html`

1. Clicca **"Crea Ordine Test"**
2. Apri **DevTools** (F12 → Console)
3. Vedi il log: `✅ Ordine creato via API: { order_id: ..., ... }`
4. Vai a `/user-area.html` → Dovrebbe mostrare gli ordini creati

---

## 📊 Verifica Supabase RLS

Nel SQL Editor Supabase:

```sql
-- Questo fallisce (anon role bloccato)
set role anon;
select * from orders;

-- Questo funziona (service_role)
reset role;
select * from orders;
```

---

## 🔍 Monitoraggio Netlify

1. Vai su: Netlify Dashboard → dynamic-strudel-1fd60b → Functions
2. Clicca su **create-order** o **get-user-orders**
3. Vedi i logs, gli errori, le durate

---

## ✅ Checklist Finale

- [ ] curl test create-order ritorna success
- [ ] curl test get-user-orders ritorna ordini
- [ ] RLS blocca anon role
- [ ] test-order.html crea ordine con API
- [ ] user-area.html carica ordini
- [ ] Netlify env vars configurate (vedi site settings)
- [ ] Git commit con api-client.js spinto

---

**Domande?** Leggi SECURITY-SETUP.md

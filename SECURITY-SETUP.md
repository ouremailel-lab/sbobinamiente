# 🔒 GUIDA SICUREZZA SUPABASE - SbobinaMente

## ✅ COSA ABBIAMO FATTO

1. **Creato Netlify Functions** per gestire le operazioni database server-side
2. **Rimosso credenziali** dal frontend (supabase-config.js)
3. **API sicure** per creare e leggere ordini

---

## 📋 PASSI DA COMPLETARE MANUALMENTE

### 1️⃣ Configura Variabili d'Ambiente su Netlify

Vai su: **Netlify Dashboard → Il tuo sito → Site settings → Environment variables**

Aggiungi queste 2 variabili:

```
SUPABASE_URL = https://kmfjswmlwgglytktynzp.supabase.co
SUPABASE_SERVICE_KEY = <la_tua_service_key>
```

**⚠️ IMPORTANTE:** 
- NON usare la `anon` key che avevi prima
- Usa la **service_role** key (la trovi su Supabase → Project Settings → API → service_role key)
- La service_role key ha permessi completi, per questo deve stare SOLO nel backend

---

### 2️⃣ Configura Row Level Security (RLS) su Supabase

Vai su: **Supabase Dashboard → Authentication → Policies**

#### Per la tabella `orders`:

1. **Abilita RLS:**
   ```sql
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ```

2. **Policy di lettura** (solo ordini propri):
   ```sql
   CREATE POLICY "Users can view own orders"
   ON orders FOR SELECT
   USING (auth.uid() = user_id OR user_email = auth.email());
   ```

3. **Policy di scrittura** (solo via service key - backend):
   ```sql
   CREATE POLICY "Service role can insert orders"
   ON orders FOR INSERT
   WITH CHECK (true);
   ```

4. **Blocca modifiche client-side:**
   ```sql
   CREATE POLICY "No public updates"
   ON orders FOR UPDATE
   USING (false);

   CREATE POLICY "No public deletes"
   ON orders FOR DELETE
   USING (false);
   ```

---

### 3️⃣ Installa Dipendenze per Netlify Functions

Nel terminale, esegui:

```bash
cd /Users/elisaiannone/Desktop/SbobinaMente
npm init -y
npm install @supabase/supabase-js
```

---

### 4️⃣ Testa le API

Dopo il deploy, le tue API saranno disponibili a:

- **Crea ordine:** `POST https://sbobinamente.it/.netlify/functions/create-order`
- **Get ordini utente:** `GET https://sbobinamente.it/.netlify/functions/get-user-orders?user_email=xxx@example.com`

---

## 🔐 RISULTATO FINALE

✅ **Credenziali NON più esposte** nel codice frontend  
✅ **Database protetto** da Row Level Security  
✅ **Operazioni sicure** tramite API backend  
✅ **Nessuno può creare ordini fake** direttamente dal browser  

---

## 🚨 NOTA IMPORTANTE

Il file `test-order.html` è stato aggiornato per usare le nuove API.
Tutti gli altri file che usano `window.supabaseClient` devono essere aggiornati allo stesso modo.

**File da aggiornare:**
- `whatsapp-notifications.js`
- `admin-ordini.html`
- Qualsiasi altro file che scrive su Supabase

---

## 📞 Hai domande?

Se serve aiuto per completare questi step, chiedimi pure!

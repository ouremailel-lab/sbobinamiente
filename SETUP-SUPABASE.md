# 🚀 Guida Rapida: Setup Supabase per SbobinaMente

## Passo 1: Crea Account Supabase (2 minuti)

1. Vai su **https://supabase.com**
2. Clicca **"Start your project"**
3. Registrati con GitHub o email
4. Clicca **"New Project"**
5. Compila:
   - **Name**: SbobinaMente
   - **Database Password**: scegli una password forte (salvala!)
   - **Region**: Europe (Frankfurt o Milan)
6. Clicca **"Create new project"** e aspetta 1-2 minuti

---

## Passo 2: Crea le Tabelle Database (1 minuto)

1. Nel menu a sinistra, clicca **"SQL Editor"**
2. Clicca **"New Query"**
3. **Apri il file `supabase-schema.sql`** nella cartella del progetto
4. **Copia tutto il contenuto** del file
5. **Incolla** nel SQL Editor di Supabase
6. Clicca **"Run"** (o premi Ctrl+Enter)
7. Dovresti vedere ✓ **Success. No rows returned**

---

## Passo 3: Ottieni le Credenziali (30 secondi)

1. Nel menu a sinistra, clicca **"Project Settings"** (icona ingranaggio)
2. Clicca **"API"**
3. Troverai:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (lunga stringa)
4. **COPIA ENTRAMBE**

---

## Passo 4: Configura il Progetto (30 secondi)

1. **Apri il file `supabase-config.js`** nel progetto
2. Sostituisci:
   ```javascript
   const SUPABASE_URL = 'https://xxxxxx.supabase.co'; // ← Il tuo Project URL
   const SUPABASE_ANON_KEY = 'eyJhbGc...'; // ← La tua anon key
   ```
3. **Salva il file**

---

## Passo 5: Fine! 🎉

Dimmi quando hai finito questi passaggi e attiverò tutto il codice aggiornato!

---

## ⚠️ Note Importanti

- **NON condividere** la service_role key (usa solo anon key)
- La password del database serve solo per connessioni dirette (non nel codice)
- Il piano gratuito include:
  - 500 MB database
  - 1 GB file storage
  - 50.000 utenti attivi al mese
  - Più che sufficiente per iniziare! 🚀

---

## 🆘 Problemi?

Se hai difficoltà in qualche passaggio, dimmi dove sei bloccato!

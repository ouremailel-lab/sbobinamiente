# Configurazione EmailJS per Invio Automatico PDF

## Setup EmailJS Template per Admin Orders

Per far funzionare l'invio automatico dei PDF dalla pagina admin, devi creare un template su EmailJS.

### 1. Accedi a EmailJS
- Vai su: https://dashboard.emailjs.com/
- Login con il tuo account

### 2. Crea un Nuovo Template
- Vai su "Email Templates"
- Clicca "Create New Template"
- Template ID da usare: `template_kk0bj9l` (già configurato nel codice)

### 3. Configura il Template

**⚠️ IMPORTANTE: Configurazione Campo "To email"**

Nel campo "To email" di EmailJS, inserisci **SOLO**:
```
{{to_email}}
```

**NON** inserire doppie graffe come `{{{{to_email}}}}` - questo causa l'errore "recipients address is corrupted".

**Subject (Oggetto):**
```
🎉 I tuoi PDF sono pronti! - Ordine #{{order_id}}
```

**Body (Corpo Email):**
```html
<p>Ciao {{to_name}}, Grazie per il tuo acquisto! 🎉 Il tuo pagamento &egrave; stato confermato e i tuoi PDF sono pronti per essere scaricati.&nbsp;</p>
<p>&nbsp;📦 DETTAGLI ORDINE</p>
<p>&nbsp;🆔 Ordine: #{{order_id}}</p>
<p>&nbsp;📅 Data: {{order_date}}</p>
<p>💰 Totale: {{total}}&euro;</p>
<p>&nbsp;📄 ACCESSO AI TUOI PDF &nbsp;{{pdf_list}}</p>
<p>&nbsp;⚠️ IMPORTANTE&nbsp; ✅ Conserva queste password in un luogo sicuro. I tuoi accessi sono validi per 1 anno. Per qualsiasi problema, contattaci a: ouremailel@gmail.com</p>
<p>Buono studio!</p>
<p>&nbsp;</p>
<p>📚 Team SbobinaMente</p>
```

### 4. Variabili del Template

Assicurati che il template accetti queste variabili:

- `{{to_email}}` - Email destinatario
- `{{to_name}}` - Nome destinatario
- `{{order_id}}` - ID ordine
- `{{order_date}}` - Data ordine
- `{{total}}` - Totale ordine
- `{{pdf_list}}` - Lista PDF con password e link

### 5. Test del Template

1. Clicca su "Test it" nel template
2. Inserisci dati di esempio:
   ```json
   {
     "to_email": "tua-email@example.com",
     "to_name": "Mario Rossi",
     "order_id": "ORD-123456789",
     "order_date": "25/02/2026",
     "total": "15.00",
     "pdf_list": "Appunti Diritto Costituzionale\n🔑 Password: ABC123XYZ456\n🔗 Link: https://www.sbobinamente.it/viewer-pdf.html?session=123&product=1&pwd=ABC123\n⏰ Valido fino al: 25/02/2027"
   }
   ```
3. Clicca "Send Test Email"
4. Verifica di aver ricevuto l'email

### 6. Service ID

Il Service ID è già configurato: `service_wfwk0hv`

Se vuoi cambiarlo:
1. Vai su "Email Services" su EmailJS
2. Copia il Service ID
3. Aggiorna in `admin-orders.html` la riga:
   ```javascript
   'service_wfwk0hv',  // <-- Sostituisci con il tuo Service ID
   ```

### 7. Public Key

La Public Key è già configurata: `Bo-Kyor5W-Q_BRDf3`

Se vuoi cambiarla:
1. Vai su "Account" > "General"
2. Copia la Public Key
3. Aggiorna in `admin-orders.html` la riga:
   ```javascript
   emailjs.init('Bo-Kyor5W-Q_BRDf3');  // <-- Sostituisci con la tua Public Key
   ```

### 8. Password Admin

⚠️ **IMPORTANTE: Cambia la password admin!**

Nel file `admin-orders.html`, cerca questa riga:

```javascript
const ADMIN_PASSWORD = 'admin123'; // ⚠️ CAMBIA QUESTA PASSWORD!
```

E sostituisci `admin123` con una password sicura.

## Come Usare il Sistema

### Flusso Completo

1. **Cliente completa checkout** su `checkout-bonifico.html`
   - Inserisce i dati di spedizione
   - Sceglie metodo pagamento (Bonifico/PayPal/Revolut)
   - L'ordine viene salvato in `localStorage.pendingOrders`

2. **Tu ricevi notifica** (opzionale, da implementare)
   - Email con dati ordine

3. **Verifichi il pagamento** sul tuo conto bancario/PayPal/Revolut

4. **Accedi alla pagina admin**
   - Vai su: `https://www.sbobinamente.it/admin-orders.html`
   - Inserisci password admin
   - Vedi tutti gli ordini "In Attesa"

5. **Confermi il pagamento**
   - Clicca "✅ Conferma Pagamento e Invia PDF"
   - Il sistema:
     - Genera automaticamente le password per i PDF
     - Invia email al cliente con link e password
     - Marca l'ordine come "Confermato"

### Note Importanti

- ✅ Le password sono generate automaticamente (stesso algoritmo di `success.html`)
- ✅ Ogni PDF ha una password unica basata su `sessionId + productId`
- ✅ Le password sono deterministiche (sempre uguali per lo stesso ordine)
- ✅ Il sistema funziona anche offline (usa localStorage)
- ⚠️ Per prodotti fisici (cartacei), non vengono inviati PDF
- ⚠️ Solo i prodotti digitali ricevono email con credenziali

### Backup degli Ordini

Gli ordini sono salvati in `localStorage.pendingOrders`. Per esportarli:

1. Apri Console del browser (F12)
2. Esegui:
   ```javascript
   console.log(JSON.stringify(JSON.parse(localStorage.getItem('pendingOrders')), null, 2));
   ```
3. Copia il JSON e salvalo in un file `.json`

### Integrare con Supabase (Opzionale)

Se vuoi salvare gli ordini anche su Supabase:

1. Nel file `checkout-bonifico.html`, dopo il salvataggio in localStorage, aggiungi:
   ```javascript
   // Salva anche su Supabase
   if (window.API && window.API.createOrder) {
       await window.API.createOrder(order);
   }
   ```

2. Nel file `admin-orders.html`, nella funzione `loadOrders()`, aggiungi:
   ```javascript
   // Carica anche da Supabase
   const { data: supabaseOrders } = await supabase
       .from('orders')
       .select('*')
       .order('created_at', { ascending: false });
   ```

## Risoluzione Problemi

### Email non inviata
- Verifica Service ID e Template ID su EmailJS
- Controlla console del browser per errori
- Verifica che il piano EmailJS non sia scaduto (200 email/mese gratis)

### Password non corretta
- Le password sono generate con lo stesso algoritmo di `success.html`
- Sono deterministiche: stesso `sessionId + productId` = stessa password

### Ordini non visualizzati
- Controlla `localStorage.pendingOrders` nella console
- Verifica che il checkout salvi correttamente l'ordine

## TODO Future Implementazioni

- [ ] Notifica email automatica all'admin quando arriva nuovo ordine
- [ ] Integrazione Supabase per backup cloud degli ordini
- [ ] Sistema di tracking spedizioni per prodotti fisici
- [ ] Dashboard statistiche vendite
- [ ] Esportazione ordini in CSV/Excel

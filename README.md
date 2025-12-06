# Developer Notes

This project integrates email sending via Formspree and EmailJS for transactional messages.

Note: requests mentioning enabling AI models (e.g., "Enable Raptor mini (Preview) for all clients") are not applicable to this repository — this is a static frontend project. To enable a model across clients you would normally change settings in your platform/hosting or in a backend service that dispatches model selection.

If you intended to enable a model flag in a backend config file, provide the config location and I can update it.
# SbobinaMente - E-Commerce di Appunti e PDF Protetti

Un e-commerce minimalista e moderno per la vendita di:
- 📄 **PDF Protetti** - Appunti digitali con password (accesso dopo acquisto)
- 📕 **Appunti Stampati** - Rilegati professionalmente con spedizione

## 🎨 Caratteristiche

✅ **Design Minimalista** - Colori pastello blu e verde  
✅ **Catalogo Prodotti** - Con filtri per tipo, materia e prezzo  
✅ **Carrello della Spesa** - Gestione quantità e rimozione articoli  
✅ **Sistema di Autenticazione** - Registrazione con verifica email (simulata)  
✅ **Checkout Completo** - Integrazione PayPal (simulata)  
✅ **Credenziali PDF** - Generazione automatica di password dopo l'acquisto  
✅ **Storage Locale** - Persistenza dati con localStorage  
✅ **Responsive Design** - Funziona su desktop, tablet e mobile  

## 📁 Struttura File

```
SbobinaMente/
├── index.html          # Pagina principale con struttura HTML
├── styles.css          # Stili CSS con design minimalista
├── app.js              # Logica JavaScript dell'applicazione
├── products-data.js    # Dati dei prodotti
└── README.md           # Questo file
```

## 🚀 Come Avviare

1. **Apri il file `index.html` in un browser**
   ```bash
   open index.html
   # oppure vai su File > Open in qualsiasi browser
   ```

2. **Oppure usa un server locale (consigliato)**
   ```bash
   # Con Python 3
   python3 -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Poi apri: http://localhost:8000
   ```

## 💳 Come Testare l'Applicazione

### 📦 Browsing Prodotti
1. Scorri la home page
2. Usa i filtri per cercare per tipo (PDF/Stampato), materia o prezzo
3. Clicca su "Dettagli" per vedere più informazioni

### 🛒 Aggiungere al Carrello
1. Clicca su "Dettagli" di un prodotto
2. Seleziona la quantità
3. Clicca "Aggiungi al Carrello"
4. Visualizza il carrello dal link in alto

### 👤 Registrazione e Login
1. Clicca su "Accedi" in alto a destra
2. Seleziona "Registrati"
3. Compila il form con:
   - Nome Completo
   - Email
   - Password (2 volte)
4. Al registrarsi, l'account viene automaticamente verificato (simulato)
5. Accedi con le tue credenziali

### 💰 Checkout e Pagamento
1. Vai al carrello
2. Clicca "Procedi al Pagamento"
3. Compila i dati di spedizione (per prodotti fisici)
4. Clicca "Paga con PayPal"
5. Riceverai:
   - Numero di ordine
   - Per PDF: credenziali di accesso (password)
   - Conferma spedizione (per articoli stampati)

## 🔐 Accesso PDF Protetti

Dopo l'acquisto di un PDF:
- Riceverai una **password univoca**
- Avrai accesso illimitato per **1 anno**
- Puoi scaricare e visualizzare il PDF in qualsiasi momento

## 📊 Dati di Test

### Prodotti Disponibili
- Matematica (Analisi, Geometria)
- Storia (Medievale, Letteratura, Diritto)
- Lingue (Francese, Inglese)
- Scienze (Biologia, Chimica)

### Prezzi
- PDF Protetti: **7,99€ - 12,99€**
- Appunti Stampati: **22,99€ - 29,99€**

## 💾 Dati Salvati Localmente

L'app utilizza `localStorage` per memorizzare:
- **cart** - Articoli nel carrello
- **users** - Utenti registrati
- **currentUser** - Utente attualmente loggato
- **orders** - Cronologia ordini
- **myDigitalsAccess** - Accessi ai PDF protetti

Per pulire i dati, apri la console del browser:
```javascript
localStorage.clear()
```

## 🔌 Integrazioni Consigliate per la Produzione

### Backend
- Node.js + Express (server)
- MongoDB o PostgreSQL (database)
- JWT per autenticazione

### Pagamenti
- **Stripe API** o **PayPal Commerce Platform** (real)
- Webhooks per conferma pagamenti

### Email
- SendGrid o Mailgun (verifica email reale)
- Template email HTML

### PDF
- PDFKit (generazione PDF)
- PDFjs (visualizzazione protetta)
- Encrypt PDF con password

### Hosting
- Vercel, Netlify (frontend)
- Heroku, Railway (backend)
- AWS S3 (storage PDF)

## 🎯 Customizzazione

### Cambiare i Colori
Modifica le variabili CSS in `styles.css`:
```css
:root {
    --primary-blue: #b3d9e8;
    --primary-green: #b8d4c8;
    --accent-dark: #4a6fa5;
}
```

### Aggiungere Prodotti
Modifica l'array `products` in `products-data.js`:
```javascript
{
    id: 11,
    title: "Nuovo Prodotto",
    materia: "matematica",
    tipo: "digitale",
    prezzo: 9.99,
    emoji: "📐",
    descrizione: "...",
    dettagli: "...",
    pages: 100
}
```

### Cambiare Email di Contatto
Modifica nel footer di `index.html`:
```html
<a href="mailto:tua-email@example.com">tua-email@example.com</a>
```

## ⚠️ Note Importanti

- **Simulato**: Pagamenti PayPal, verifica email, spedizione
- **Locale**: Dati salvati nel browser (perduti se cache cancellata)
- **Non sicuro per produzione**: Password memorizzate in plaintext
- **GDPR**: In produzione, implementa privacy policy e gestione dati

## 📱 Browser Supportati

✅ Chrome/Edge 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Supporto Sviluppo

Per qualsiasi domanda o issue, contatta lo sviluppatore.

---

**Versione**: 1.0.0  
**Data**: Dicembre 2025  
**Licenza**: MIT

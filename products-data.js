// Dati dei prodotti
const products = [
    {
        id: 1,
        title: "Infortuni sul Lavoro e Malattia Professionale",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 20.00,
        emoji: "📄",
        descrizione: "Guida completa su infortuni e malattie professionali",
        dettagli: "PDF protetto da password. Download immediato dopo l'acquisto.",
        pages: 45,
        pdfFile: "01-infortuni-sul-lavoro.pdf"
    },
    {
        id: 2,
        title: "Invalidità e Inabilità - Appunti Stampati",
        materia: "diritto",
        tipo: "fisico",
        prezzo: 25.00,
        emoji: "📕",
        descrizione: "Appunti stampati e rilegati professionalmente",
        dettagli: "Formato A4, rilega a spirale, 50 pagine a colori. Spedizione inclusa.",
        pages: 50,
        pdfFile: "02-invalidita-inabilita.pdf",
        previewImage: "image/copia_cartacea.png",
        previewPages: [
            "image/previews/invalidita-1.png",
            "image/previews/invalidita-2.png",
            "image/previews/invalidita-3.png"
        ]
    },
    {
        id: 3,
        title: "Pensione - Guida Completa PDF",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 20.00,
        emoji: "📋",
        descrizione: "Tutto sulla pensione e i diritti dei pensionati",
        dettagli: "PDF protetto con guide passo-passo e calcoli pensionistici.",
        pages: 38,
        pdfFile: "03-pensione.pdf"
    },
    {
        id: 4,
        title: "Invalidità e Inabilità - PDF Protetto",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 20.00,
        emoji: "📄",
        descrizione: "Guida completa su invalidità e inabilità",
        dettagli: "PDF protetto con esempi e modulistica. Download immediato.",
        pages: 42,
        pdfFile: "02-invalidita-inabilita.pdf"
    },
    {
        id: 5,
        title: "Disoccupazione - PDF Protetto",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 20.00,
        emoji: "📜",
        descrizione: "Guida sulla disoccupazione e ammortizzatori sociali",
        dettagli: "PDF con istruzioni su sussidi e prestazioni sociali.",
        pages: 35,
        pdfFile: "04-disoccupazione.pdf"
    },
    {
        id: 6,
        title: "Diritto del Lavoro - Appunti Stampati",
        materia: "diritto",
        tipo: "fisico",
        prezzo: 25.00,
        emoji: "📘",
        descrizione: "Appunti completi di diritto del lavoro",
        dettagli: "Rilega premium, 150 pagine a colori con schemi e tabelle. Spedizione inclusa.",
        pages: 150,
        previewImage: "image/copia_cartacea.png",
        previewPages: [
            "image/infortunio sul lavoro.png"
        ]
    },
    // Prodotti Universitari - Scienze dei Servizi Giuridici
    {
        id: 103,
        title: "Diritto Costituzionale - 1° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 9.99,
        emoji: "📄",
        descrizione: "Appunti completi di Diritto Costituzionale",
        dettagli: "PDF protetto con schemi, sentenze e casi pratici. Download immediato.",
        pages: 60,
        pdfFile: "cost-primo-anno.pdf",
        previewImage: "image/DIRITTO COSTITUZIONALE.png",
        previewPages: [
            "image/previews/cost-1.png",
            "image/previews/cost-2.png",
            "image/previews/cost-3.png"
        ],
        categoria: "universita",
        corso: "sdsg",
        anno: 1
    },
    {
        id: 104,
        title: "Diritto Costituzionale - 1° Anno - Appunti Stampati",
        materia: "diritto",
        tipo: "fisico",
        prezzo: 22.00,
        emoji: "📕",
        descrizione: "Appunti di Diritto Costituzionale stampati e rilegati",
        dettagli: "Formato A4, rilegatura a spirale, stampa a colori. Spedizione inclusa.",
        pages: 60,
        pdfFile: "cost-primo-anno.pdf",
        previewImage: "image/DIRITTO COSTITUZIONALE.png",
        previewPages: [
            "image/previews/cost-1.png",
            "image/previews/cost-2.png",
            "image/previews/cost-3.png",
            "image/previews/cost-4.png"
        ],
        categoria: "universita",
        corso: "sdsg",
        anno: 1
    },
    {
        id: 200,
        title: "Diritto Privato - 2° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 15.00,
        emoji: "📘",
        descrizione: "Appunti completi di Diritto Privato per il secondo anno",
        dettagli: "PDF protetto con sentenze e casi pratici. Download immediato.",
        pages: 40,
        pdfFile: "SECONDO ANNO/DIRITTO PRIVATO 2.pdf",
        previewImage: "image/DIRITTO PRIVATO II.png",
        previewImages: [
            "image/previews/anteprimadirittoprivato.png",
            "image/previews/anteprimadirittoprivato2.png",
            "image/previews/anteprimadirittoprivato3.png"
        ],
        categoria: "universita",
        corso: "sdsg",
        anno: 2
    },
    {
        id: 200.5,
        title: "Diritto Privato - 2° Anno - Appunti Stampati",
        materia: "diritto",
        tipo: "fisico",
        prezzo: 30.00,
        emoji: "📗",
        descrizione: "Appunti di Diritto Privato stampati e rilegati",
        dettagli: "Formato A4, rilegatura a spirale, stampa a colori. Spedizione inclusa.",
        pages: 40,
        pdfFile: "SECONDO ANNO/DIRITTO PRIVATO 2.pdf",
        previewImage: "image/DIRITTO PRIVATO II.png",
        previewImages: [
            "image/previews/anteprimadirittoprivato.png",
            "image/previews/anteprimadirittoprivato2.png",
            "image/previews/anteprimadirittoprivato3.png"
        ],
        categoria: "universita",
        corso: "sdsg",
        anno: 2
    },
    {
        id: 301,
        title: "Infortuni sul Lavoro - 3° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 22.00,
        emoji: "📄",
        descrizione: "Guida su infortuni e malattie professionali",
        dettagli: "PDF protetto con schemi e casi pratici.",
        pages: 45,
        pdfFile: "01-infortuni-sul-lavoro.pdf",
        categoria: "universita",
        corso: "sdsg",
        anno: 3
    },
    {
        id: 302,
        title: "Invalidità e Inabilità - 3° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 22.00,
        emoji: "📄",
        descrizione: "Guida su invalidità e inabilità",
        dettagli: "PDF protetto con esempi e modulistica.",
        pages: 42,
        pdfFile: "02-invalidita-inabilita.pdf",
        categoria: "universita",
        corso: "sdsg",
        anno: 3
    },
    {
        id: 303,
        title: "Pensione - 3° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 22.00,
        emoji: "📄",
        descrizione: "Guida completa sulla pensione",
        dettagli: "PDF protetto con calcoli pensionistici.",
        pages: 38,
        pdfFile: "03-pensione.pdf",
        categoria: "universita",
        corso: "sdsg",
        anno: 3
    },
    {
        id: 304,
        title: "Disoccupazione - 3° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 22.00,
        emoji: "📜",
        descrizione: "Guida sulla disoccupazione",
        dettagli: "PDF con sussidi e ammortizzatori sociali.",
        pages: 35,
        pdfFile: "04-disoccupazione.pdf",
        categoria: "universita",
        corso: "sdsg",
        anno: 3
    },
    // Prodotti Universitari - Giurisprudenza
    {
        id: 401,
        title: "Procedura Civile Parte Prima - 4° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 35.00,
        emoji: "📄",
        descrizione: "194 pagine di appunti presi dalle lezioni di B. Gambineri UNIFI 2026. Un percorso completo sulla magistratura e sulla funzione giurisdizionale, che chiarisce cos’è la giurisdizione, come è composta la magistratura ordinaria e civile, e come si articolano i diversi organi giudiziari. Approfondiscono il processo civile, la struttura dei gradi di giudizio, le differenze tra appello e ricorso per Cassazione, con spiegazioni sistematiche, schemi riepilogativi e riferimenti normativi utili allo studio e al ripasso.https://www.sbobinamente.it/pdf-universita-giurisprudenza-4anno.html",
        dettagli: "Il presente lavoro offre un'analisi sistematica del processo civile, muovendo dalle coordinate costituzionali e ordinamentali della funzione giurisdizionale fino alla disciplina delle prove e dei mezzi di tutela. La prima parte è dedicata alla magistratura e alla funzione giurisdizionale, con particolare attenzione alla composizione dell'ordine giudiziario, alle garanzie costituzionali di indipendenza, al ruolo del Consiglio Superiore della Magistratura e alle modifiche introdotte dalla Riforma Cartabia. Viene ricostruito il quadro della giurisdizione civile, chiarendo la differenza tra appello e ricorso per Cassazione e illustrando la struttura degli organi giudicanti. Segue un inquadramento generale del Codice di procedura civile, con l'analisi della sua struttura interna e delle esigenze di tutela che ne giustificano l'impianto, inclusi i procedimenti speciali e le forme di tutela anticipatoria. Una parte centrale è dedicata all'oggetto del processo e ai limiti oggettivi e temporali del giudicato, con approfondimenti su temi particolarmente delicati quali la frazionabilità dei crediti, il giudicato di rigetto e la stabilità delle decisioni. Ampio spazio è riservato ai processi a cognizione piena, al rito ordinario e al procedimento semplificato di cognizione, con un esame dettagliato della fase introduttiva, delle verifiche preliminari ex art. 171-bis c.p.c., delle memorie integrative ex art. 171-ter, delle ordinanze e delle sentenze. Vengono analizzati i modelli decisori, la rimessione in decisione, le sentenze non definitive e i problemi di coordinamento legislativo emersi a seguito delle recenti riforme. Un focus specifico è dedicato alla modifica della domanda, alla distinzione tra mutatio ed emendatio libelli e agli orientamenti delle Sezioni Unite, nonché al processo del lavoro, con l'esame del sistema delle preclusioni rigide e delle peculiarità del rito. La trattazione delle forme di tutela giurisdizionale comprende la tutela di mero accertamento, la tutela di condanna nelle sue diverse tipologie, le misure coercitive indirette e la tutela costitutiva. In questo ambito vengono ricostruiti i modelli generali di produzione degli effetti giuridici, il diritto potestativo semplice, il diritto potestativo a necessario esercizio giudiziale, l'oggetto del processo nelle azioni costitutive e il dibattito dottrinale in materia di impugnativa negoziale. Un capitolo autonomo è dedicato ai principi fondamentali del processo civile, tra cui il principio della domanda, il principio di allegazione, il principio di corrispondenza tra chiesto e pronunciato, il contraddittorio e la ragionevole durata del processo, nonché alla disciplina dell'estinzione del processo e ai suoi effetti. La parte finale affronta in modo organico la teoria e la disciplina delle prove nel processo civile: onere della prova, presunzioni, principio di non contestazione, disponibilità e acquisizione delle prove, valutazione probatoria, nesso di causalità, prova testimoniale, confessione, prove documentali, giuramento, prove atipiche e circolazione probatoria. Vengono esaminati inoltre gli strumenti istruttori quali ordine di esibizione, ispezione e consulenza tecnica d'ufficio, con riferimento agli orientamenti più recenti della giurisprudenza di legittimità. L'ultima parte del lavoro è dedicata ai requisiti di forma e contenuto degli atti processuali, alla nullità, alla rinnovazione degli atti, ai termini processuali, alla disciplina dell'atto di citazione e ai suoi effetti sostanziali e processuali, nonché ai criteri di legittimazione del giudice, alla giurisdizione, alla competenza e al regolamento di competenza. Nel complesso, il testo si propone di offrire una ricostruzione sistematica e problematica del processo civile, attenta sia al dato normativo sia alle principali elaborazioni dottrinali e giurisprudenziali, con particolare riguardo agli effetti delle recenti riforme e ai nodi interpretativi ancora aperti.",
        pages: 0,
        pdfFile: "QUARTO ANNO/Procedura Civile parte uno.pdf",
        previewImage: "image/proceduracivile2.png",
        previewPages: [
            "image/ANTEPRIMA PROCEDURA PARTE 1.png",
            "image/4.png",
            "image/5.png",
            "image/6.png",
            "image/7.png",
            "image/8.png",
            "image/9.png",
            "image/10.png",
            "image/anteprima 1.png",
            "image/anteprima 2.png",
            "image/anteprima 3.png",
            "image/ANTEPRIMA PROCEDURA CIVILE 2.png",
            "image/ANTEPRIMA PROCEDURA CIVILE3.png"
        ],
        categoria: "universita",
        corso: "giurisprudenza",
        anno: 4
    }
];

// Filtra prodotti per categoria e anno
function getProductsByCategory(categoria, corso = null, anno = null) {
    return products.filter(p => {
        if (categoria && p.categoria !== categoria) return false;
        if (corso && p.corso !== corso) return false;
        if (anno && p.anno !== anno) return false;
        return true;
    });
}

// Funzione per aggiungere al carrello (usata dalle pagine universitarie)
function addToCartFromPage(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Prodotto non trovato');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Aggiorna il contatore se presente
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    alert(`✅ "${product.title}" aggiunto al carrello!`);
}

// Funzione per aggiungere rapido allo zaino (1 copia senza dialogo)
function addToCartQuickFromPage(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Prodotto non trovato');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Aggiorna il contatore se presente
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    // Notifica discreta senza alert
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f5a6c9; color: white; padding: 12px 16px; border-radius: 6px; font-weight: 600; z-index: 1000; animation: slideIn 0.3s ease;';
    notification.innerHTML = `✅ "${product.title}" aggiunto allo zaino!`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Funzione per aggiungere rapido allo zaino (1 copia senza dialogo)
function addToCartQuickFromPage(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Prodotto non trovato');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Aggiorna il contatore se presente
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    // Notifica discreta senza alert
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f5a6c9; color: white; padding: 12px 16px; border-radius: 6px; font-weight: 600; z-index: 1000; animation: slideIn 0.3s ease;';
    notification.innerHTML = `✅ "${product.title}" aggiunto allo zaino!`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Esponi la variabile prodotti come globale per l'accesso dal viewer
window.productsData = products;

// Mostra modal con dettagli del prodotto per PDF
function showProductDetailModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Crea o trova il modal
    let modal = document.getElementById('product-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-detail-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; display: none;';
        document.body.appendChild(modal);
    }

    // Popola il contenuto
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div style="font-size: 32px;">${product.emoji}</div>
                <button onclick="document.getElementById('product-detail-modal').style.display='none'" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
            </div>
            
            <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px;">${product.title}</h2>
            
            <div style="display: flex; gap: 12px; margin-bottom: 16px; font-size: 13px; color: #64748b;">
                <span>📄 ${product.pages} pagine</span>
                <span>•</span>
                <span>PDF protetto</span>
            </div>
            
            <div style="background: #f8fafc; border-left: 4px solid #4a90e2; padding: 12px; margin-bottom: 16px; border-radius: 6px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">${product.descrizione}</p>
            </div>
            
            ${product.dettagli ? `<div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin-bottom: 16px; border-radius: 6px;">
                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;"><strong>ℹ️ Dettagli:</strong> ${product.dettagli}</p>
            </div>` : ''}
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;"><strong>💰 Prezzo:</strong> €${product.prezzo.toFixed(2)}</p>
            </div>
            
            <button onclick="addToCartQuickFromPage(${product.id}); document.getElementById('product-detail-modal').style.display='none';" style="width: 100%; padding: 12px 16px; background: #f5a6c9; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; margin-top: 16px;">
                🎒 Aggiungi allo Zaino
            </button>
        </div>
    `;

    modal.style.display = 'flex';

    // Chiudi il modal cliccando lo sfondo
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

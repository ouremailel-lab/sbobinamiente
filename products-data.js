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
        previewImage: "image/copia_cartacea.png",
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
        id: 201,
        title: "Pensione - 2° Anno",
        materia: "diritto",
        tipo: "digitale",
        prezzo: 20.00,
        emoji: "📄",
        descrizione: "Tutto sulla pensione e i diritti dei pensionati",
        dettagli: "PDF protetto con guide passo-passo e calcoli pensionistici.",
        pages: 38,
        pdfFile: "03-pensione.pdf",
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

// Esponi la variabile prodotti come globale per l'accesso dal viewer
window.productsData = products;
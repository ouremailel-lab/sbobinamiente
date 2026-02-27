// ==================== GESTIONE RECENSIONI ====================

// Dati di esempio - Recensioni Italiane
const sampleReviews = [
    {
        name: "Marco Rossi",
        age: 22,
        faculty: "Giurisprudenza",
        product: "Diritto Privato I anno",
        rating: 5,
        text: "Appunti chiarissimi e ben organizzati. Ho passato l'esame con 28, grazie a questi materiali. Complimenti!"
    },
    {
        name: "Giulia Bianchi",
        age: 21,
        faculty: "Medicina",
        product: "Anatomia I anno",
        rating: 5,
        text: "Finalmente appunti che spiegano davvero bene l'anatomia. Le illustrazioni sono perfette per lo studio."
    },
    {
        name: "Federico Conti",
        age: 20,
        faculty: "Ingegneria Civile",
        product: "Analisi Matematica I",
        rating: 4,
        text: "Buona qualità, esercizi pratici molto utili. Un po' dense alcune pagine ma nel complesso eccellenti."
    },
    {
        name: "Sofia Ferretti",
        age: 23,
        faculty: "Economia Aziendale",
        product: "Contabilità Generale",
        rating: 5,
        text: "Consiglio vivamente! Appunti completi e facili da seguire. La professoressa di economia mia ha apprezzato moltissimo."
    },
    {
        name: "Antonio Moretti",
        age: 21,
        faculty: "Informatica",
        product: "Programmazione C++",
        rating: 4,
        text: "Bene spiegato, buoni esempi di codice. Avrei voluto più esercizi svolti ma nel complesso è ottimo."
    },
    {
        name: "Laura Guccione",
        age: 22,
        faculty: "Psicologia",
        product: "Psicologia Generale",
        rating: 5,
        text: "Appunti completi e ben strutturati. Mi hanno aiutato a capire i concetti difficili. Grazie!"
    }
];

// Carica le recensioni dal localStorage o usa quelle di esempio
function loadReviews() {
    const stored = localStorage.getItem('sbobinamente_reviews');
    if (stored) {
        return JSON.parse(stored);
    }
    return sampleReviews;
}

// Salva le recensioni nel localStorage
function saveReviews(reviews) {
    localStorage.setItem('sbobinamente_reviews', JSON.stringify(reviews));
}

// Renderizza una singola recensione
function renderReview(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    return `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <div class="review-author">${escapeHtml(review.name)}</div>
                    <div class="review-meta">${review.age} anni • ${escapeHtml(review.faculty)}</div>
                </div>
                <div class="review-rating">${stars}</div>
            </div>
            ${review.text ? `<p class="review-text">"${escapeHtml(review.text)}"</p>` : ''}
            <div class="review-product">📚 ${escapeHtml(review.product)}</div>
        </div>
    `;
}

// Renderizza tutte le recensioni
function renderAllReviews() {
    const reviews = loadReviews();
    const grid = document.getElementById('reviewsGrid');
    
    if (!grid) return;
    
    grid.innerHTML = reviews.map(review => renderReview(review)).join('');
}

// Gestisce l'invio del form
function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    // Gestione rating con stelle
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('reviewRating');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.value;
            ratingInput.value = rating;

            // Aggiorna le stelle visive
            stars.forEach(s => {
                if (s.dataset.value <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        // Effetto hover
        star.addEventListener('mouseover', function() {
            const hoverRating = this.dataset.value;
            stars.forEach(s => {
                if (s.dataset.value <= hoverRating) {
                    s.style.color = '#f59e0b';
                } else {
                    s.style.color = '#cbd5e1';
                }
            });
        });
    });

    stars.forEach(star => {
        star.addEventListener('mouseout', function() {
            const currentRating = ratingInput.value;
            stars.forEach(s => {
                if (s.dataset.value <= currentRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Gestione invio form
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validazione rating
        if (!ratingInput.value || ratingInput.value == 0) {
            alert('Per favore seleziona un voto!');
            return;
        }

        // Raccolta dati
        const newReview = {
            name: document.getElementById('reviewName').value,
            age: parseInt(document.getElementById('reviewAge').value),
            faculty: document.getElementById('reviewFaculty').value,
            product: document.getElementById('reviewProduct').value,
            rating: parseInt(ratingInput.value),
            text: document.getElementById('reviewText').value || null
        };

        // Salva la nuova recensione
        const reviews = loadReviews();
        reviews.unshift(newReview); // Aggiungi all'inizio
        saveReviews(reviews);

        // Reset form e stelle
        form.reset();
        ratingInput.value = 0;
        stars.forEach(s => s.classList.remove('active'));

        // Ricarica le recensioni
        renderAllReviews();

        // Messaggio di successo
        alert('Grazie per la tua recensione! ⭐');

        // Scroll alla sezione recensioni
        document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
    });
}

// Funzione per escapare HTML (prevenire XSS)
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    renderAllReviews();
    initReviewForm();
});

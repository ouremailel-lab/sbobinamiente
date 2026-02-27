// ==================== GESTIONE RECENSIONI ====================

// Dati di esempio - Recensioni Italiane
const sampleReviews = [
    {
        name: "Marco",
        age: 22,
        faculty: "Giurisprudenza",
        product: "Diritto Privato - 2° Anno",
        rating: 5,
        text: "Appunti chiarissimi e ben organizzati. Ho passato l'esame con 28, grazie a questi materiali. Complimenti!"
    },
    {
        name: "Giulia",
        age: 21,
        faculty: "Scienze dei Servizi Giuridici",
        product: "Diritto Costituzionale - 1° Anno",
        rating: 5,
        text: "Finalmente materiale che spiega bene gli articoli della costituzione. Perfetto per preparare l'esame."
    },
    {
        name: "Federico",
        age: 20,
        faculty: "Giurisprudenza",
        product: "Infortuni sul Lavoro - 3° Anno",
        rating: 4,
        text: "Buona qualità, appunti ben strutturati con schemi pratici. Molto utile per capire la materia."
    },
    {
        name: "Sofia",
        age: 23,
        faculty: "Scienze dei Servizi Giuridici",
        product: "Invalidità e Inabilità - 3° Anno",
        rating: 5,
        text: "Consiglio vivamente! Appunti completi e facili da seguire. Ho capito finalmente le distinzioni fondamentali."
    },
    {
        name: "Antonio",
        age: 21,
        faculty: "Giurisprudenza",
        product: "Pensione - 3° Anno",
        rating: 4,
        text: "Bene spiegato, con calcoli pratici e esempi reali. Avrei voluto più esercizi svolti ma nel complesso è ottimo."
    },
    {
        name: "Silvia",
        age: 22,
        faculty: "Scienze dei Servizi Giuridici",
        product: "Disoccupazione - 3° Anno",
        rating: 5,
        text: "Appunti completi e ben strutturati sui sussidi e ammortizzatori sociali. Mi hanno aiutato moltissimo. Grazie!"
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

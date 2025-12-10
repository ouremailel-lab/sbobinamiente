// Protezione PDF avanzata
const PDFProtection = {
    userId: null,
    userEmail: null,
    pdfName: null,
    
    init: function(userId, userEmail, pdfName) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.pdfName = pdfName;
        this.setupProtections();
        this.addWatermark();
        this.logAccess();
    },
    
    setupProtections: function() {
        // Disabilita tasto destro del mouse
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showProtectionNotice();
        });

        // Disabilita F12 e DevTools
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J')) {
                e.preventDefault();
                this.showProtectionNotice();
            }
        });

        // Disabilita Ctrl+S (salvataggio)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                alert('⚠️ Il download è disabilitato. Questo contenuto è protetto da copyright.');
            }
        });

        // Disabilita drag & drop
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // Disabilita copia
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showProtectionNotice();
        });

        // Disabilita selezione testo
        document.addEventListener('selectstart', (e) => {
            if (e.target.closest('[data-protected]')) {
                e.preventDefault();
            }
        });

        // Protezione mobile anti-screenshot
        this.setupMobileProtection();
    },

    setupMobileProtection: function() {
        // === iOS: Rileva quando l'app va in background ===
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Schermo nero quando l'app va in background
                this.applyBlackScreen();
                this.logScreenshotAttempt();
            } else {
                // Ripristina quando torna in foreground
                this.removeBlackScreen();
            }
        });

        // === iOS: Rileva blur della finestra ===
        window.addEventListener('blur', () => {
            this.applyBlackScreen();
            this.logScreenshotAttempt();
        });

        window.addEventListener('focus', () => {
            this.removeBlackScreen();
        });

        // === iOS: Disabilita pinch-to-zoom ===
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // === iOS: Monitoraggio aggressivo con Intersection Observer ===
        // Se l'elemento PDF non è visibile, schermo nero
        const pdfContainer = document.getElementById('pdfContent');
        if (pdfContainer && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !document.hidden) {
                        // PDF non è visibile (scrollato fuori o app in background)
                        this.applyBlackScreen();
                    }
                });
            });
            observer.observe(pdfContainer);
        }

        // === Previeni long-press su mobile ===
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (this.lastTouch && now - this.lastTouch < 300) {
                e.preventDefault();
            }
            this.lastTouch = now;
        }, { passive: false });

        // === Protezione aggressiva: monitora tutto il documento ===
        this.setupAggressiveMonitoring();
    },

    applyBlackScreen: function() {
        // Crea overlay nero che copre tutto
        if (!this.blackScreenOverlay) {
            this.blackScreenOverlay = document.createElement('div');
            this.blackScreenOverlay.id = 'pdf-black-screen';
            this.blackScreenOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background-color: #000000;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                text-align: center;
                padding: 20px;
            `;
            this.blackScreenOverlay.innerHTML = '<p>📱 Accedi alla app per visualizzare il contenuto</p>';
        }
        document.body.appendChild(this.blackScreenOverlay);
    },

    removeBlackScreen: function() {
        if (this.blackScreenOverlay && this.blackScreenOverlay.parentNode) {
            this.blackScreenOverlay.remove();
        }
    },

    setupAggressiveMonitoring: function() {
        // Monitora ogni 100ms se l'app è ancora attiva
        setInterval(() => {
            if (document.hidden) {
                this.applyBlackScreen();
            }
        }, 100);
    },

    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    logScreenshotAttempt: function() {
        // Registra possibile tentativo di screenshot
        if (window.supabaseClient && this.userId) {
            window.supabaseClient
                .from('screenshot_attempts')
                .insert([{
                    user_id: this.userId,
                    user_email: this.userEmail,
                    pdf_name: this.pdfName,
                    attempt_at: new Date().toISOString(),
                    user_agent: navigator.userAgent
                }])
                .catch(() => {}); // Silenzioso
        }
    },
    
    addWatermark: function() {
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(255, 0, 0, 0.05);
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
            white-space: nowrap;
            width: 200%;
            text-align: center;
            letter-spacing: 20px;
        `;
        watermark.textContent = this.userEmail || 'PROTETTO';
        watermark.setAttribute('data-protected', 'true');
        document.body.appendChild(watermark);
    },
    
    logAccess: function() {
        // Registra l'accesso al PDF
        if (window.supabaseClient && this.userId) {
            window.supabaseClient
                .from('pdf_access_logs')
                .insert([{
                    user_id: this.userId,
                    user_email: this.userEmail,
                    pdf_name: this.pdfName,
                    accessed_at: new Date().toISOString(),
                    ip_address: '(auto)',
                    user_agent: navigator.userAgent
                }])
                .catch(err => console.log('Log non salvato (facoltativo)', err));
        }
    },
    
    showProtectionNotice: function() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            z-index: 10000;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            max-width: 400px;
        `;
        notice.innerHTML = `
            🔒 CONTENUTO PROTETTO<br><br>
            <small style="font-size: 14px; opacity: 0.8;">
                Questo materiale è protetto da copyright.<br>
                Download, copia e modifica sono vietati.
            </small>
        `;
        document.body.appendChild(notice);

        setTimeout(() => {
            notice.remove();
        }, 3000);
    },
    
    monitorDevTools: function() {
        setInterval(() => {
            const start = new Date();
            debugger;
            const end = new Date();
            if (end - start > 100) {
                console.clear();
                console.log('%c⚠️ PROTEZIONE ATTIVA', 'font-size: 20px; color: red; font-weight: bold;');
                console.log('%cIl contenuto è protetto. Accesso non autorizzato verrà registrato.', 'font-size: 14px; color: orange;');
            }
        }, 2000);
    }
};

// Inizializza protezione quando caricato
document.addEventListener('DOMContentLoaded', function() {
    // Ottieni i dati dell'utente
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const pdfName = document.title || 'PDF Protetto';
    
    // Inizializza protezione
    PDFProtection.init(
        currentUser.id || 'unknown',
        currentUser.email || 'unknown@user.com',
        pdfName
    );
    
    // Monitora DevTools
    PDFProtection.monitorDevTools();
});

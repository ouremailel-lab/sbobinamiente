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

// Protezione PDF - Disabilita tasto destro e salvataggio
document.addEventListener('DOMContentLoaded', function() {
    // Disabilita tasto destro del mouse su tutta la pagina
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showProtectionNotice();
    });

    // Disabilita F12 (DevTools)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
            e.preventDefault();
            showProtectionNotice();
        }
    });

    // Disabilita Ctrl+S per salvare
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            alert('⚠️ Il download è disabilitato. Questo contenuto è protetto.');
        }
    });

    // Disabilita drag & drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // Disabilita selezione di testo su elementi sensibili
    document.addEventListener('selectstart', function(e) {
        if (e.target.closest('[data-protected]')) {
            e.preventDefault();
        }
    });

    // Disabilita copia
    document.addEventListener('copy', function(e) {
        if (e.target.closest('[data-protected]')) {
            e.preventDefault();
            showProtectionNotice();
        }
    });
});

// Monitora i tentativi di apertura DevTools
setInterval(function() {
    const start = new Date();
    debugger;
    const end = new Date();
    if (end - start > 100) {
        console.clear();
        console.log('%c⚠️ PROTEZIONE ATTIVA', 'font-size: 20px; color: red; font-weight: bold;');
        console.log('%cIl contenuto è protetto. Non è consentito copiare, scaricare o modificare il materiale.', 'font-size: 14px; color: orange;');
    }
}, 1000);

function showProtectionNotice() {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        z-index: 10000;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    notice.innerHTML = `
        🔒 CONTENUTO PROTETTO<br><br>
        <small style="font-size: 14px; opacity: 0.8;">Il download, la copia e la modifica sono disabilitate per proteggere i diritti d'autore.</small>
    `;
    document.body.appendChild(notice);

    setTimeout(() => {
        notice.remove();
    }, 3000);
}

// Proteggi gli iframe dei PDF
document.addEventListener('load', function(e) {
    if (e.target.tagName === 'IFRAME') {
        try {
            const iframeDoc = e.target.contentDocument || e.target.contentWindow.document;
            if (iframeDoc) {
                iframeDoc.addEventListener('contextmenu', (evt) => evt.preventDefault());
                iframeDoc.addEventListener('keydown', (evt) => {
                    if (evt.key === 'F12' || (evt.ctrlKey && evt.shiftKey && evt.key === 'I')) {
                        evt.preventDefault();
                    }
                });
            }
        } catch (err) {
            console.log('Protezione iframe attiva');
        }
    }
}, true);

// Blocca le scorciatoie di salvataggio
window.onkeydown = function(e) {
    // Ctrl+S o Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
};

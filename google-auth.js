// Google Sign-In Integration
// Documentazione: https://developers.google.com/identity/gsi/web

const GOOGLE_CLIENT_ID = '985391348038-mrl9hkvh0gaogoqnb5r7hlocn9ikqi00.apps.googleusercontent.com';

// Inizializza Google Sign-In
function initializeGoogleSignIn() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    window.onload = function() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn
            });
        }
    };
}

// Callback quando l'utente accede con Google
function handleGoogleSignIn(response) {
    if (!response.credential) {
        console.error('No credential in response');
        return;
    }

    // Decodifica il JWT token di Google
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const userData = JSON.parse(jsonPayload);
    
    // Estrai dati utente
    const googleUser = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        authMethod: 'google'
    };

    // Salva l'utente
    loginWithGoogle(googleUser);
}

// Login con Google
function loginWithGoogle(googleUser) {
    try {
        // Salva i dati in localStorage
        localStorage.setItem('currentUser', JSON.stringify(googleUser));
        
        // Aggiorna l'UI
        updateUserUI(googleUser);
        
        // Chiudi il modal
        closeAuth();
        
        // Mostra notifica
        showNotification(`Benvenuto, ${googleUser.name}!`);
        
        // Opzionale: Salva in Supabase
        if (window.supabaseClient) {
            saveUserToSupabase(googleUser);
        }

    } catch (error) {
        console.error('Errore login Google:', error);
        alert('Errore durante l\'accesso. Riprova.');
    }
}

// Salva l'utente su Supabase (opzionale)
async function saveUserToSupabase(googleUser) {
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .upsert([{
                id: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                auth_method: 'google',
                created_at: new Date().toISOString()
            }], { onConflict: 'id' });

        if (error) throw error;
        console.log('Utente salvato su Supabase:', data);
    } catch (error) {
        console.error('Errore salvataggio Supabase:', error);
        // Non bloccare il login se Supabase fallisce
    }
}

// Logout Google
function logoutGoogle() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUserUI(null);
    
    // Opzionale: Logout da Google
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.revoke(localStorage.getItem('google_token'), () => {
            console.log('Google logout completato');
        });
    }
}

// Renderizza il bottone Google Sign-In
function renderGoogleSignInButton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div id="g_id_onload"
             data-client_id="${GOOGLE_CLIENT_ID}"
             data-callback="handleGoogleSignIn">
        </div>
        <div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline"></div>
    `;

    // Renderizza il bottone Google
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.renderButton(container.querySelector('.g_id_signin'), {
            type: 'standard',
            size: 'large',
            theme: 'outline',
            text: 'signin_with'
        });
    }
}

// Inizializza quando il documento è caricato
document.addEventListener('DOMContentLoaded', initializeGoogleSignIn);

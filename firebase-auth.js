// Firebase Authentication per Google Sign-In
// Documentazione: https://firebase.google.com/docs/auth/web/google-signin

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDhEcWZRuq9oK8Mi9drszMeKTvKHe48A0g",
    authDomain: "sbobinamente-1f611.firebaseapp.com",
    projectId: "sbobinamente-1f611",
    storageBucket: "sbobinamente-1f611.firebasestorage.app",
    messagingSenderId: "259898996728",
    appId: "1:259898996728:web:0e90e8052d84a32895480d",
    measurementId: "G-P7JQXVKRTB"
};

// Inizializza Firebase
let auth;
let googleProvider;
let appleProvider;

function initializeFirebase() {
    try {
        // Inizializza Firebase App
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Inizializza Auth
        auth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        appleProvider = new firebase.auth.OAuthProvider('apple.com');
        
        // Imposta la lingua italiana
        auth.languageCode = 'it';
        
        // Listener per lo stato dell'autenticazione
        auth.onAuthStateChanged((user) => {
            if (user) {
                handleFirebaseUser(user);
            } else {
                currentUser = null;
                updateUserUI(null);
            }
        });
        
        console.log('Firebase inizializzato con successo');
    } catch (error) {
        console.error('Errore inizializzazione Firebase:', error);
    }
}

// Login con Google tramite Firebase
function loginWithGoogleFirebase() {
    if (!auth) {
        alert('Firebase non è ancora inizializzato. Riprova tra un secondo.');
        return;
    }
    
    // Login con popup
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            console.log('Login Google riuscito:', user);
            handleFirebaseUser(user);
            closeAuth();
            showNotification(`Benvenuto, ${user.displayName}!`);
        })
        .catch((error) => {
            console.error('Errore login Google:', error);
            
            // Messaggi di errore più chiari
            if (error.code === 'auth/popup-closed-by-user') {
                showNotification('Accesso annullato');
            } else if (error.code === 'auth/popup-blocked') {
                alert('Il popup è stato bloccato dal browser. Abilita i popup per questo sito.');
            } else {
                alert('Errore durante l\'accesso con Google: ' + error.message);
            }
        });
}

// Login con Apple tramite Firebase
function loginWithAppleFirebase() {
    if (!auth) {
        alert('Firebase non è ancora inizializzato. Riprova tra un secondo.');
        return;
    }
    
    // Login con popup
    auth.signInWithPopup(appleProvider)
        .then((result) => {
            const user = result.user;
            console.log('Login Apple riuscito:', user);
            handleFirebaseUser(user);
            closeAuth();
            showNotification(`Benvenuto, ${user.displayName || user.email}!`);
        })
        .catch((error) => {
            console.error('Errore login Apple:', error);
            
            // Messaggi di errore più chiari
            if (error.code === 'auth/popup-closed-by-user') {
                showNotification('Accesso annullato');
            } else if (error.code === 'auth/popup-blocked') {
                alert('Il popup è stato bloccato dal browser. Abilita i popup per questo sito.');
            } else {
                alert('Errore durante l\'accesso con Apple: ' + error.message);
            }
        });
}

// Gestisce l'utente Firebase
function handleFirebaseUser(user) {
    const userData = {
        id: user.uid,
        name: user.displayName || 'Utente Google',
        email: user.email,
        picture: user.photoURL,
        authMethod: 'google-firebase'
    };
    
    // Salva in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    currentUser = userData;
    
    // Aggiorna UI
    if (typeof updateUserUI === 'function') {
        updateUserUI(userData);
    }
    
    // Salva su Supabase (opzionale)
    if (window.supabaseClient) {
        saveUserToSupabase(userData);
    }
}

// Logout Firebase
function logoutFirebase() {
    if (auth) {
        auth.signOut().then(() => {
            localStorage.removeItem('currentUser');
            currentUser = null;
            if (typeof updateUserUI === 'function') {
                updateUserUI(null);
            }
            showNotification('Logout effettuato');
        }).catch((error) => {
            console.error('Errore logout:', error);
        });
    }
}

// Salva l'utente su Supabase (opzionale)
async function saveUserToSupabase(userData) {
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .upsert([{
                id: userData.id,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                auth_method: 'google-firebase',
                created_at: new Date().toISOString()
            }], { onConflict: 'id' });

        if (error) throw error;
        console.log('Utente salvato su Supabase:', data);
    } catch (error) {
        console.error('Errore salvataggio Supabase:', error);
    }
}

// Inizializza quando Firebase SDK è caricato
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
    initializeFirebase();
}

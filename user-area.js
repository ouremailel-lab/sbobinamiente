document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    initUserInfo(currentUser);
    bindLogout();
    bindPasswordForm(currentUser);
    loadOrders(currentUser);
});

function togglePassword(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
}

function initUserInfo(user) {
    const firstName = user.nome?.split(' ')[0] || user.nome || '';
    document.getElementById('welcomeText').textContent = `Ciao ${firstName}, gestisci qui i tuoi dati e ordini.`;
    document.getElementById('userName').textContent = user.nome || '-';
    document.getElementById('userEmail').textContent = user.email || '-';
}

function bindLogout() {
    const logout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('logoutLink').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

function bindPasswordForm(user) {
    const form = document.getElementById('passwordForm');
    const statusEl = document.getElementById('passwordStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusEl.textContent = '';
        const current = document.getElementById('currentPassword').value;
        const next = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (current !== user.password) {
            statusEl.style.color = '#b91c1c';
            statusEl.textContent = 'La password attuale non è corretta.';
            return;
        }
        if (next.length < 6) {
            statusEl.style.color = '#b91c1c';
            statusEl.textContent = 'La nuova password deve avere almeno 6 caratteri.';
            return;
        }
        if (next !== confirm) {
            statusEl.style.color = '#b91c1c';
            statusEl.textContent = 'Le password non coincidono.';
            return;
        }

        try {
            // Aggiorna localStorage utente corrente
            user.password = next;
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Aggiorna lista utenti salvata
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.map(u => u.email === user.email ? { ...u, password: next } : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            // Aggiorna Supabase se disponibile
            if (window.supabaseClient) {
                await window.supabaseClient
                    .from('users')
                    .update({ password: next })
                    .eq('email', user.email);
            }

            statusEl.style.color = '#15803d';
            statusEl.textContent = 'Password aggiornata con successo.';
            form.reset();
        } catch (error) {
            console.error('Errore aggiornamento password:', error);
            statusEl.style.color = '#b91c1c';
            statusEl.textContent = 'Errore, riprova tra poco.';
        }
    });
}

async function loadOrders(user) {
    const listEl = document.getElementById('ordersList');
    const countEl = document.getElementById('ordersCount');
    listEl.innerHTML = '<p class="empty-state">Caricamento ordini...</p>';

    let merged = [];

    // Prova a leggere da Supabase
    try {
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('orders')
                .select('*')
                .eq('user_email', user.email)
                .order('order_date', { ascending: false });
            if (error) throw error;
            if (data) merged = merged.concat(data);
        }
    } catch (err) {
        console.warn('Supabase ordini non disponibile:', err.message);
    }

    // Fallback/local merge
    const localOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const localFiltered = localOrders.filter(o =>
        o.user_email === user.email ||
        o.userEmail === user.email ||
        o.deliveryInfo?.email === user.email ||
        o.user?.email === user.email
    );
    merged = merged.concat(localFiltered);

    // Deduplica per order_id o id
    const seen = new Set();
    merged = merged.filter(o => {
        const key = o.order_id || o.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (merged.length === 0) {
        countEl.textContent = '0 ordini';
        listEl.innerHTML = '<div class="empty-state">Non hai ancora ordini.</div>';
        return;
    }

    countEl.textContent = `${merged.length} ordine${merged.length === 1 ? '' : 'i'}`;
    listEl.innerHTML = '';

    merged.forEach(order => {
        const orderId = order.order_id || order.id;
        const date = new Date(order.order_date || order.orderDate || Date.now());
        const status = order.status || 'completato';
        const total = order.total ? Number(order.total).toFixed(2) : '0.00';
        const items = order.items || [];

        const itemLines = items.map(it => {
            const qty = it.quantity || 1;
            const price = it.prezzo || it.price || 0;
            return `${it.title} — Qty ${qty} · €${price.toFixed(2)}`;
        }).join('\n');

        const badgeClass = status === 'pagato' ? 'badge-paid' : (status === 'pending' ? 'badge-pending' : 'badge-paid');
        const badgeLabel = status === 'pending' ? 'In attesa' : 'Pagato';

        const card = document.createElement('div');
        card.className = 'order-item';
        card.innerHTML = `
            <div class="order-header">
                <span>Ordine #${orderId}</span>
                <span class="badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div style="color:#475569; font-size:13px; margin-top:4px;">${date.toLocaleString('it-IT')}</div>
            <div style="margin-top:8px; white-space: pre-line; color:#0f172a;">${itemLines}</div>
            <div style="margin-top:10px; font-weight:700; color:#0f172a;">Totale: €${total}</div>
        `;
        listEl.appendChild(card);
    });
}

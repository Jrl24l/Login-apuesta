// ==========================================================================
// EL REY DEL PARLAY - Home Dashboard Authentication & Logic
// ==========================================================================

const SUPABASE_URL = 'https://ikydrfxnqffgzbfiucun.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aL2_SthV-fqdLkk19OkCiw_k5x3SxwO';
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (err) {
            console.error('Error inicializando Supabase en Home:', err);
        }
    }
    return supabaseClient;
}

document.addEventListener('DOMContentLoaded', async () => {
    const navUserName = document.getElementById('nav-user-name');
    const heroUserName = document.getElementById('hero-user-name');
    const btnLogout = document.getElementById('btn-logout');
    const btnCopiarParlay = document.getElementById('btn-copiar-parlay');
    const btnArmarParlay = document.getElementById('btn-armar-parlay');
    const btnVerMarcadores = document.getElementById('btn-ver-marcadores');

    const client = getSupabase();

    if (!client) {
        showToast('error', 'Error', 'No se pudo conectar con la base de datos de Supabase.');
        return;
    }

    // --- Verificar Autenticación ---
    try {
        const { data: { session }, error } = await client.auth.getSession();

        if (error || !session || !session.user) {
            // Usuario no autenticado -> redirigir al login
            showToast('info', 'Acceso restringido', 'Inicia sesión para entrar a la mesa real.');
            setTimeout(() => {
                window.location.replace('index.html');
            }, 1000);
            return;
        }

        // Usuario autenticado con éxito
        const user = session.user;
        const displayName = user.user_metadata?.full_name || user.email.split('@')[0];

        if (navUserName) navUserName.textContent = displayName;
        if (heroUserName) heroUserName.textContent = displayName;

        showToast('success', `¡Bienvenido, ${displayName}!`, 'Sesión verificada en la corte de El Rey del Parlay.');

    } catch (err) {
        console.error('Error verificando sesión:', err);
        window.location.replace('index.html');
    }

    // --- Cerrar Sesión ---
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            btnLogout.disabled = true;
            btnLogout.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saliendo...';

            try {
                await client.auth.signOut();
                showToast('info', 'Sesión cerrada', '¡Hasta la próxima mi rey! Vuelve pronto a cobrar.');
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 1000);
            } catch (err) {
                console.error('Error al cerrar sesión:', err);
                window.location.replace('index.html');
            }
        });
    }

    // --- Botones interactivos de la sala ---
    if (btnCopiarParlay) {
        btnCopiarParlay.addEventListener('click', () => {
            showToast('success', '¡Combinada Copiada!', 'Se agregaron las 3 selecciones a tu boleto con cuota +5.62.');
        });
    }

    if (btnArmarParlay) {
        btnArmarParlay.addEventListener('click', () => {
            showToast('info', 'Consejo del Rey', '"Hoy la cuota de la Champions está regalada. Métele con fe."');
        });
    }

    if (btnVerMarcadores) {
        btnVerMarcadores.addEventListener('click', () => {
            showToast('info', 'Marcadores en Vivo', 'Conectando con ESPN Scoreboard en tiempo real...');
        });
    }
});

// --- Toast Notification Helper ---
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '<i class="fa-solid fa-crown" style="color: var(--gold-primary);"></i>';
    if (type === 'error') {
        icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--parlay-red);"></i>';
    } else if (type === 'info') {
        icon = '<i class="fa-solid fa-dice" style="color: var(--gold-primary);"></i>';
    }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-body">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}


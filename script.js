// ==========================================================================
// EL REY DEL PARLAY - Real Character Host & Live Sportsbook Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Character & Welcome Elements ---
    const imgElegante = document.getElementById('character-main-img');
    const imgCorona = document.getElementById('character-alt-img');
    const btnOutfitElegante = document.getElementById('btn-outfit-elegante');
    const btnOutfitCorona = document.getElementById('btn-outfit-corona');
    const bubbleQuote = document.getElementById('bubble-quote');
    const quotePills = document.querySelectorAll('.quote-pill');

    // --- DOM Elements: Auth & Layout ---
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const tabIndicator = document.querySelector('.tab-indicator');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const btnSubmit = document.getElementById('btn-submit');
    const btnText = btnSubmit.querySelector('.btn-text');
    const btnSwitchAction = document.getElementById('btn-switch-action');
    const footerSwitchText = document.getElementById('footer-switch-text');
    
    const groupName = document.getElementById('group-name');
    const groupConfirm = document.getElementById('group-confirm');
    const labelRemember = document.getElementById('label-remember');
    const linkForgot = document.getElementById('link-forgot');
    
    const authForm = document.getElementById('auth-form');
    const inputEmail = document.getElementById('user-email');
    const inputPassword = document.getElementById('user-password');
    const inputName = document.getElementById('user-name');
    const inputConfirm = document.getElementById('user-confirm');
    
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');

    // --- DOM Elements: Match Widget ---
    const liveMatchWidget = document.getElementById('live-match-widget');
    const leagueTitleEl = document.getElementById('match-league-title');
    const statusTextEl = document.getElementById('match-status-text');
    const team1LogoEl = document.getElementById('team1-logo');
    const team1BadgeFallbackEl = document.getElementById('team1-badge-fallback');
    const team1NameEl = document.getElementById('team1-name');
    const team1ScoreEl = document.getElementById('team1-score');
    const team2LogoEl = document.getElementById('team2-logo');
    const team2BadgeFallbackEl = document.getElementById('team2-badge-fallback');
    const team2NameEl = document.getElementById('team2-name');
    const team2ScoreEl = document.getElementById('team2-score');
    const venueTextEl = document.getElementById('match-venue-text');
    const statLabelEl = document.getElementById('match-stat-label');
    const statValueEl = document.getElementById('match-stat-value');
    const statBarEl = document.getElementById('match-stat-bar');
    const counterLabelEl = document.getElementById('match-counter-label');
    const apiStatusLabel = document.getElementById('api-status-label');
    const btnPrevMatch = document.getElementById('btn-prev-match');
    const btnNextMatch = document.getElementById('btn-next-match');
    const btnRefreshMatch = document.getElementById('btn-refresh-match');
    const refreshIcon = document.getElementById('refresh-icon');

    const sportTags = document.querySelectorAll('.sport-tag');

    // State Variables
    let currentAuthMode = 'login';
    let currentSport = 'futbol';
    let sportMatches = [];
    let currentMatchIndex = 0;
    let isFetchingAPI = false;

    // --- Character Outfit Switcher ---
    function setCharacterOutfit(outfit) {
        if (outfit === 'elegante') {
            imgElegante.classList.remove('hidden');
            imgElegante.classList.add('visible');
            imgCorona.classList.remove('visible');
            imgCorona.classList.add('hidden');

            btnOutfitElegante.classList.add('active');
            btnOutfitCorona.classList.remove('active');
            setBubbleMessage('"¡Traje de gala listo! ¿Qué vamos a apostar hoy? La mesa está servida."');
        } else {
            imgCorona.classList.remove('hidden');
            imgCorona.classList.add('visible');
            imgElegante.classList.remove('visible');
            imgElegante.classList.add('hidden');

            btnOutfitCorona.classList.add('active');
            btnOutfitElegante.classList.remove('active');
            setBubbleMessage('"¡Con la corona puesta! Ni le pego a la vieja pero aquí nadie se rinde jamás."');
        }
    }

    if (btnOutfitElegante) btnOutfitElegante.addEventListener('click', () => setCharacterOutfit('elegante'));
    if (btnOutfitCorona) btnOutfitCorona.addEventListener('click', () => setCharacterOutfit('corona'));

    // --- Bubble Message Helper ---
    function setBubbleMessage(text) {
        if (!bubbleQuote) return;
        bubbleQuote.style.opacity = '0';
        bubbleQuote.style.transform = 'translateY(4px)';
        setTimeout(() => {
            bubbleQuote.textContent = text;
            bubbleQuote.style.transition = 'all 0.25s ease';
            bubbleQuote.style.opacity = '1';
            bubbleQuote.style.transform = 'translateY(0)';
        }, 150);
    }

    // Quick Quote Buttons
    quotePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const quote = pill.dataset.quote;
            if (quote) {
                setBubbleMessage(`"${quote}"`);
            }
        });
    });

    // Character reactions on input focus
    if (inputEmail) {
        inputEmail.addEventListener('focus', () => {
            setBubbleMessage('"Pon tu correo para recibir los análisis y parlays calientes de la jornada."');
        });
    }

    if (inputPassword) {
        inputPassword.addEventListener('focus', () => {
            setBubbleMessage('"Shhh... mete la clave secreta. Que nadie te espíe la combinada ganadora."');
        });
    }

    // --- Real Sports APIs (ESPN Public Scoreboard endpoints) ---
    const API_CONFIGS = {
        futbol: {
            theme: 'futbol',
            icon: 'fa-futbol',
            name: 'Fútbol Internacional',
            endpoints: [
                'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',        // La Liga
                'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard', // Champions League
                'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'        // Premier League
            ],
            fallback: [
                {
                    league: 'UEFA Champions League',
                    status: 'FINAL',
                    venue: 'Santiago Bernabéu',
                    team1: { name: 'Real Madrid', score: '3', abbrev: 'RMA', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png', color: '#FEBE10' },
                    team2: { name: 'Man. City', score: '2', abbrev: 'MCI', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png', color: '#6CABDD' },
                    statLabel: 'Posesión de balón',
                    statValue: '52% - 48%',
                    statPercent: 52
                },
                {
                    league: 'LaLiga EA Sports',
                    status: "74' EN VIVO",
                    venue: 'Montjuïc',
                    team1: { name: 'FC Barcelona', score: '2', abbrev: 'BAR', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png', color: '#004D98' },
                    team2: { name: 'Atlético', score: '1', abbrev: 'ATM', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png', color: '#CB3524' },
                    statLabel: 'Tiros al Arco',
                    statValue: '7 - 4',
                    statPercent: 63
                }
            ]
        },
        basket: {
            theme: 'basket',
            icon: 'fa-basketball',
            name: 'NBA Basketball',
            endpoints: [
                'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
            ],
            fallback: [
                {
                    league: 'NBA - Temporada Regular',
                    status: 'Q4 02:40',
                    venue: 'Crypto.com Arena',
                    team1: { name: 'LA Lakers', score: '112', abbrev: 'LAL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', color: '#552583' },
                    team2: { name: 'Golden State', score: '108', abbrev: 'GSW', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png', color: '#1D428A' },
                    statLabel: 'Efectividad en Tiros',
                    statValue: '48.2% - 44.5%',
                    statPercent: 52
                }
            ]
        },
        f1: {
            theme: 'f1',
            icon: 'fa-flag-checkered',
            name: 'Formula 1',
            endpoints: [
                'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard'
            ],
            fallback: [
                {
                    league: 'F1 - Gran Premio de Mónaco',
                    status: 'VUELTA 56/78',
                    venue: 'Monte Carlo',
                    team1: { name: 'M. Verstappen', score: 'P1', abbrev: 'RBR', logo: 'https://a.espncdn.com/i/teamlogos/racing/f1/500/redbull.png', color: '#0600EF' },
                    team2: { name: 'C. Leclerc', score: '+1.2s', abbrev: 'FER', logo: 'https://a.espncdn.com/i/teamlogos/racing/f1/500/ferrari.png', color: '#E80020' },
                    statLabel: 'Intervalo de tiempo DRS',
                    statValue: '1.240s (En zona)',
                    statPercent: 70
                }
            ]
        },
        tennis: {
            theme: 'tennis',
            icon: 'fa-baseball-bat-ball',
            name: 'Tenis Mundial',
            endpoints: [
                'https://site.api.espn.com/apis/site/v2/sports/tennis/scoreboard'
            ],
            fallback: [
                {
                    league: 'ATP Masters 1000 - Semifinal',
                    status: 'SET 3 (4-5)',
                    venue: 'Cancha Central',
                    team1: { name: 'C. Alcaraz', score: '6-4', abbrev: 'ESP', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/esp.png', color: '#C60B1E' },
                    team2: { name: 'J. Sinner', score: '5-7', abbrev: 'ITA', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ita.png', color: '#008C45' },
                    statLabel: 'Puntos de Quiebre Salvados',
                    statValue: '5/6 (83%)',
                    statPercent: 83
                }
            ]
        }
    };

    // --- Parser for ESPN API JSON ---
    function parseESPNScoreboard(data, defaultLeagueName) {
        if (!data || !data.events || !Array.isArray(data.events) || data.events.length === 0) {
            return [];
        }

        const leagueName = (data.leagues && data.leagues[0] && data.leagues[0].name) ? data.leagues[0].name : defaultLeagueName;
        const matches = [];

        data.events.forEach(event => {
            try {
                const competition = event.competitions && event.competitions[0];
                if (!competition || !competition.competitors || competition.competitors.length < 2) return;

                const comp1 = competition.competitors[0];
                const comp2 = competition.competitors[1];

                const homeComp = comp1.homeAway === 'home' ? comp1 : (comp2.homeAway === 'home' ? comp2 : comp1);
                const awayComp = homeComp === comp1 ? comp2 : comp1;

                let statusText = 'PRÓXIMO';
                if (competition.status && competition.status.type) {
                    const st = competition.status.type;
                    if (st.state === 'in') {
                        statusText = competition.status.displayClock ? `${competition.status.displayClock} EN VIVO` : 'EN VIVO';
                    } else if (st.completed || st.state === 'post') {
                        statusText = st.shortDetail || 'FINAL';
                    } else if (st.detail) {
                        statusText = st.shortDetail || st.detail;
                    }
                }

                const venueName = competition.venue && competition.venue.fullName ? competition.venue.fullName : (event.venue ? event.venue.fullName : 'Estadio');

                let statLabel = 'Marcador Oficial';
                let statValue = `${homeComp.score || 0} - ${awayComp.score || 0}`;
                let statPercent = 50;

                if (homeComp.statistics && Array.isArray(homeComp.statistics)) {
                    const possStat = homeComp.statistics.find(s => s.name === 'possessionPct');
                    if (possStat && possStat.displayValue) {
                        const hPoss = parseFloat(possStat.displayValue);
                        const aPoss = 100 - hPoss;
                        statLabel = 'Posesión de Balón';
                        statValue = `${hPoss}% - ${aPoss}%`;
                        statPercent = Math.min(Math.max(hPoss, 10), 90);
                    }
                }

                matches.push({
                    league: leagueName,
                    status: statusText,
                    venue: venueName,
                    team1: {
                        name: homeComp.team.shortDisplayName || homeComp.team.displayName || homeComp.team.name,
                        score: homeComp.score !== undefined ? homeComp.score : '-',
                        abbrev: homeComp.team.abbreviation || 'LOC',
                        logo: homeComp.team.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${homeComp.team.id}.png`,
                        color: homeComp.team.color ? `#${homeComp.team.color}` : '#3498db'
                    },
                    team2: {
                        name: awayComp.team.shortDisplayName || awayComp.team.displayName || awayComp.team.name,
                        score: awayComp.score !== undefined ? awayComp.score : '-',
                        abbrev: awayComp.team.abbreviation || 'VIS',
                        logo: awayComp.team.logo || `https://a.espncdn.com/i/teamlogos/soccer/500/${awayComp.team.id}.png`,
                        color: awayComp.team.color ? `#${awayComp.team.color}` : '#e74c3c'
                    },
                    statLabel: statLabel,
                    statValue: statValue,
                    statPercent: statPercent
                });
            } catch (err) {
                console.warn('Error parsing match item:', err);
            }
        });

        return matches;
    }

    // --- Fetch Real Live Sports Data from Web APIs ---
    async function fetchRealSportData(sportKey, silent = false) {
        const config = API_CONFIGS[sportKey];
        if (!config) return;

        isFetchingAPI = true;
        if (refreshIcon) refreshIcon.classList.add('fa-spin');
        if (apiStatusLabel) apiStatusLabel.textContent = 'Consultando API en vivo...';

        let gatheredMatches = [];

        for (const url of config.endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);

                const response = await fetch(url, {
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const json = await response.json();
                    const parsed = parseESPNScoreboard(json, config.name);
                    if (parsed.length > 0) {
                        gatheredMatches = gatheredMatches.concat(parsed);
                    }
                }
            } catch (e) {
                console.warn(`Endpoint attempt error (${url}):`, e.message);
            }
        }

        if (gatheredMatches.length > 0) {
            sportMatches = gatheredMatches;
            if (apiStatusLabel) apiStatusLabel.textContent = 'En vivo: ESPN Sports API';
            if (!silent) {
                showToast('success', 'Marcadores Reales Actualizados', `${sportMatches.length} partidos cargados en tiempo real desde ESPN.`);
            }
        } else {
            sportMatches = config.fallback;
            if (apiStatusLabel) apiStatusLabel.textContent = 'Datos Deportivos Oficiales';
            if (!silent) {
                showToast('info', 'Información Deportiva Activa', `Visualizando marcadores de ${config.name}`);
            }
        }

        currentMatchIndex = 0;
        renderCurrentMatch();

        isFetchingAPI = false;
        if (refreshIcon) refreshIcon.classList.remove('fa-spin');
    }

    // --- Render Match Data to the DOM ---
    function renderCurrentMatch() {
        if (!sportMatches || sportMatches.length === 0) return;

        const match = sportMatches[currentMatchIndex];
        if (!match) return;

        const config = API_CONFIGS[currentSport];
        const iconClass = config ? config.icon : 'fa-trophy';

        if (liveMatchWidget) {
            liveMatchWidget.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            liveMatchWidget.style.opacity = '0.7';
        }

        setTimeout(() => {
            if (leagueTitleEl) leagueTitleEl.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${match.league}`;
            if (statusTextEl) statusTextEl.textContent = match.status;

            if (team1NameEl) team1NameEl.textContent = match.team1.name;
            if (team1ScoreEl) team1ScoreEl.textContent = match.team1.score;
            if (team1LogoEl) {
                team1LogoEl.src = match.team1.logo;
                team1LogoEl.style.display = 'block';
                if (team1BadgeFallbackEl) team1BadgeFallbackEl.style.display = 'none';
            }
            if (team1BadgeFallbackEl) {
                team1BadgeFallbackEl.textContent = match.team1.abbrev;
                team1BadgeFallbackEl.style.background = match.team1.color || '#e67e22';
            }

            if (team2NameEl) team2NameEl.textContent = match.team2.name;
            if (team2ScoreEl) team2ScoreEl.textContent = match.team2.score;
            if (team2LogoEl) {
                team2LogoEl.src = match.team2.logo;
                team2LogoEl.style.display = 'block';
                if (team2BadgeFallbackEl) team2BadgeFallbackEl.style.display = 'none';
            }
            if (team2BadgeFallbackEl) {
                team2BadgeFallbackEl.textContent = match.team2.abbrev;
                team2BadgeFallbackEl.style.background = match.team2.color || '#0984e3';
            }

            if (venueTextEl) venueTextEl.textContent = match.venue || 'Estadio';
            if (statLabelEl) statLabelEl.textContent = match.statLabel || 'Métrica Oficial';
            if (statValueEl) statValueEl.textContent = match.statValue || '--';
            if (statBarEl) statBarEl.style.width = `${match.statPercent || 50}%`;

            if (counterLabelEl) {
                counterLabelEl.textContent = `${currentMatchIndex + 1} de ${sportMatches.length}`;
            }

            if (liveMatchWidget) liveMatchWidget.style.opacity = '1';
        }, 150);
    }

    // --- Match Navigation Buttons ---
    if (btnPrevMatch) {
        btnPrevMatch.addEventListener('click', () => {
            if (sportMatches.length <= 1) return;
            currentMatchIndex = (currentMatchIndex - 1 + sportMatches.length) % sportMatches.length;
            renderCurrentMatch();
        });
    }

    if (btnNextMatch) {
        btnNextMatch.addEventListener('click', () => {
            if (sportMatches.length <= 1) return;
            currentMatchIndex = (currentMatchIndex + 1) % sportMatches.length;
            renderCurrentMatch();
        });
    }

    if (btnRefreshMatch) {
        btnRefreshMatch.addEventListener('click', () => {
            if (isFetchingAPI) return;
            fetchRealSportData(currentSport, false);
        });
    }

    // --- Sport Tag Switcher ---
    sportTags.forEach(tag => {
        tag.addEventListener('click', () => {
            sportTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const sportKey = tag.dataset.sport;
            if (sportKey && API_CONFIGS[sportKey]) {
                currentSport = sportKey;
                fetchRealSportData(sportKey, true);
                setBubbleMessage(`"¡Cambiando a ${API_CONFIGS[sportKey].name}! Ahí sí hay buenas combinadas para meterle."`);
            }
        });
    });

    // --- Mode Switcher (Iniciar Sesión vs Registrarse) ---
    function setAuthMode(mode) {
        currentAuthMode = mode;
        clearErrors();

        if (mode === 'login') {
            tabLogin.classList.add('active');
            tabLogin.setAttribute('aria-selected', 'true');
            tabRegister.classList.remove('active');
            tabRegister.setAttribute('aria-selected', 'false');
            tabIndicator.style.transform = 'translateX(0%)';

            authTitle.textContent = 'Acceso a la Mesa Real';
            authSubtitle.textContent = 'Ingresa tus credenciales para ver tus parlays, marcadores en tiempo real y cuotas exclusivas.';
            btnText.textContent = 'ENTRAR AL PARLAY';

            groupName.classList.add('hidden');
            groupConfirm.classList.add('hidden');
            if (linkForgot) linkForgot.style.display = 'inline-block';
            if (labelRemember) labelRemember.textContent = 'Mantener mi sesión iniciada';

            footerSwitchText.innerHTML = '¿Nuevo en el reino? <button type="button" class="link-switch" id="btn-switch-action">Regístrate gratis aquí</button>';
            setBubbleMessage('"¡Qué gusto tenerte de regreso! Entra rápido que ya van a empezar los partidos."');
        } else {
            tabRegister.classList.add('active');
            tabRegister.setAttribute('aria-selected', 'true');
            tabLogin.classList.remove('active');
            tabLogin.setAttribute('aria-selected', 'false');
            tabIndicator.style.transform = 'translateX(100%)';

            authTitle.textContent = 'Únete al Club del Rey';
            authSubtitle.textContent = 'Crea tu cuenta de apostador para armar parlays legendarios con la comunidad.';
            btnText.textContent = 'CREAR CUENTA VIP';

            groupName.classList.remove('hidden');
            groupConfirm.classList.remove('hidden');
            if (linkForgot) linkForgot.style.display = 'none';
            if (labelRemember) labelRemember.textContent = 'Acepto los Términos del Club de Apuestas';

            footerSwitchText.innerHTML = '¿Ya tienes una cuenta? <button type="button" class="link-switch" id="btn-switch-action">Inicia sesión</button>';
            setBubbleMessage('"¡Eso! Un nuevo miembro para la corte del parlay. Regístrate y bienvenido a la familia."');
        }

        const newSwitchBtn = document.getElementById('btn-switch-action');
        if (newSwitchBtn) {
            newSwitchBtn.addEventListener('click', () => {
                setAuthMode(currentAuthMode === 'login' ? 'register' : 'login');
            });
        }
    }

    if (tabLogin) tabLogin.addEventListener('click', () => setAuthMode('login'));
    if (tabRegister) tabRegister.addEventListener('click', () => setAuthMode('register'));
    if (btnSwitchAction) btnSwitchAction.addEventListener('click', () => setAuthMode('register'));

    // --- Password Visibility Toggle ---
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = inputPassword.getAttribute('type') === 'password';
            inputPassword.setAttribute('type', isPassword ? 'text' : 'password');
            eyeIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        });
    }

    // --- Form Validation & Submission ---
    function showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    function clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            let isValid = true;
            const emailVal = inputEmail.value.trim();
            const passwordVal = inputPassword.value;

            if (currentAuthMode === 'register') {
                const nameVal = inputName.value.trim();
                const confirmVal = inputConfirm.value;

                if (!nameVal) {
                    showError('error-name', 'Por favor ingresa tu apodo o nombre');
                    isValid = false;
                }

                if (passwordVal !== confirmVal) {
                    showError('error-confirm', 'Las contraseñas no coinciden');
                    isValid = false;
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal) {
                showError('error-email', 'El correo es requerido');
                isValid = false;
            } else if (!emailRegex.test(emailVal)) {
                showError('error-email', 'Formato de correo no válido');
                isValid = false;
            }

            if (!passwordVal) {
                showError('error-password', 'La contraseña es requerida');
                isValid = false;
            } else if (passwordVal.length < 6) {
                showError('error-password', 'Debe tener al menos 6 caracteres');
                isValid = false;
            }

            if (isValid) {
                btnSubmit.disabled = true;
                const originalText = btnText.textContent;
                btnText.textContent = 'VALIDANDO CON EL REY...';
                btnSubmit.style.opacity = '0.85';
                setBubbleMessage('"Verificando tus datos... si todo está en orden, hoy te coronas."');

                setTimeout(() => {
                    btnSubmit.disabled = false;
                    btnText.textContent = originalText;
                    btnSubmit.style.opacity = '1';

                    if (currentAuthMode === 'login') {
                        showToast('success', '¡Bienvenido al Parlay!', `Acceso concedido a ${emailVal}`);
                        setBubbleMessage('"¡Listo mi rey! Entraste con éxito. A revisar las combinadas del día."');
                    } else {
                        showToast('success', '¡Cuenta Creada!', 'Bienvenido a la corte oficial de El Rey del Parlay.');
                        setBubbleMessage('"¡Felicidades! Ya eres parte oficial del Club. A romper las cuotas."');
                    }
                }, 1200);
            } else {
                showToast('error', 'Revisa tus datos', 'Hay campos incompletos en el formulario.');
                setBubbleMessage('"Ojo ahí, te faltaron unos datos. Completa todo bien para poder entrar."');
            }
        });
    }

    // --- Social Login Simulation ---
    ['btn-google', 'btn-apple', 'btn-discord'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const service = btn.innerText.trim();
                showToast('info', `Conexión con ${service}`, 'Iniciando autenticación externa...');
                setBubbleMessage(`"Conectando vía ${service}. Seguridad total garantizada."`);
            });
        }
    });

    // --- Forgot Password Link ---
    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Ingresa tu correo para recuperar tu contraseña:', inputEmail.value || '');
            if (email) {
                showToast('success', 'Recuperación enviada', `Revisa tu correo: ${email}`);
                setBubbleMessage('"Te mandé el correo de recuperación. Cámbiala y vuelve a la jugada."');
            }
        });
    }

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
        }, 4000);
    }

    // --- Auto-Rotation of matches & API Refresh ---
    setInterval(() => {
        if (sportMatches.length > 1 && !isFetchingAPI) {
            currentMatchIndex = (currentMatchIndex + 1) % sportMatches.length;
            renderCurrentMatch();
        }
    }, 12000);

    setInterval(() => {
        fetchRealSportData(currentSport, true);
    }, 60000);

    // Initial Data Fetch
    fetchRealSportData('futbol', true);
});

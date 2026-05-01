// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v2.5
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v2.5)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Anketa.init() v2.5');
        this.loadMyAnketas();
    },

    switchTab(tab, element) {
        this.currentTab = tab;
        document.querySelectorAll('#anketaScreen .team-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');

        const myTab = document.getElementById('anketaMyTab');
        const likesTab = document.getElementById('anketaLikesTab');

        if (tab === 'my') {
            if (myTab) myTab.style.display = 'block';
            if (likesTab) likesTab.style.display = 'none';
            this.loadMyAnketas();
        } else {
            if (myTab) myTab.style.display = 'none';
            if (likesTab) likesTab.style.display = 'block';
            this.loadLikes();
        }
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ (СЛОТЫ С ВОПРОСИКОМ)
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }

        const modes = [
            { id: 'faceit', name: 'FACEIT', color: '#4CAF50', bg: 'rgba(0,255,0,0.12)' },
            { id: 'premier', name: 'PREMIER', color: '#FF5500', bg: 'rgba(255,85,0,0.12)' },
            { id: 'prime', name: 'PRIME', color: '#0096FF', bg: 'rgba(0,150,255,0.12)' },
            { id: 'public', name: 'PUBLIC', color: '#FFD600', bg: 'rgba(255,255,0,0.12)' }
        ];

        // Загружаем анкеты
        fetch(`${this.BACKEND_URL}/api/anketa/list?telegram_id=${telegram_id}`)
            .then(r => r.json())
            .then(anketaData => {
                const anketaMap = {};
                if (anketaData.anketas) {
                    anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
                }

                // Сортируем: заполненные вверх
                const sortedModes = [...modes].sort((a, b) => {
                    return (anketaMap[b.id] ? 1 : 0) - (anketaMap[a.id] ? 1 : 0);
                });

                let html = '';

                sortedModes.forEach(m => {
                    const anketa = anketaMap[m.id];

                    if (anketa) {
                        // ✅ ЗАПОЛНЕННЫЙ СЛОТ
                        html += `
                        <div class="anketa-slot filled" style="border-left: 4px solid ${m.color};">
                            <div class="anketa-slot-header">
                                <span class="anketa-slot-badge" style="background:${m.bg};color:${m.color};">${m.name}</span>
                                <span class="anketa-slot-rank">${anketa.rank || '—'}</span>
                            </div>
                            <div class="anketa-slot-info">
                                ${anketa.age ? `<span class="anketa-slot-age">${anketa.age} лет</span>` : ''}
                                ${anketa.about ? `<span class="anketa-slot-about">${anketa.about.substring(0, 60)}${anketa.about.length > 60 ? '...' : ''}</span>` : ''}
                            </div>
                            <div class="anketa-slot-actions">
                                <button class="anketa-slot-btn edit" onclick="Anketa.editAnketa('${m.id}')">✏️</button>
                                <button class="anketa-slot-btn delete" onclick="Anketa.deleteAnketa('${m.id}')">🗑️</button>
                            </div>
                        </div>`;
                    } else {
                        // ❌ ПУСТОЙ СЛОТ — КАРТОЧКА С ВОПРОСИКОМ
                        html += `
                        <div class="anketa-slot empty-card">
                            <div class="anketa-slot-empty-content">
                                <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                                    <defs>
                                        <filter id="softGlow-${m.id}">
                                            <feGaussianBlur stdDeviation="2.5" result="blur"/>
                                            <feMerge>
                                                <feMergeNode in="blur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <path d="M32 50V48" stroke="${m.color}" stroke-width="3" stroke-linecap="round" filter="url(#softGlow-${m.id})"/>
                                    <path d="M24.5 25.5C24.5 20.8 27.8 18 32 18C36.2 18 39.5 20.8 39.5 25C39.5 29.5 35.8 31.2 33.8 32.8C32.5 33.8 32 34.8 32 37"
                                        stroke="${m.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#softGlow-${m.id})"/>
                                </svg>
                                <div class="anketa-slot-mode-name" style="color:${m.color};">${m.name}</div>
                            </div>
                            <button class="anketa-slot-btn create" onclick="Anketa.goToMode('${m.id}')">Создать</button>
                        </div>`;
                    }
                });

                container.innerHTML = html;
            })
            .catch(() => {
                // Fallback: все пустые слоты
                let html = '';
                modes.forEach(m => {
                    html += `
                    <div class="anketa-slot empty-card">
                        <div class="anketa-slot-empty-content">
                            <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                                <defs>
                                    <filter id="softGlow-fb-${m.id}">
                                        <feGaussianBlur stdDeviation="2.5" result="blur"/>
                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                </defs>
                                <path d="M32 50V48" stroke="${m.color}" stroke-width="3" stroke-linecap="round" filter="url(#softGlow-fb-${m.id})"/>
                                <path d="M24.5 25.5C24.5 20.8 27.8 18 32 18C36.2 18 39.5 20.8 39.5 25C39.5 29.5 35.8 31.2 33.8 32.8C32.5 33.8 32 34.8 32 37"
                                    stroke="${m.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#softGlow-fb-${m.id})"/>
                            </svg>
                            <div class="anketa-slot-mode-name" style="color:${m.color};">${m.name}</div>
                        </div>
                        <button class="anketa-slot-btn create" onclick="Anketa.goToMode('${m.id}')">Создать</button>
                    </div>`;
                });
                container.innerHTML = html;
            });
    },

    // 🔥 ПЕРЕХОД В РЕЖИМ ДЛЯ СОЗДАНИЯ АНКЕТЫ
    goToMode(modeId) {
        App.showScreen(modeId + 'Screen', true);

        setTimeout(() => {
            const searchBtn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (searchBtn) {
                searchBtn.textContent = 'Создать анкету';
                searchBtn.onclick = () => {
                    let value = '';
                    if (modeId === 'faceit') value = document.getElementById('faceitELOInput')?.value || '';
                    else if (modeId === 'premier') value = document.getElementById('premierRatingInput')?.value || '';
                    else if (modeId === 'prime') value = document.getElementById('primeRankSelect')?.value || '';
                    else if (modeId === 'public') value = document.getElementById('publicRankSelect')?.value || '';

                    Search.startBrowse(modeId.toUpperCase(), value);

                    setTimeout(() => {
                        App.showCustomPopup(
                            '✅ Анкета создана!',
                            'Теперь вы можете смотреть анкеты других игроков.',
                            () => { App.showScreen('swipeScreen', false); },
                            () => { App.showScreen('mainScreen', true); },
                            'Смотреть анкеты',
                            'На главную',
                            false
                        );
                    }, 500);
                };
            }
        }, 300);
    },

    editAnketa(modeId) {
        this.goToMode(modeId);
    },

    deleteAnketa(modeId) {
        App.showCustomPopup(
            'Удалить анкету?',
            `Анкета для ${modeId.toUpperCase()} будет удалена.`,
            () => {
                const telegram_id = this.getTelegramId();
                fetch(`${this.BACKEND_URL}/api/anketa/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id), mode: modeId })
                })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'ok') this.loadMyAnketas();
                })
                .catch(() => {});
            },
            null, 'Удалить', 'Отмена', true
        );
    },

    // 🔥 ЗАГРУЗКА ЛАЙКОВ
    loadLikes() {
        const container = document.getElementById('anketaLikesTab');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }

        fetch(`${this.BACKEND_URL}/api/likes/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status !== 'ok') {
                container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>';
                return;
            }

            let html = '';

            if (data.mutual && data.mutual.length > 0) {
                html += `<div class="likes-section-title" style="display:flex;align-items:center;gap:6px;color:#FF5500;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="icon-match-pulse">
                        <defs><filter id="glow-match"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                        <path d="M20.8 4.6c-1.7-1.7-4.4-1.7-6.1 0L12 7.3l-2.7-2.7c-1.7-1.7-4.4-1.7-6.1 0-1.7 1.7-1.7 4.4 0 6.1L12 21l8.8-9.9c1.7-1.7 1.7-4.4 0-6.1z" stroke="#FF5500" stroke-width="1.8" fill="none" filter="url(#glow-match)"/>
                    </svg>Взаимные мэтчи</div>`;
                data.mutual.forEach(m => html += this.buildLikeItem(m, 'mutual'));
            }

            if (data.liked_me && data.liked_me.length > 0) {
                html += `<div class="likes-section-title" style="display:flex;align-items:center;gap:6px;color:#FF5500;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="icon-eye-pulse">
                        <defs><filter id="glow-eye"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="#FF5500" stroke-width="1.8" fill="none" filter="url(#glow-eye)"/>
                        <circle cx="12" cy="12" r="3" stroke="#FF5500" stroke-width="1.8" fill="none"/>
                    </svg>Тебя лайкнули</div>`;
                data.liked_me.forEach(m => html += this.buildLikeItem(m, 'liked_me'));
            }

            if (data.i_liked && data.i_liked.length > 0) {
                html += `<div class="likes-section-title" style="display:flex;align-items:center;gap:6px;color:#8E97A6;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M7 22V10H3v12h4z" stroke="#8E97A6" stroke-width="1.8"/>
                        <path d="M7 10l5-7c.6-.8 1.8-1 2.6-.4.8.6 1 1.8.4 2.6L13 10h6c1.1 0 2 .9 2 2v1c0 .3-.1.7-.2 1l-2.2 7c-.3.7-1 1.2-1.8 1.2H7" stroke="#8E97A6" stroke-width="1.8" fill="none"/>
                    </svg>Ты лайкнул</div>`;
                data.i_liked.forEach(m => html += this.buildLikeItem(m, 'i_liked'));
            }

            if (!html) {
                html = '<div class="anketa-empty">Пока нет лайков<br><br>Смотрите анкеты в любом режиме и лайкайте тиммейтов!</div>';
            }

            container.innerHTML = html;
        })
        .catch(() => { container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>'; });
    },

    buildLikeItem(m, type) {
        const avatarUrl = m.avatar || null;
        const avatarHtml = avatarUrl
            ? `<img src="${avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : (m.nick || '?')[0].toUpperCase();

        let actionBtn = '';
        if (type === 'mutual') {
            actionBtn = '<div class="friend-arrow" style="cursor:pointer;">→</div>';
        } else if (type === 'liked_me') {
            actionBtn = `<button class="like-item-action like-back" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️ Лайкнуть</button>`;
        } else {
            actionBtn = '<div class="friend-arrow" style="cursor:pointer;opacity:0.3;">→</div>';
        }

        return `<div class="like-item">
            <div class="like-item-avatar">${avatarHtml}</div>
            <div class="like-item-info">
                <div class="like-item-nick">${m.nick || 'Без имени'}</div>
                <div class="like-item-mode">${m.mode || ''} • ${m.rank || ''}</div>
            </div>${actionBtn}</div>`;
    },

    likeBack(likedPlayerId) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id), liked_player_id: likedPlayerId })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'match') {
                App.showCustomPopup('❤️ Взаимный мэтч!', 'Проверь Telegram — бот прислал контакт!', null, null, 'OK', '', false);
            }
            this.loadLikes();
        })
        .catch(() => {});
    }
};

document.addEventListener('DOMContentLoaded', () => { if (document.getElementById('anketaScreen')) Anketa.init(); });

const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(screenId, updateNav) {
        origShow.call(window.App, screenId, updateNav);
        if (screenId === 'anketaScreen') setTimeout(() => Anketa.init(), 200);
    };
}

window.Anketa = Anketa;

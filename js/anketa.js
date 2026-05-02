// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v6.0
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v6.0)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    RIBBON_COLORS: {
        faceit:   { bg: 'rgba(20,20,26,0.95)', color: '#FF5500' },
        premier:  { bg: 'rgba(20,20,26,0.95)', color: '#FF5500' },
        prime:    { bg: 'rgba(20,20,26,0.95)', color: '#C0C6D0' },
        public:   { bg: 'rgba(20,20,26,0.95)', color: '#C0C6D0' }
    },

    init() {
        console.log('🚀 Anketa.init() v6.0');
        this.injectStyles();
        this.loadMyAnketas();
    },

    // 🔥 ВНЕДРЯЕМ ВСЕ СТИЛИ
    injectStyles() {
        if (document.getElementById('anketa-v6-styles')) return;
        const style = document.createElement('style');
        style.id = 'anketa-v6-styles';
        style.textContent = `
            /* СКРОЛЛ */
            .anketa-scroll {
                display: flex;
                flex-direction: column;
                gap: 0;
                max-height: calc(100vh - 160px);
                overflow-y: auto;
                padding: 12px 16px 40px;
                -webkit-overflow-scrolling: touch;
            }

            .anketa-loading,
            .anketa-empty-text {
                text-align: center;
                padding: 40px 20px;
                color: rgba(255,255,255,0.4);
                font-size: 14px;
            }

            /* РАЗДЕЛИТЕЛЬ */
            .anketa-divider {
                height: 1px;
                margin: 10px 0;
                background: rgba(255,255,255,0.06);
                flex-shrink: 0;
            }

            /* КАРТОЧКА */
            .anketa-card {
                position: relative;
                width: 100%;
                aspect-ratio: 4 / 5;
                border-radius: 18px;
                overflow: hidden;
                background: linear-gradient(145deg, #1a1a1e, #141418);
                border: 1px solid rgba(255,255,255,0.06);
                box-shadow: 
                    0 10px 30px rgba(0,0,0,0.4),
                    inset 0 1px 0 rgba(255,255,255,0.04);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                animation: cardSlideUp 0.4s ease both;
            }

            .anketa-card:nth-child(2) { animation-delay: 0.05s; }
            .anketa-card:nth-child(4) { animation-delay: 0.1s; }
            .anketa-card:nth-child(6) { animation-delay: 0.15s; }
            .anketa-card:nth-child(8) { animation-delay: 0.2s; }

            .anketa-card:active {
                transform: scale(0.98);
            }

            .anketa-card.filled {
                background: linear-gradient(145deg, #1c1c22, #16161c);
            }

            /* CORNER RIBBON */
            .anketa-ribbon {
                position: absolute;
                top: 0;
                left: 0;
                padding: 6px 16px 6px 12px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.8px;
                text-transform: uppercase;
                background: var(--ribbon-bg, rgba(20,20,26,0.95));
                color: var(--ribbon-color, #FF5500);
                clip-path: polygon(0 0, 100% 0, 88% 100%, 0 100%);
                z-index: 3;
                border-bottom: 1px solid var(--ribbon-color, #FF5500);
            }

            /* WATERMARK (пустая) */
            .anketa-watermark {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 0;
                pointer-events: none;
            }

            .anketa-watermark svg {
                width: 120%;
                height: auto;
                opacity: 0.06;
                filter: blur(1px);
            }

            .anketa-card.filled .anketa-watermark {
                display: none;
            }

            /* КОНТЕНТ */
            .anketa-content {
                position: relative;
                z-index: 2;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            /* ЗАПОЛНЕННАЯ ИНФО */
            .anketa-info {
                text-align: center;
                width: 100%;
            }

            .anketa-rank {
                font-size: 28px;
                font-weight: 700;
                color: #FFFFFF;
                margin-bottom: 8px;
                line-height: 1.1;
                text-shadow: 0 2px 8px rgba(0,0,0,0.5);
            }

            .anketa-meta {
                font-size: 13px;
                color: rgba(255,255,255,0.6);
                display: flex;
                flex-direction: column;
                gap: 4px;
                line-height: 1.4;
            }

            .anketa-meta span {
                text-shadow: 0 1px 4px rgba(0,0,0,0.5);
            }

            /* ЗАТЕМНЕНИЕ СНИЗУ */
            .anketa-card.filled::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                z-index: 1;
                pointer-events: none;
                border-radius: 0 0 18px 18px;
            }

            /* КНОПКИ ВНУТРИ */
            .anketa-card-actions {
                position: absolute;
                bottom: 12px;
                left: 12px;
                right: 12px;
                display: flex;
                gap: 8px;
                z-index: 4;
            }

            .anketa-card-actions.single {
                justify-content: center;
            }

            .anketa-card-btn {
                flex: 1;
                height: 40px;
                border-radius: 10px;
                border: none;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .anketa-card-btn.create {
                background: #FF5500;
                color: #fff;
                box-shadow: 0 2px 8px rgba(255,85,0,0.25);
            }

            .anketa-card-btn.create:active {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255,85,0,0.35);
            }

            .anketa-card-btn.edit {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.08);
            }

            .anketa-card-btn.edit:active {
                background: rgba(255,255,255,0.15);
                transform: translateY(-1px);
            }

            .anketa-card-btn.delete {
                background: rgba(255,85,0,0.12);
                color: #FF5500;
                border: 1px solid rgba(255,85,0,0.15);
            }

            .anketa-card-btn.delete:active {
                background: rgba(255,85,0,0.2);
                transform: translateY(-1px);
            }

            /* АНИМАЦИЯ */
            @keyframes cardSlideUp {
                from { opacity: 0; transform: translateY(16px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* ЛАЙКИ */
            .anketa-likes-section {
                font-size: 14px;
                font-weight: 600;
                color: #fff;
                padding: 16px 16px 8px;
            }

            .anketa-like-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 10px;
            }

            .anketa-like-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 16px;
                color: #fff;
                overflow: hidden;
                flex-shrink: 0;
            }

            .anketa-like-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }

            .anketa-like-info {
                flex: 1;
            }

            .anketa-like-nick {
                font-size: 14px;
                font-weight: 600;
                color: #fff;
            }

            .anketa-like-mode {
                font-size: 12px;
                color: rgba(255,255,255,0.5);
            }

            .anketa-like-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: rgba(255,85,0,0.2);
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.2s ease;
            }

            .anketa-like-btn:active {
                background: rgba(255,85,0,0.4);
                transform: scale(1.1);
            }

            .anketa-like-arrow {
                font-size: 20px;
                opacity: 0.4;
            }
        `;
        document.head.appendChild(style);
    },

    switchTab(tab, element) {
        this.currentTab = tab;
        document.querySelectorAll('#anketaScreen .team-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');
        
        const myTab = document.getElementById('anketaMyTab');
        const likesTab = document.getElementById('anketaLikesTab');
        if (myTab) myTab.style.display = tab === 'my' ? 'block' : 'none';
        if (likesTab) likesTab.style.display = tab === 'likes' ? 'block' : 'none';
        
        if (tab === 'my') this.loadMyAnketas();
        else this.loadLikes();
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) {
            console.error('❌ Контейнер anketaMyTab не найден!');
            return;
        }
        console.log('📦 Контейнер найден');
        container.innerHTML = '<div class="anketa-loading">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty-text">Ошибка авторизации</div>';
            return;
        }

        const modes = [
            { id: 'faceit', name: 'FACEIT' },
            { id: 'premier', name: 'PREMIER' },
            { id: 'prime', name: 'PRIME' },
            { id: 'public', name: 'PUBLIC' }
        ];

        fetch(`${this.BACKEND_URL}/api/anketa/list?telegram_id=${telegram_id}`)
            .then(r => r.json())
            .then(anketaData => {
                const anketaMap = {};
                if (anketaData && anketaData.anketas) {
                    anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
                }

                const sorted = [...modes].sort((a, b) => 
                    (anketaMap[b.id] ? 1 : 0) - (anketaMap[a.id] ? 1 : 0)
                );

                let html = '<div class="anketa-scroll">';
                sorted.forEach((m, i) => {
                    html += this.buildSlot(m, anketaMap[m.id]);
                    if (i < sorted.length - 1) {
                        html += '<div class="anketa-divider"></div>';
                    }
                });
                html += '</div>';
                container.innerHTML = html;
                console.log('✅ Карточек отрисовано:', sorted.length);
            })
            .catch(err => {
                console.error('❌ Ошибка API:', err);
                let html = '<div class="anketa-scroll">';
                modes.forEach((m, i) => {
                    html += this.buildSlot(m, null);
                    if (i < modes.length - 1) {
                        html += '<div class="anketa-divider"></div>';
                    }
                });
                html += '</div>';
                container.innerHTML = html;
            });
    },

    // 🔥 СБОРКА СЛОТА (КАРТОЧКИ)
    buildSlot(mode, anketa) {
        const rc = this.RIBBON_COLORS[mode.id] || this.RIBBON_COLORS.faceit;

        // Ribbon
        const ribbonHTML = `<div class="anketa-ribbon" style="--ribbon-bg:${rc.bg};--ribbon-color:${rc.color};">${mode.name}</div>`;

        // Watermark (знак вопроса фоном)
        const watermarkHTML = `
            <div class="anketa-watermark">
                <svg viewBox="0 0 64 64" fill="none">
                    <path d="M22 24C22 18 27 14 32 14C38 14 42 18 42 23C42 28 38 30 35 32C33 33.5 32 35 32 38"
                          stroke="${rc.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="29" y="46" width="6" height="6" rx="1.5" fill="${rc.color}"/>
                </svg>
            </div>`;

        if (anketa) {
            // ========== ЗАПОЛНЕННАЯ КАРТОЧКА ==========
            return `
            <div class="anketa-card filled">
                ${ribbonHTML}
                <div class="anketa-content">
                    <div class="anketa-info">
                        <div class="anketa-rank">${anketa.rank || '—'}</div>
                        <div class="anketa-meta">
                            ${anketa.age ? `<span>${anketa.age} лет</span>` : ''}
                            ${anketa.about ? `<span>${anketa.about.substring(0, 60)}${anketa.about.length > 60 ? '…' : ''}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="anketa-card-actions">
                    <button class="anketa-card-btn edit" onclick="Anketa.editAnketa('${mode.id}')">Изменить</button>
                    <button class="anketa-card-btn delete" onclick="Anketa.deleteAnketa('${mode.id}')">Удалить</button>
                </div>
            </div>`;
        }

        // ========== ПУСТАЯ КАРТОЧКА ==========
        return `
        <div class="anketa-card empty">
            ${ribbonHTML}
            ${watermarkHTML}
            <div class="anketa-card-actions single">
                <button class="anketa-card-btn create" onclick="Anketa.goToMode('${mode.id}')">Создать анкету</button>
            </div>
        </div>`;
    },

    // 🔥 ПЕРЕХОД В РЕЖИМ ДЛЯ СОЗДАНИЯ АНКЕТЫ
    goToMode(modeId) {
        App.showScreen(modeId + 'Screen', true);
        setTimeout(() => {
            const btn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (btn) {
                btn.textContent = 'Создать анкету';
                btn.onclick = () => {
                    let v = '';
                    if (modeId === 'faceit') v = document.getElementById('faceitELOInput')?.value || '';
                    else if (modeId === 'premier') v = document.getElementById('premierRatingInput')?.value || '';
                    else if (modeId === 'prime') v = document.getElementById('primeRankSelect')?.value || '';
                    else v = document.getElementById('publicRankSelect')?.value || '';
                    
                    Search.startBrowse(modeId.toUpperCase(), v);
                    
                    setTimeout(() => {
                        App.showCustomPopup(
                            '✅ Анкета создана!',
                            'Смотреть анкеты других игроков?',
                            () => App.showScreen('swipeScreen', false),
                            () => App.showScreen('mainScreen', true),
                            'Смотреть',
                            'На главную',
                            false
                        );
                    }, 500);
                };
            }
        }, 300);
    },

    // 🔥 РЕДАКТИРОВАТЬ АНКЕТУ
    editAnketa(modeId) {
        this.goToMode(modeId);
    },

    // 🔥 УДАЛИТЬ АНКЕТУ
    deleteAnketa(modeId) {
        App.showCustomPopup(
            'Удалить анкету?',
            `Анкета ${modeId.toUpperCase()} будет удалена.`,
            () => {
                fetch(`${this.BACKEND_URL}/api/anketa/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegram_id: String(this.getTelegramId()),
                        mode: modeId
                    })
                })
                .then(r => r.json())
                .then(d => {
                    if (d.status === 'ok') this.loadMyAnketas();
                })
                .catch(() => {});
            },
            null,
            'Удалить',
            'Отмена',
            true
        );
    },

    // 🔥 ЗАГРУЗКА ЛАЙКОВ
    loadLikes() {
        const container = document.getElementById('anketaLikesTab');
        if (!container) return;
        
        container.innerHTML = '<div class="anketa-loading">Загрузка...</div>';
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty-text">Ошибка авторизации</div>';
            return;
        }

        fetch(`${this.BACKEND_URL}/api/likes/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(d => {
            if (d.status !== 'ok') {
                container.innerHTML = '<div class="anketa-empty-text">Ошибка загрузки</div>';
                return;
            }

            let html = '';

            if (d.mutual && d.mutual.length > 0) {
                html += '<div class="anketa-likes-section">❤️ Взаимные мэтчи</div>';
                d.mutual.forEach(m => { html += this.buildLikeItem(m, 'mutual'); });
            }

            if (d.liked_me && d.liked_me.length > 0) {
                html += '<div class="anketa-likes-section">👀 Тебя лайкнули</div>';
                d.liked_me.forEach(m => { html += this.buildLikeItem(m, 'liked_me'); });
            }

            if (d.i_liked && d.i_liked.length > 0) {
                html += '<div class="anketa-likes-section">👍 Ты лайкнул</div>';
                d.i_liked.forEach(m => { html += this.buildLikeItem(m, 'i_liked'); });
            }

            container.innerHTML = html || '<div class="anketa-empty-text">Пока нет лайков</div>';
        })
        .catch(() => {
            container.innerHTML = '<div class="anketa-empty-text">Ошибка загрузки</div>';
        });
    },

    // 🔥 ЭЛЕМЕНТ СПИСКА ЛАЙКОВ
    buildLikeItem(m, type) {
        const avatarHTML = m.avatar
            ? `<img src="${m.avatar}" alt="">`
            : (m.nick || '?')[0].toUpperCase();

        let actionHTML = '';
        if (type === 'mutual') {
            actionHTML = '<span class="anketa-like-arrow">→</span>';
        } else if (type === 'liked_me') {
            actionHTML = `<button class="anketa-like-btn" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️</button>`;
        } else {
            actionHTML = '<span class="anketa-like-arrow">→</span>';
        }

        return `
        <div class="anketa-like-item">
            <div class="anketa-like-avatar">${avatarHTML}</div>
            <div class="anketa-like-info">
                <div class="anketa-like-nick">${m.nick || 'Без имени'}</div>
                <div class="anketa-like-mode">${m.mode || ''} • ${m.rank || ''}</div>
            </div>
            ${actionHTML}
        </div>`;
    },

    // 🔥 ОТВЕТНЫЙ ЛАЙК
    likeBack(likerPlayerId) {
        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(this.getTelegramId()),
                liked_player_id: likerPlayerId
            })
        })
        .then(r => r.json())
        .then(d => {
            if (d.status === 'match') {
                App.showCustomPopup(
                    '❤️ Взаимный мэтч!',
                    'Проверь Telegram — бот прислал контакт!',
                    null, null, 'OK', '', false
                );
            }
            this.loadLikes();
        })
        .catch(() => {});
    }
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('anketaScreen')) {
        console.log('✅ anketaScreen найден, запускаю');
        Anketa.init();
    }
});

// Перехват showScreen
const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(screen, data) {
        origShow.call(window.App, screen, data);
        if (screen === 'anketaScreen') {
            console.log('🔄 Переключились на anketaScreen');
            setTimeout(() => Anketa.init(), 200);
        }
    };
}

window.Anketa = Anketa;
console.log('✅ Anketa v6.0 готов');

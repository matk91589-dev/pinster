// ============================================
// КАРТОЧКИ + ЛАЙКИ - Экран управления v12.6 FINAL
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v12.6 FINAL)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    RIBBON_COLORS: {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    },

    init() {
        console.log('🚀 Anketa.init() v12.6 FINAL');
        this.injectStyles();
        this.loadMyAnketas();
    },

    injectStyles() {
        if (document.getElementById('anketa-v12-styles')) return;
        const style = document.createElement('style');
        style.id = 'anketa-v12-styles';
        style.textContent = `
            .anketa-scroll {
                display: flex; flex-direction: column; gap: 0;
                overflow-y: auto; padding: 8px 16px 40px;
                -webkit-overflow-scrolling: touch; flex: 1; min-height: 0;
                scroll-behavior: smooth; scroll-snap-type: y mandatory;
            }
            .anketa-loading, .anketa-empty-text {
                text-align: center; padding: 40px 20px;
                color: rgba(255,255,255,0.35); font-size: 14px;
            }
            .anketa-divider-top {
                height: 2px; margin: 0 0 14px 0;
                background: rgba(255,255,255,0.10); border-radius: 1px; flex-shrink: 0;
            }
            .anketa-divider {
                height: 1px; margin: 14px 0;
                background: rgba(255,255,255,0.07); border-radius: 0.5px; flex-shrink: 0;
            }
            
            .anketa-card {
                position: relative; width: 100%; min-height: 340px;
                aspect-ratio: 4 / 5; border-radius: 18px; overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
                flex-shrink: 0; opacity: 0;
                animation: cardSlideUp 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
                scroll-snap-align: center;
                background-color: #0a0a0f;
                background-size: cover;
                background-position: center 20%;
                background-repeat: no-repeat;
            }
            
            .anketa-card.filled {
                background-size: cover;
                background-position: center 20%;
                background-repeat: no-repeat;
            }
            
            .anketa-card.filled::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 65%;
                background: linear-gradient(
                    to top,
                    rgba(0,0,0,0.98) 0%,
                    rgba(0,0,0,0.95) 25%,
                    rgba(0,0,0,0.85) 50%,
                    rgba(0,0,0,0.55) 75%,
                    rgba(0,0,0,0.0) 100%
                );
                z-index: 1;
                pointer-events: none;
            }
            
            .anketa-card.empty {
                background: linear-gradient(150deg, #16161c 0%, #131319 35%, #111117 65%, #14141a 100%);
                border: 1px solid rgba(255,255,255,0.04);
                box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02);
            }
            
            /* ТЕКСТОВЫЙ БЛОК — 2.5x от кнопки */
            .anketa-text-block {
                position: absolute;
                bottom: 68px;
                left: 16px;
                right: 16px;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                text-align: left;
                gap: 3px;
            }
            
            .anketa-id {
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 0.8px;
                color: #FF5500;
                text-transform: uppercase;
            }
            
            .anketa-nick {
                font-size: 28px;
                font-weight: 800;
                color: #FFFFFF;
                text-shadow: 0 2px 12px rgba(0,0,0,0.7);
                letter-spacing: -0.3px;
                line-height: 1.2;
                margin-top: 2px;
            }
            
            /* STATS ROW — белый, точки крупнее */
            .anketa-stats-row {
                font-size: 14px;
                font-weight: 500;
                color: #FFFFFF;
                display: flex;
                align-items: center;
                gap: 10px;
                white-space: nowrap;
                margin-top: 4px;
            }
            .anketa-stats-sep {
                color: rgba(255,255,255,0.6);
                font-size: 14px;
                font-weight: 700;
            }
            
            /* ABOUT — белый, крупнее, без наклона */
            .anketa-about {
                font-size: 14px;
                color: #FFFFFF;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                max-width: 100%;
                margin-top: 6px;
                font-weight: 400;
            }
            
            /* КНОПКА — В САМОМ НИЗУ */
            .anketa-profile-btn {
                position: absolute;
                bottom: 8px;
                left: 16px;
                right: 16px;
                z-index: 2;
                height: 40px;
                border-radius: 10px;
                border: 1px solid rgba(255,85,0,0.25);
                background: rgba(255,255,255,0.06);
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                transition: all 0.2s ease;
                letter-spacing: 0.3px;
                box-shadow: 0 0 18px rgba(255,85,0,0.12);
            }
            .anketa-profile-btn:active {
                background: rgba(255,85,0,0.1);
                border-color: rgba(255,85,0,0.4);
                box-shadow: 0 0 24px rgba(255,85,0,0.2);
                transform: scale(0.98);
            }
            
            .anketa-card-controls {
                position: absolute;
                top: 12px;
                right: 12px;
                z-index: 5;
                display: flex;
                flex-direction: column;
                gap: 8px;
                align-items: flex-end;
            }
            .anketa-control-link {
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                text-shadow: 0 1px 4px rgba(0,0,0,0.5);
                transition: opacity 0.15s ease;
                padding: 4px 8px;
                border-radius: 6px;
                background: rgba(0,0,0,0.35);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
            }
            .anketa-control-link:active {
                opacity: 0.7;
            }
            .anketa-control-link.edit {
                color: rgba(255,255,255,0.85);
            }
            .anketa-control-link.delete {
                color: rgba(255,100,100,0.85);
            }
            
            .anketa-card-actions {
                position: absolute; bottom: 12px; left: 12px; right: 12px;
                display: flex; gap: 8px; z-index: 4;
            }
            .anketa-card-actions.single { justify-content: center; }
            .anketa-card-btn {
                flex: 1; height: 42px; border-radius: 11px; border: none;
                font-size: 13px; font-weight: 600; cursor: pointer;
                transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
                text-align: center; display: flex; align-items: center; justify-content: center;
                letter-spacing: 0.2px;
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.25);
            }
            .anketa-card-btn:active {
                transform: translateY(1px) scale(0.98);
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
                transition: all 0.1s cubic-bezier(0.22, 0.61, 0.36, 1);
            }
            .anketa-card-btn.create {
                background: linear-gradient(135deg, #FF5500 0%, #FF6B20 100%); color: #fff;
            }
            .anketa-card-btn.create:active { box-shadow: inset 0 2px 6px rgba(0,0,0,0.35), 0 1px 4px rgba(255,85,0,0.2); }
            
            .anketa-ribbon {
                position: absolute; top: 0; left: 0; z-index: 5;
                padding: 7px 18px 6px 14px;
                font-size: 11px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase;
                background: var(--ribbon-bg, rgba(18,18,24,0.92)); color: var(--ribbon-color, #FF5500);
                clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                border-bottom: 1px solid var(--ribbon-color, #FF5500);
            }
            
            .anketa-card:hover, .anketa-card:active { 
                transform: scale(0.97) !important; 
                transition: transform 0.15s ease; 
            }
            
            .anketa-card:nth-child(1) { animation-delay: 0.00s; }
            .anketa-card:nth-child(2) { animation-delay: 0.07s; }
            .anketa-card:nth-child(3) { animation-delay: 0.14s; }
            .anketa-card:nth-child(4) { animation-delay: 0.21s; }
            .anketa-card:nth-child(5) { animation-delay: 0.28s; }
            .anketa-card:nth-child(6) { animation-delay: 0.35s; }
            .anketa-card:nth-child(7) { animation-delay: 0.42s; }
            .anketa-card:nth-child(8) { animation-delay: 0.49s; }
            
            @keyframes cardSlideUp {
                from { opacity: 0; transform: translateY(24px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .anketa-likes-section {
                font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9);
                padding: 16px 16px 8px; letter-spacing: 0.3px;
            }
            .anketa-like-item {
                display: flex; align-items: center; padding: 12px 16px; gap: 10px;
                border-radius: 12px; margin: 2px 8px; transition: background 0.2s ease;
            }
            .anketa-like-item:active { background: rgba(255,255,255,0.03); }
            .anketa-like-avatar {
                width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.08);
                display: flex; align-items: center; justify-content: center;
                font-weight: 700; font-size: 16px; color: #fff; overflow: hidden; flex-shrink: 0;
            }
            .anketa-like-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .anketa-like-info { flex: 1; }
            .anketa-like-nick { font-size: 14px; font-weight: 600; color: #fff; }
            .anketa-like-mode { font-size: 12px; color: rgba(255,255,255,0.45); }
            .anketa-like-btn {
                width: 40px; height: 40px; border-radius: 50%; border: none;
                background: rgba(255,85,0,0.15); font-size: 18px; cursor: pointer;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
                box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2);
            }
            .anketa-like-btn:active { background: rgba(255,85,0,0.3); transform: scale(0.92); }
            .anketa-like-arrow { font-size: 20px; opacity: 0.35; }
        `;
        document.head.appendChild(style);
    },

    switchTab(tab, element) {
        this.currentTab = tab;
        document.querySelectorAll('#anketaScreen .team-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');
        document.getElementById('anketaMyTab').style.display = tab === 'my' ? 'block' : 'none';
        document.getElementById('anketaLikesTab').style.display = tab === 'likes' ? 'block' : 'none';
        if (tab === 'my') this.loadMyAnketas();
        else this.loadLikes();
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    async loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) {
            console.error('❌ Контейнер anketaMyTab не найден!');
            return;
        }
        console.log('📦 Anketa v12.6 — загрузка...');
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

        try {
            const [profileRes, avatarRes, anketaRes, userRes] = await Promise.all([
                fetch(`${this.BACKEND_URL}/api/profile/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id) })
                }),
                fetch(`${this.BACKEND_URL}/api/profile/avatar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id) })
                }),
                fetch(`${this.BACKEND_URL}/api/anketa/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id) })
                }),
                fetch(`${this.BACKEND_URL}/api/user/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id) })
                })
            ]);

            const profileData = await profileRes.json();
            
            try {
                const avatarData = await avatarRes.json();
                profileData.avatar = avatarData.avatar || null;
            } catch(e) {
                profileData.avatar = null;
            }
            
            try {
                const userData = await userRes.json();
                profileData.player_id = userData.player_id || '';
            } catch(e) {}

            const anketaData = await anketaRes.json();
            
            console.log('👤 Профиль:', profileData);
            console.log('🖼 Аватар:', profileData.avatar);
            console.log('📋 Анкеты:', anketaData);

            const anketaMap = {};
            if (anketaData && anketaData.anketas) {
                anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
            }

            const sorted = [...modes].sort((a, b) => 
                (anketaMap[b.id] ? 1 : 0) - (anketaMap[a.id] ? 1 : 0)
            );

            let html = '<div class="anketa-scroll">';
            html += '<div class="anketa-divider-top"></div>';
            sorted.forEach((m, i) => {
                html += this.buildSlot(m, anketaMap[m.id], profileData);
                if (i < sorted.length - 1) {
                    html += '<div class="anketa-divider"></div>';
                }
            });
            html += '</div>';
            container.innerHTML = html;
            console.log('✅ Карточек отрисовано:', sorted.length);
            
        } catch (err) {
            console.error('❌ Ошибка API:', err);
            let html = '<div class="anketa-scroll">';
            html += '<div class="anketa-divider-top"></div>';
            modes.forEach((m, i) => {
                html += this.buildSlot(m, null, {});
                if (i < modes.length - 1) {
                    html += '<div class="anketa-divider"></div>';
                }
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },

    buildSlot(mode, anketa, profileData = {}) {
        const rc = this.RIBBON_COLORS[mode.id] || this.RIBBON_COLORS.faceit;
        const ribbonHTML = `<div class="anketa-ribbon" style="--ribbon-bg:${rc.bg};--ribbon-color:${rc.color};">${mode.name}</div>`;

        if (anketa) {
            const avatarUrl = profileData.avatar || '';
            const cardStyle = avatarUrl 
                ? `background-image: url(${avatarUrl});` 
                : '';
            
            const nick = profileData.nick || 'Player';
            const playerId = profileData.player_id || '';
            
            // 🔥 STATS: Mode • Rank • Age
            const statsParts = [];
            const modeName = mode.id === 'premier' ? 'Premier' : mode.name;
            statsParts.push(`<span>${modeName}</span>`);
            
            if (anketa.rank) {
                let rankText = anketa.rank;
                if (mode.id === 'faceit') {
                    // Faceit: добавляем "elo" маленькими
                    rankText = rankText.toLowerCase().includes('elo') 
                        ? rankText.toLowerCase() 
                        : `${rankText} elo`;
                } else if (mode.id === 'premier') {
                    // Premier: добавляем "rating"
                    rankText = rankText.toLowerCase().includes('rating') 
                        ? rankText 
                        : `${rankText} rating`;
                }
                statsParts.push(`<span>${rankText}</span>`);
            }
            
            if (anketa.age) {
                statsParts.push(`<span>${anketa.age} y.o.</span>`);
            }
            
            const aboutHTML = anketa.about && anketa.about.trim() 
                ? `<div class="anketa-about">${anketa.about.substring(0, 120)}${anketa.about.length > 120 ? '…' : ''}</div>`
                : '';
            
            let profileLink = '#';
            let buttonText = 'Open Steam профиль';
            
            if (mode.id === 'faceit' || mode.id === 'premier') {
                profileLink = profileData.faceit_link || anketa.link || '#';
                buttonText = 'Open Faceit профиль';
            } else {
                profileLink = profileData.steam_link || anketa.link || '#';
            }
            
            return `
            <div class="anketa-card filled" style="${cardStyle}">
                ${ribbonHTML}
                
                <div class="anketa-card-controls">
                    <span class="anketa-control-link edit" onclick="Anketa.editAnketa('${mode.id}')">Изменить</span>
                    <span class="anketa-control-link delete" onclick="Anketa.deleteAnketa('${mode.id}')">Удалить</span>
                </div>
                
                <div class="anketa-text-block">
                    ${playerId ? `<div class="anketa-id">ID ${playerId}</div>` : ''}
                    <div class="anketa-nick">${nick}</div>
                    <div class="anketa-stats-row">
                        ${statsParts.join(' <span class="anketa-stats-sep">•</span> ')}
                    </div>
                    ${aboutHTML}
                </div>
                
                <button class="anketa-profile-btn" 
                    onclick="Anketa.openProfileLink('${profileLink.replace(/'/g, "\\'")}', '${mode.id}')">
                    ${buttonText}
                </button>
            </div>`;
        }

        return `
        <div class="anketa-card empty">
            ${ribbonHTML}
            <div class="anketa-card-actions single">
                <button class="anketa-card-btn create" onclick="Anketa.goToMode('${mode.id}')">Создать карточку</button>
            </div>
        </div>`;
    },

    openProfileLink(link, modeId) {
        console.log('🔗 Открыть профиль:', link, 'режим:', modeId);
        if (!link || link === '#') {
            if (window.App?.showCustomPopup) {
                App.showCustomPopup(
                    'Ссылка не указана',
                    'Добавьте ссылку на профиль в настройках',
                    null, null, 'OK', '', false
                );
            }
            return;
        }
        
        if (window.Telegram?.WebApp?.openLink) {
            Telegram.WebApp.openLink(link);
        } else {
            window.open(link, '_blank');
        }
    },

    goToMode(modeId) {
        App.showScreen(modeId + 'Screen', true);
        setTimeout(() => {
            const btn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (btn) {
                btn.textContent = 'Создать карточку';
                btn.onclick = () => {
                    App.createCard(modeId);
                };
            }
        }, 300);
    },

    editAnketa(modeId) {
        this.goToMode(modeId);
    },

    deleteAnketa(modeId) {
        App.showCustomPopup(
            'Удалить карточку?',
            `Карточка ${modeId.toUpperCase()} будет удалена.`,
            () => {
                fetch(`${this.BACKEND_URL}/api/anketa/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(this.getTelegramId()), mode: modeId })
                })
                .then(r => r.json())
                .then(d => { if (d.status === 'ok') this.loadMyAnketas(); })
                .catch(() => {});
            },
            null, 'Удалить', 'Отмена', true
        );
    },

    loadLikes() {
        const container = document.getElementById('anketaLikesTab');
        if (!container) return;
        container.innerHTML = '<div class="anketa-loading">Загрузка...</div>';
        const telegram_id = this.getTelegramId();
        if (!telegram_id) { container.innerHTML = '<div class="anketa-empty-text">Ошибка авторизации</div>'; return; }

        fetch(`${this.BACKEND_URL}/api/likes/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(d => {
            if (d.status !== 'ok') { container.innerHTML = '<div class="anketa-empty-text">Ошибка загрузки</div>'; return; }
            let html = '';
            if (d.mutual?.length) { html += '<div class="anketa-likes-section">❤️ Взаимные мэтчи</div>'; d.mutual.forEach(m => html += this.buildLikeItem(m, 'mutual')); }
            if (d.liked_me?.length) { html += '<div class="anketa-likes-section">👀 Тебя лайкнули</div>'; d.liked_me.forEach(m => html += this.buildLikeItem(m, 'liked_me')); }
            if (d.i_liked?.length) { html += '<div class="anketa-likes-section">👍 Ты лайкнул</div>'; d.i_liked.forEach(m => html += this.buildLikeItem(m, 'i_liked')); }
            container.innerHTML = html || '<div class="anketa-empty-text">Пока нет лайков</div>';
        })
        .catch(() => { container.innerHTML = '<div class="anketa-empty-text">Ошибка загрузки</div>'; });
    },

    buildLikeItem(m, type) {
        const avatarHTML = m.avatar ? `<img src="${m.avatar}" alt="">` : (m.nick || '?')[0].toUpperCase();
        let actionHTML = '';
        if (type === 'mutual') actionHTML = '<span class="anketa-like-arrow">→</span>';
        else if (type === 'liked_me') actionHTML = `<button class="anketa-like-btn" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️</button>`;
        else actionHTML = '<span class="anketa-like-arrow">→</span>';
        return `<div class="anketa-like-item"><div class="anketa-like-avatar">${avatarHTML}</div><div class="anketa-like-info"><div class="anketa-like-nick">${m.nick||'Без имени'}</div><div class="anketa-like-mode">${m.mode||''} • ${m.rank||''}</div></div>${actionHTML}</div>`;
    },

    likeBack(likerPlayerId) {
        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(this.getTelegramId()), liked_player_id: likerPlayerId })
        })
        .then(r => r.json())
        .then(d => {
            if (d.status === 'match') App.showCustomPopup('❤️ Взаимный мэтч!', 'Проверь Telegram — бот прислал контакт!', null, null, 'OK', '', false);
            this.loadLikes();
        })
        .catch(() => {});
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('anketaScreen')) { console.log('✅ anketaScreen найден'); Anketa.init(); }
});

const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(screen, data) {
        origShow.call(window.App, screen, data);
        if (screen === 'anketaScreen') setTimeout(() => Anketa.init(), 200);
    };
}

window.Anketa = Anketa;
console.log('✅ Anketa v12.6 FINAL готов');

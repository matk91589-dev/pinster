// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v3.2
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v3.2)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    MODE_COLORS: {
        faceit: { color: '#FF5500', bg: 'rgba(255,85,0,0.15)' },
        premier: { color: '#FF5500', bg: 'rgba(255,85,0,0.15)' },
        prime: { color: '#FFFFFF', bg: 'rgba(255,255,255,0.12)' },
        public: { color: '#FFFFFF', bg: 'rgba(255,255,255,0.12)' }
    },

    init() {
        console.log('🚀 Anketa.init() v3.2');
        this.injectBadgeSharpStyle();
        this.loadMyAnketas();
    },

    // 🔥 ОСТРЫЙ БЕЙДЖ (clip-path бирка)
    injectBadgeSharpStyle() {
        if (document.getElementById('anketa-badge-sharp')) return;
        const style = document.createElement('style');
        style.id = 'anketa-badge-sharp';
        style.textContent = `
            .anketa-badge {
                clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), 85% 100%, 0 calc(100% - 6px));
                -webkit-clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), 85% 100%, 0 calc(100% - 6px));
            }
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

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) {
            console.error('❌ Контейнер anketaMyTab не найден!');
            return;
        }
        console.log('📦 Контейнер найден:', container);
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

        console.log('📡 Запрос к API...');
        fetch(`${this.BACKEND_URL}/api/anketa/list?telegram_id=${telegram_id}`)
            .then(r => r.json())
            .then(anketaData => {
                console.log('📡 Ответ API:', anketaData);
                const anketaMap = {};
                if (anketaData && anketaData.anketas) {
                    anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
                }

                const sorted = [...modes].sort((a, b) => (anketaMap[b.id] ? 1 : 0) - (anketaMap[a.id] ? 1 : 0));

                let html = '<div class="anketa-scroll">';
                sorted.forEach((m, i) => {
                    const a = anketaMap[m.id];
                    html += this.buildSlot(m, a);
                    if (i < sorted.length - 1) html += '<div class="anketa-divider"></div>';
                });
                html += '</div>';
                container.innerHTML = html;
                console.log('✅ HTML вставлен, карточек:', sorted.length);
            })
            .catch(err => {
                console.error('❌ Ошибка API, рисую заглушки:', err);
                let html = '<div class="anketa-scroll">';
                modes.forEach((m, i) => {
                    html += this.buildSlot(m, null);
                    if (i < modes.length - 1) html += '<div class="anketa-divider"></div>';
                });
                html += '</div>';
                container.innerHTML = html;
            });
    },

    buildSlot(mode, anketa) {
        const colors = this.MODE_COLORS[mode.id] || { color: '#FF5500', bg: 'rgba(255,85,0,0.15)' };

        // БЕЙДЖ (используем ТВОЙ класс .anketa-badge)
        const badgeHTML = `<div class="anketa-badge" style="--badge-bg:${colors.bg};--badge-color:${colors.color};">${mode.name}</div>`;

        if (anketa) {
            // ЗАПОЛНЕННАЯ КАРТОЧКА
            return `
            <div class="anketa-card filled">
                ${badgeHTML}
                <div class="anketa-content">
                    <div class="anketa-info">
                        <div class="anketa-rank">${anketa.rank || '—'}</div>
                        <div class="anketa-meta">
                            ${anketa.age ? `<span>${anketa.age} лет</span>` : ''}
                            ${anketa.about ? `<span>${anketa.about.substring(0, 60)}${anketa.about.length > 60 ? '…' : ''}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="anketa-actions">
                <button class="anketa-btn edit" onclick="Anketa.editAnketa('${mode.id}')">Редактировать</button>
                <button class="anketa-btn delete" onclick="Anketa.deleteAnketa('${mode.id}')">Удалить</button>
            </div>`;
        }

        // ПУСТАЯ КАРТОЧКА
        return `
        <div class="anketa-card empty">
            ${badgeHTML}
            <div class="anketa-content">
                <!-- ЗНАК ВОПРОСА (твой SVG) -->
                <svg class="anketa-question" viewBox="0 0 64 64" fill="none">
                    <path d="M22 24
                             C22 18 27 14 32 14
                             C38 14 42 18 42 23
                             C42 28 38 30 35 32
                             C33 33.5 32 35 32 38"
                          stroke="${colors.color}"
                          stroke-width="3.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <rect x="29" y="46" width="6" height="6" fill="${colors.color}" rx="1"/>
                </svg>
                <div class="anketa-empty-text">Нет анкеты</div>
            </div>
        </div>
        <div class="anketa-actions single">
            <button class="anketa-btn create" onclick="Anketa.goToMode('${mode.id}')">Создать анкету</button>
        </div>`;
    },

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
                    setTimeout(() => App.showCustomPopup('✅ Анкета создана!', 'Смотреть анкеты других игроков?',
                        () => App.showScreen('swipeScreen', false), () => App.showScreen('mainScreen', true), 'Смотреть', 'На главную', false), 500);
                };
            }
        }, 300);
    },

    editAnketa(modeId) { this.goToMode(modeId); },

    deleteAnketa(modeId) {
        App.showCustomPopup('Удалить анкету?', `Анкета ${modeId.toUpperCase()} будет удалена.`,
            () => fetch(`${this.BACKEND_URL}/api/anketa/delete`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({telegram_id: String(this.getTelegramId()), mode: modeId})
            }).then(r => r.json()).then(d => { if (d.status === 'ok') this.loadMyAnketas(); }).catch(() => {}),
            null, 'Удалить', 'Отмена', true);
    },

    loadLikes() {
        const c = document.getElementById('anketaLikesTab'); if (!c) return;
        c.innerHTML = '<div class="anketa-loading">Загрузка...</div>';
        const tid = this.getTelegramId(); if (!tid) { c.innerHTML = '<div class="anketa-empty-text">Ошибка</div>'; return; }
        fetch(`${this.BACKEND_URL}/api/likes/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(tid) })
        })
            .then(r => r.json()).then(d => {
                if (d.status !== 'ok') { c.innerHTML = '<div class="anketa-empty-text">Ошибка</div>'; return; }
                let h = '';
                if (d.mutual?.length) {
                    h += `<div class="likes-section-title">❤️ Взаимные мэтчи</div>`;
                    d.mutual.forEach(m => h += this.buildLikeItem(m, 'mutual'));
                }
                if (d.liked_me?.length) {
                    h += `<div class="likes-section-title">👀 Тебя лайкнули</div>`;
                    d.liked_me.forEach(m => h += this.buildLikeItem(m, 'liked_me'));
                }
                if (d.i_liked?.length) {
                    h += `<div class="likes-section-title">👍 Ты лайкнул</div>`;
                    d.i_liked.forEach(m => h += this.buildLikeItem(m, 'i_liked'));
                }
                c.innerHTML = h || '<div class="anketa-empty-text">Пока нет лайков</div>';
            }).catch(() => { c.innerHTML = '<div class="anketa-empty-text">Ошибка</div>'; });
    },

    buildLikeItem(m, type) {
        const av = m.avatar
            ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : (m.nick || '?')[0].toUpperCase();
        let btn = '';
        if (type === 'mutual') btn = '<span style="font-size:20px;opacity:0.5;">→</span>';
        else if (type === 'liked_me') btn = `<button class="anketa-btn edit" style="flex:none;width:40px;height:40px;padding:0;" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️</button>`;
        else btn = '<span style="font-size:20px;opacity:0.3;">→</span>';
        return `<div style="display:flex;align-items:center;padding:12px 16px;gap:10px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;overflow:hidden;flex-shrink:0;">${av}</div>
            <div style="flex:1;"><div style="font-size:14px;font-weight:600;color:#fff;">${m.nick||'Без имени'}</div><div style="font-size:12px;color:#8E97A6;">${m.mode||''} • ${m.rank||''}</div></div>
            ${btn}
        </div>`;
    },

    likeBack(likedPlayerId) {
        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(this.getTelegramId()), liked_player_id: likedPlayerId })
        })
            .then(r => r.json()).then(d => {
                if (d.status === 'match') App.showCustomPopup('❤️ Взаимный мэтч!', 'Проверь Telegram — бот прислал контакт!', null, null, 'OK', '', false);
                this.loadLikes();
            }).catch(() => { });
    }
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, ищем anketaScreen...');
    if (document.getElementById('anketaScreen')) {
        console.log('✅ anketaScreen найден, запускаю Anketa.init()');
        Anketa.init();
    } else {
        console.log('⏳ anketaScreen не найден, ждём...');
    }
});

// ПЕРЕХВАТ showScreen
const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function (s, d) {
        origShow.call(window.App, s, d);
        if (s === 'anketaScreen') {
            console.log('🔄 Переключились на anketaScreen');
            setTimeout(() => Anketa.init(), 200);
        }
    };
}

window.Anketa = Anketa;
console.log('✅ Anketa v3.2 готов к работе');

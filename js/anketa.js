// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v2.2
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v2.2)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Anketa.init() v2.2');
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

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }

        // Проверяем есть ли уже созданные анкеты
        fetch(`${this.BACKEND_URL}/api/profile/get`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(profile => {
            const avatarUrl = profile?.avatar || localStorage.getItem('profile_avatar') || null;

            const modes = [
                { id: 'faceit', name: 'FACEIT', cls: 'faceit' },
                { id: 'premier', name: 'PREMIER', cls: 'premier' },
                { id: 'prime', name: 'PRIME', cls: 'prime' },
                { id: 'public', name: 'PUBLIC', cls: 'public' }
            ];

            let html = '';

            // Центрированная надпись
            html += '<div class="anketa-empty">У вас нет созданных анкет</div>';

            // Разделитель
            html += '<div class="anketa-divider"></div>';

            // Плашки ТОЧНО ТАКИЕ ЖЕ как на главном экране
            html += '<div class="mode-container">';

            modes.forEach(m => {
                html += `
                <button class="mode-btn ${m.cls}" onclick="Anketa.goToMode('${m.id}')">
                    ${m.name}
                </button>`;
            });

            html += '</div>';

            container.innerHTML = html;
        })
        .catch(() => {
            let html = '<div class="anketa-empty">У вас нет созданных анкет</div>';
            html += '<div class="anketa-divider"></div>';
            html += '<div class="mode-container">';
            ['faceit','premier','prime','public'].forEach(m => {
                html += `
                <button class="mode-btn ${m}" onclick="Anketa.goToMode('${m}')">
                    ${m.toUpperCase()}
                </button>`;
            });
            html += '</div>';
            container.innerHTML = html;
        });
    },

    // 🔥 ПЕРЕХОД В РЕЖИМ (создать анкету или смотреть)
    goToMode(modeId) {
        // Переходим на экран режима
        App.showScreen(modeId + 'Screen', true);

        // Меняем кнопку "Смотреть анкеты" на "Создать анкету" если анкеты ещё нет
        setTimeout(() => {
            const searchBtn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (searchBtn) {
                // Проверяем есть ли анкета для этого режима
                const telegram_id = this.getTelegramId();
                fetch(`${this.BACKEND_URL}/api/anketa/next`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegram_id), mode: modeId })
                })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'empty' || data.status === 'error') {
                        // Нет анкет — меняем на "Создать анкету"
                        searchBtn.textContent = 'Создать анкету';
                        searchBtn.onclick = () => {
                            // Берём данные из полей и создаём анкету
                            const mode = document.querySelector(`#${modeId}Screen .mode-title`)?.textContent || modeId.toUpperCase();
                            let value = '';
                            if (modeId === 'faceit') value = document.getElementById('faceitELOInput')?.value || '';
                            else if (modeId === 'premier') value = document.getElementById('premierRatingInput')?.value || '';
                            else if (modeId === 'prime') value = document.getElementById('primeRankSelect')?.value || '';
                            else if (modeId === 'public') value = document.getElementById('publicRankSelect')?.value || '';

                            Search.startBrowse(mode, value);

                            // После создания показываем интерактивное окно
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
                    } else {
                        // Есть анкеты — "Смотреть анкеты"
                        searchBtn.textContent = 'Смотреть анкеты';
                        searchBtn.onclick = () => {
                            const mode = document.querySelector(`#${modeId}Screen .mode-title`)?.textContent || modeId.toUpperCase();
                            let value = '';
                            if (modeId === 'faceit') value = document.getElementById('faceitELOInput')?.value || '';
                            else if (modeId === 'premier') value = document.getElementById('premierRatingInput')?.value || '';
                            else if (modeId === 'prime') value = document.getElementById('primeRankSelect')?.value || '';
                            else if (modeId === 'public') value = document.getElementById('publicRankSelect')?.value || '';

                            Search.startBrowse(mode, value);
                        };
                    }
                });
            }
        }, 300);
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
                html += '<div class="likes-section-title" style="color:#4CAF50;">❤️ Взаимные мэтчи</div>';
                data.mutual.forEach(m => html += this.buildLikeItem(m, 'mutual'));
            }

            if (data.liked_me && data.liked_me.length > 0) {
                html += '<div class="likes-section-title" style="color:#FF5500;">👍 Тебя лайкнули</div>';
                data.liked_me.forEach(m => html += this.buildLikeItem(m, 'liked_me'));
            }

            if (data.i_liked && data.i_liked.length > 0) {
                html += '<div class="likes-section-title" style="color:#8E97A6;">💔 Ты лайкнул (ждут ответа)</div>';
                data.i_liked.forEach(m => html += this.buildLikeItem(m, 'i_liked'));
            }

            if (!html) {
                html = '<div class="anketa-empty">Пока нет лайков<br><br>Смотрите анкеты в любом режиме и лайкайте тиммейтов!</div>';
            }

            container.innerHTML = html;
        })
        .catch(() => {
            container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>';
        });
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

        return `
        <div class="like-item">
            <div class="like-item-avatar">${avatarHtml}</div>
            <div class="like-item-info">
                <div class="like-item-nick">${m.nick || 'Без имени'}</div>
                <div class="like-item-mode">${m.mode || ''} • ${m.rank || ''}</div>
            </div>
            ${actionBtn}
        </div>`;
    },

    likeBack(likedPlayerId) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;

        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegram_id),
                liked_player_id: likedPlayerId
            })
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('anketaScreen')) Anketa.init();
});

const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(screenId, updateNav) {
        origShow.call(window.App, screenId, updateNav);
        if (screenId === 'anketaScreen') setTimeout(() => Anketa.init(), 200);
    };
}

window.Anketa = Anketa;

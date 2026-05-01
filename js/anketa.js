// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v2.3
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v2.3)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Anketa.init() v2.3');
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

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ (ОДНА ПЛАШКА)
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }

        fetch(`${this.BACKEND_URL}/api/profile/get`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(profile => {
            let html = '';
            html += '<div class="anketa-empty">У вас нет созданных анкет</div>';
            html += '<div class="anketa-divider"></div>';
            html += '<div class="mode-container">';
            html += '<button class="mode-btn faceit" onclick="Anketa.goToCreateAnketa()">📝 Создать анкету</button>';
            html += '</div>';

            container.innerHTML = html;
        })
        .catch(() => {
            let html = '<div class="anketa-empty">У вас нет созданных анкет</div>';
            html += '<div class="anketa-divider"></div>';
            html += '<div class="mode-container">';
            html += '<button class="mode-btn faceit" onclick="Anketa.goToCreateAnketa()">📝 Создать анкету</button>';
            html += '</div>';
            container.innerHTML = html;
        });
    },

    // 🔥 ПЕРЕХОД НА ЭКРАН СОЗДАНИЯ АНКЕТЫ
    goToCreateAnketa() {
        App.showScreen('createAnketaScreen', true);

        setTimeout(() => {
            const modeSelect = document.getElementById('createAnketaMode');
            const placeholder = document.getElementById('createAnketaPlaceholder');
            const fields = document.getElementById('createAnketaFields');
            const ratingField = document.getElementById('createAnketaRatingField');
            const rankField = document.getElementById('createAnketaRankField');
            const linkField = document.getElementById('createAnketaLinkField');
            const subtitle = document.getElementById('createAnketaSubtitle');

            if (modeSelect) modeSelect.value = '';
            if (placeholder) placeholder.style.display = 'block';
            if (fields) fields.style.display = 'none';
            if (ratingField) ratingField.style.display = 'none';
            if (rankField) rankField.style.display = 'none';
            if (linkField) linkField.style.display = 'none';
            if (subtitle) subtitle.textContent = '*создаем новую анкету';

            // Подставляем возраст из профиля
            const savedAge = localStorage.getItem('profile_age') || (typeof Profile !== 'undefined' ? Profile.savedAge : '') || '';
            const ageInput = document.getElementById('createAnketaAge');
            if (ageInput && savedAge) ageInput.value = savedAge;

            // Подставляем ссылки из профиля
            const savedSteam = localStorage.getItem('profile_steam') || (typeof Profile !== 'undefined' ? Profile.savedSteam : '') || '';
            const savedFaceit = localStorage.getItem('profile_faceit') || (typeof Profile !== 'undefined' ? Profile.savedFaceitLink : '') || '';
            const linkInput = document.getElementById('createAnketaLinkInput');
            if (linkInput) linkInput.value = savedSteam || savedFaceit || '';
        }, 100);
    },

    // 🔥 ВЫБОР РЕЖИМА — ПОКАЗЫВАЕМ НУЖНЫЕ ПОЛЯ
    onModeChange() {
        const mode = document.getElementById('createAnketaMode').value;
        const placeholder = document.getElementById('createAnketaPlaceholder');
        const fields = document.getElementById('createAnketaFields');
        const ratingField = document.getElementById('createAnketaRatingField');
        const rankField = document.getElementById('createAnketaRankField');
        const linkField = document.getElementById('createAnketaLinkField');
        const ratingLabel = document.getElementById('createAnketaRatingLabel');
        const ratingInput = document.getElementById('createAnketaRatingInput');
        const linkLabel = document.getElementById('createAnketaLinkLabel');
        const linkInput = document.getElementById('createAnketaLinkInput');
        const subtitle = document.getElementById('createAnketaSubtitle');

        if (!mode) {
            if (placeholder) placeholder.style.display = 'block';
            if (fields) fields.style.display = 'none';
            return;
        }

        if (placeholder) placeholder.style.display = 'none';
        if (fields) fields.style.display = 'block';

        if (mode === 'faceit') {
            if (subtitle) subtitle.textContent = '*создаем анкету для FACEIT';
            if (ratingField) ratingField.style.display = 'block';
            if (rankField) rankField.style.display = 'none';
            if (ratingLabel) ratingLabel.innerHTML = 'Faceit ELO <span>*обязательно</span>';
            if (ratingInput) { ratingInput.placeholder = '0-5000'; ratingInput.maxLength = 4; }
            if (linkField) linkField.style.display = 'block';
            if (linkLabel) linkLabel.textContent = 'Ссылка Faceit';
            if (linkInput) linkInput.placeholder = 'Ссылка на Faceit';
        } else if (mode === 'premier') {
            if (subtitle) subtitle.textContent = '*создаем анкету для PREMIER';
            if (ratingField) ratingField.style.display = 'block';
            if (rankField) rankField.style.display = 'none';
            if (ratingLabel) ratingLabel.innerHTML = 'CS Rating <span>*обязательно</span>';
            if (ratingInput) { ratingInput.placeholder = '0-40000'; ratingInput.maxLength = 5; }
            if (linkField) linkField.style.display = 'block';
            if (linkLabel) linkLabel.textContent = 'Ссылка Steam';
            if (linkInput) linkInput.placeholder = 'Ссылка на Steam';
        } else if (mode === 'prime') {
            if (subtitle) subtitle.textContent = '*создаем анкету для PRIME';
            if (ratingField) ratingField.style.display = 'none';
            if (rankField) rankField.style.display = 'block';
            if (linkField) linkField.style.display = 'block';
            if (linkLabel) linkLabel.textContent = 'Ссылка Steam';
            if (linkInput) linkInput.placeholder = 'Ссылка на Steam';
        } else if (mode === 'public') {
            if (subtitle) subtitle.textContent = '*создаем анкету для PUBLIC';
            if (ratingField) ratingField.style.display = 'none';
            if (rankField) rankField.style.display = 'block';
            if (linkField) linkField.style.display = 'block';
            if (linkLabel) linkLabel.textContent = 'Ссылка Steam';
            if (linkInput) linkInput.placeholder = 'Ссылка на Steam';
        }

        // Подставляем ссылку под режим
        const savedSteam = localStorage.getItem('profile_steam') || (typeof Profile !== 'undefined' ? Profile.savedSteam : '') || '';
        const savedFaceit = localStorage.getItem('profile_faceit') || (typeof Profile !== 'undefined' ? Profile.savedFaceitLink : '') || '';
        if (linkInput) {
            linkInput.value = (mode === 'faceit') ? savedFaceit : savedSteam;
        }
    },

    // 🔥 ОТПРАВКА АНКЕТЫ
    submitAnketa() {
        const mode = document.getElementById('createAnketaMode').value;
        const age = document.getElementById('createAnketaAge')?.value || '';
        const about = document.getElementById('createAnketaAbout')?.value || '';
        const linkInput = document.getElementById('createAnketaLinkInput')?.value || '';

        let rank = '';
        if (mode === 'faceit' || mode === 'premier') {
            rank = document.getElementById('createAnketaRatingInput')?.value || '';
        } else {
            rank = document.getElementById('createAnketaRankSelect')?.value || '';
        }

        if (!mode) { App.showAlert('Выберите режим'); return; }
        if (!age) { App.showAlert('Укажите возраст'); return; }
        if (!rank || rank === 'Выберите ранг') {
            const msg = (mode === 'faceit') ? 'Укажите Faceit ELO' : (mode === 'premier') ? 'Укажите CS Rating' : 'Выберите ранг';
            App.showAlert(msg);
            return;
        }

        const telegram_id = this.getTelegramId();
        if (!telegram_id) { App.showAlert('Ошибка авторизации'); return; }

        const body = {
            telegram_id: String(telegram_id),
            mode: mode,
            rank: String(rank),
            age: age,
            about: about
        };

        if (mode === 'faceit') {
            body.faceit_link = linkInput;
        } else {
            body.steam_link = linkInput;
        }

        fetch(`${this.BACKEND_URL}/api/anketa/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'ok') {
                App.showCustomPopup(
                    '✅ Анкета создана!',
                    'Теперь вы можете смотреть анкеты других игроков.',
                    () => {
                        Search.startBrowse(mode.toUpperCase(), rank);
                        App.showScreen('swipeScreen', false);
                    },
                    () => { App.showScreen('mainScreen', true); },
                    'Смотреть анкеты',
                    'На главную',
                    false
                );
            } else {
                App.showAlert(data.message || 'Ошибка создания анкеты');
            }
        })
        .catch(() => { App.showAlert('Ошибка соединения'); });
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

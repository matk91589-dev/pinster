// ============================================
// ПОИСК / ПРОСМОТР КАРТОЧЕК - Pingster v3.0
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v3.0)');

const Search = {
    currentMode: '',
    isBrowsing: false,
    likedPlayerIds: new Set(),

    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Search.init() v3.0');
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    getProfileData() {
        if (window.Profile) {
            return {
                age: window.Profile.savedAge || '',
                steam: window.Profile.savedSteam || '',
                faceit: window.Profile.savedFaceitLink || ''
            };
        }
        return {
            age: localStorage.getItem('profile_age') || '',
            steam: localStorage.getItem('profile_steam') || '',
            faceit: localStorage.getItem('profile_faceit') || ''
        };
    },

    // 🔥 ЗАПУСК ПРОСМОТРА — НЕ ТРОГАЕТ БД, ТОЛЬКО ЧИТАЕТ
    startBrowse(mode, rankValue) {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            if (window.App) App.showAlert('Ошибка авторизации');
            return;
        }

        this.currentMode = mode.toLowerCase();
        this.likedPlayerIds.clear();

        console.log(`🔍 Запуск просмотра: mode=${this.currentMode}`);

        // Сразу показываем экран свайпа и загружаем первую анкету
        if (window.App) {
            App.showScreen('swipeScreen', false);
        }

        this.showNextAnketa(telegramId, this.currentMode);
    },

    // 🔥 ПОЛУЧИТЬ СЛЕДУЮЩУЮ КАРТОЧКУ
    showNextAnketa(telegramId, mode) {
        console.log(`📡 Запрос следующей анкеты: mode=${mode}`);

        fetch(`${this.BACKEND_URL}/api/anketa/next`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegramId),
                mode: mode
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('📡 Ответ next:', data);
            if (data.status === 'ok' && data.anketa) {
                this.showSwipe(data.anketa);
            } else if (data.status === 'empty') {
                if (typeof Swipe !== 'undefined' && Swipe.showToast) {
                    Swipe.showToast('Карточки закончились 😔');
                }
                setTimeout(() => {
                    if (window.App) App.showScreen('mainScreen', true);
                }, 1500);
            } else {
                console.error('Ошибка next:', data);
                if (window.App) App.showScreen('mainScreen', true);
            }
        })
        .catch(err => {
            console.error('❌ Ошибка next:', err);
            if (window.App) App.showScreen('mainScreen', true);
        });
    },

    showSwipe(anketa) {
        // Показываем экран свайпа
        if (window.App) {
            App.showScreen('swipeScreen', false);
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('swipeScreen')?.classList.add('active');
        }

        // Отдаём анкету в Swipe
        setTimeout(() => {
            if (typeof Swipe !== 'undefined') {
                Swipe.startWithAnketa(anketa, this.currentMode);
            }
        }, 100);
    },

    // 🔥 ЛАЙК
    likePlayer(likedPlayerId, callback) {
        const telegramId = this.getTelegramId();
        if (!telegramId) return;

        this.likedPlayerIds.add(likedPlayerId);

        fetch(`${this.BACKEND_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegramId),
                liked_player_id: String(likedPlayerId)
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('❤️ Лайк ответ:', data);
            if (callback) callback(data);
        })
        .catch(err => {
            console.error('❌ Ошибка лайка:', err);
            if (callback) callback(null);
        });
    }
};

window.Search = Search;
Search.init();

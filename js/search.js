// ============================================
// ПОИСК / ПРОСМОТР КАРТОЧЕК - Pingster v3.2 FAST
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v3.2 FAST)');

const Search = {
    currentMode: '',
    isBrowsing: false,
    likedPlayerIds: new Set(),
    
    // 🔥 КЭШ АНКЕТ — предзагружаем все при старте
    anketaCache: {},
    cacheLoaded: false,
    currentIndex: 0,

    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Search.init() v3.2 FAST');
        this.preloadAllAnketas();
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    // 🔥 ПРЕДЗАГРУЗКА ВСЕХ АНКЕТ ПРИ СТАРТЕ
    preloadAllAnketas() {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            setTimeout(() => this.preloadAllAnketas(), 1000);
            return;
        }

        console.log('📡 Предзагрузка анкет для всех режимов...');
        
        const modes = ['faceit', 'premier', 'prime', 'public'];
        let loaded = 0;

        modes.forEach(mode => {
            fetch(`${this.BACKEND_URL}/api/anketa/next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: String(telegramId),
                    mode: mode
                })
            })
            .then(r => r.json())
            .then(data => {
                loaded++;
                if (data.status === 'ok' && data.anketa) {
                    if (!this.anketaCache[mode]) this.anketaCache[mode] = [];
                    this.anketaCache[mode].push(data.anketa);
                }
                
                if (loaded >= modes.length) {
                    this.cacheLoaded = true;
                    console.log('✅ Предзагрузка завершена:', 
                        Object.keys(this.anketaCache).map(k => `${k}: ${this.anketaCache[k].length}`).join(', '));
                }
            })
            .catch(() => {
                loaded++;
                if (loaded >= modes.length) this.cacheLoaded = true;
            });
        });
    },

    // 🔥 ЗАГРУЗИТЬ ЕЩЁ ОДНУ АНКЕТУ ДЛЯ РЕЖИМА
    loadOneMore(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) return;

        // Добавляем уже лайкнутых в исключение
        const excludeIds = Array.from(this.likedPlayerIds);
        
        fetch(`${this.BACKEND_URL}/api/anketa/next`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegramId),
                mode: mode
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'ok' && data.anketa) {
                if (!this.anketaCache[mode]) this.anketaCache[mode] = [];
                // Не добавляем дубликаты
                const exists = this.anketaCache[mode].find(a => a.player_id === data.anketa.player_id);
                if (!exists) {
                    this.anketaCache[mode].push(data.anketa);
                }
            }
        })
        .catch(() => {});
    },

    // 🔥 ЗАПУСК ПРОСМОТРА — МГНОВЕННО
    startBrowse(mode, rankValue) {
        const modeLower = mode.toLowerCase();
        this.currentMode = modeLower;
        this.likedPlayerIds.clear();
        this.currentIndex = 0;

        console.log(`🔍 Запуск просмотра: mode=${modeLower}, в кэше: ${(this.anketaCache[modeLower] || []).length}`);

        // Показываем экран свайпа мгновенно
        if (window.App) {
            App.showScreen('swipeScreen', false);
        }

        // Достаём из кэша
        const cached = this.anketaCache[modeLower] || [];
        
        if (cached.length > 0) {
            // Есть в кэше — показываем мгновенно
            setTimeout(() => {
                this.showSwipe(cached[0]);
            }, 200);
        } else {
            // Нет в кэше — грузим
            const telegramId = this.getTelegramId();
            if (telegramId) {
                this.showNextAnketa(telegramId, modeLower);
            }
        }
    },

    // 🔥 ПОЛУЧИТЬ СЛЕДУЮЩУЮ КАРТОЧКУ
    showNextAnketa(telegramId, mode) {
        this.currentIndex++;

        // Проверяем кэш сначала
        const cached = this.anketaCache[mode] || [];
        if (this.currentIndex < cached.length) {
            console.log(`🃏 Из кэша: ${this.currentIndex + 1}/${cached.length}`);
            this.showSwipe(cached[this.currentIndex]);
            return;
        }

        console.log(`📡 Запрос новой анкеты: mode=${mode}`);
        
        // Грузим из API
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
            if (data.status === 'ok' && data.anketa) {
                // Добавляем в кэш
                if (!this.anketaCache[mode]) this.anketaCache[mode] = [];
                const exists = this.anketaCache[mode].find(a => a.player_id === data.anketa.player_id);
                if (!exists) {
                    this.anketaCache[mode].push(data.anketa);
                }
                this.showSwipe(data.anketa);
            } else if (data.status === 'empty') {
                if (typeof Swipe !== 'undefined' && Swipe.showToast) {
                    Swipe.showToast('Карточки закончились 😔');
                }
                setTimeout(() => {
                    if (window.App) App.showScreen('mainScreen', true);
                }, 1500);
            }
        })
        .catch(err => {
            console.error('❌ Ошибка next:', err);
            if (window.App) App.showScreen('mainScreen', true);
        });
    },

    showSwipe(anketa) {
        if (typeof Swipe !== 'undefined') {
            Swipe.startWithAnketa(anketa, this.currentMode);
        }
    },

    // 🔥 ЛАЙК
    likePlayer(likedPlayerId, callback) {
        const telegramId = this.getTelegramId();
        if (!telegramId) return;

        this.likedPlayerIds.add(String(likedPlayerId));

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
            console.log('❤️ Лайк ответ:', data.status);
            if (callback) callback(data);
        })
        .catch(err => {
            console.error('❌ Ошибка лайка:', err);
            if (callback) callback(null);
        });
    },

    // 🔥 ОЧИСТИТЬ КЭШ (вызывать при создании новой карточки)
    clearCache() {
        this.anketaCache = {};
        this.cacheLoaded = false;
        this.preloadAllAnketas();
    }
};

window.Search = Search;
Search.init();

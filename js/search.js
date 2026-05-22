// ============================================
// ПОИСК / ПРОСМОТР КАРТОЧЕК - Pingster v3.3 FAST
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v3.3 FAST)');

const Search = {
    currentMode: '',
    isBrowsing: false,
    likedPlayerIds: new Set(),
    
    // 🔥 КЭШ АНКЕТ
    anketaCache: {},
    cacheLoaded: false,
    currentIndex: 0,
    
    // 🔥 ОЧЕРЕДЬ ЗАГРУЗКИ
    loadingQueue: {},
    isLoading: {},

    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Search.init() v3.3 FAST');
        // 🔥 Загружаем кэш из DeviceStorage если есть
        this.loadCacheFromStorage();
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    // 🔥 ЗАГРУЗКА КЭША ИЗ DEVICE STORAGE (МГНОВЕННО)
    loadCacheFromStorage() {
        if (window.loadFromDeviceStorage) {
            window.loadFromDeviceStorage('anketa_cache', (data) => {
                if (data && data.cache && data.timestamp) {
                    // Кэш валиден 5 минут
                    if (Date.now() - data.timestamp < 300000) {
                        this.anketaCache = data.cache;
                        this.cacheLoaded = true;
                        console.log('📱 Кэш из DeviceStorage:', 
                            Object.keys(this.anketaCache).map(k => `${k}: ${this.anketaCache[k]?.length || 0}`).join(', '));
                        return;
                    }
                }
                // Если кэша нет или устарел — грузим свежий
                this.preloadAllAnketas();
            });
        } else {
            // Фолбек на localStorage
            try {
                const cached = localStorage.getItem('anketa_cache');
                if (cached) {
                    const data = JSON.parse(cached);
                    if (Date.now() - data.timestamp < 300000) {
                        this.anketaCache = data.cache;
                        this.cacheLoaded = true;
                        console.log('💾 Кэш из localStorage');
                        return;
                    }
                }
            } catch(e) {}
            this.preloadAllAnketas();
        }
    },

    // 🔥 СОХРАНЕНИЕ КЭША
    saveCache() {
        const cacheData = {
            cache: this.anketaCache,
            timestamp: Date.now()
        };
        
        // В DeviceStorage
        if (window.saveToDeviceStorage) {
            window.saveToDeviceStorage('anketa_cache', cacheData);
        }
        
        // Фолбек в localStorage
        try {
            localStorage.setItem('anketa_cache', JSON.stringify(cacheData));
        } catch(e) {}
    },

    // 🔥 ПРЕДЗАГРУЗКА ВСЕХ АНКЕТ (ПАРАЛЛЕЛЬНО)
    preloadAllAnketas() {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            setTimeout(() => this.preloadAllAnketas(), 1000);
            return;
        }

        console.log('📡 Предзагрузка анкет...');
        
        const modes = ['faceit', 'premier', 'prime', 'public'];
        let loaded = 0;

        // 🔥 Параллельная загрузка всех режимов
        modes.forEach(mode => {
            // Загружаем по 3 анкеты на режим для быстрого свайпа
            this.fetchMultipleAnketas(telegramId, mode, 3, () => {
                loaded++;
                if (loaded >= modes.length) {
                    this.cacheLoaded = true;
                    this.saveCache();
                    console.log('✅ Предзагрузка завершена:', 
                        Object.keys(this.anketaCache).map(k => `${k}: ${this.anketaCache[k]?.length || 0}`).join(', '));
                }
            });
        });
    },

    // 🔥 ЗАГРУЗКА НЕСКОЛЬКИХ АНКЕТ ПОДРЯД
    fetchMultipleAnketas(telegramId, mode, count, callback) {
        if (this.isLoading[mode]) return;
        this.isLoading[mode] = true;
        
        if (!this.anketaCache[mode]) this.anketaCache[mode] = [];
        
        let fetched = 0;
        
        const fetchNext = () => {
            if (fetched >= count) {
                this.isLoading[mode] = false;
                if (callback) callback();
                return;
            }
            
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
                fetched++;
                if (data.status === 'ok' && data.anketa) {
                    const exists = this.anketaCache[mode].find(a => a.player_id === data.anketa.player_id);
                    if (!exists) {
                        this.anketaCache[mode].push(data.anketa);
                    }
                }
                
                if (data.status === 'empty' || fetched >= count) {
                    this.isLoading[mode] = false;
                    if (callback) callback();
                } else {
                    // 🔥 Небольшая задержка между запросами чтобы не спамить API
                    setTimeout(fetchNext, 100);
                }
            })
            .catch(() => {
                fetched++;
                if (fetched >= count) {
                    this.isLoading[mode] = false;
                    if (callback) callback();
                } else {
                    setTimeout(fetchNext, 200);
                }
            });
        };
        
        fetchNext();
    },

    // 🔥 ЗАГРУЗИТЬ ЕЩЁ ОДНУ (ФОНОВО)
    loadOneMore(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) return;
        if (this.isLoading[mode]) return;

        // Если в кэше меньше 2 — догружаем
        const cached = this.anketaCache[mode] || [];
        if (cached.length >= 3) return;

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
                const exists = this.anketaCache[mode].find(a => a.player_id === data.anketa.player_id);
                if (!exists) {
                    this.anketaCache[mode].push(data.anketa);
                    this.saveCache();
                }
            }
        })
        .catch(() => {});
    },

    // 🔥 ЗАПУСК ПРОСМОТРА
    startBrowse(mode, rankValue) {
        const modeLower = mode.toLowerCase();
        this.currentMode = modeLower;
        this.likedPlayerIds.clear();
        this.currentIndex = 0;

        console.log(`🔍 Просмотр: ${modeLower}, в кэше: ${(this.anketaCache[modeLower] || []).length}`);

        // Показываем экран свайпа
        if (window.App) {
            App.showScreen('swipeScreen', false);
        }

        const cached = this.anketaCache[modeLower] || [];
        
        if (cached.length > 0) {
            setTimeout(() => {
                this.showSwipe(cached[0]);
            }, 150); // 🔥 150ms вместо 200ms
        } else {
            const telegramId = this.getTelegramId();
            if (telegramId) {
                this.showNextAnketa(telegramId, modeLower);
            }
        }
        
        // 🔥 Фоновая догрузка
        this.loadOneMore(modeLower);
    },

    // 🔥 ПОЛУЧИТЬ СЛЕДУЮЩУЮ КАРТОЧКУ
    showNextAnketa(telegramId, mode) {
        this.currentIndex++;

        const cached = this.anketaCache[mode] || [];
        
        // 🔥 Если осталась 1 карточка — догружаем
        if (cached.length - this.currentIndex <= 1) {
            this.loadOneMore(mode);
        }
        
        if (this.currentIndex < cached.length) {
            console.log(`🃏 Кэш: ${this.currentIndex + 1}/${cached.length}`);
            this.showSwipe(cached[this.currentIndex]);
            return;
        }

        console.log(`📡 API запрос: ${mode}`);
        
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
                if (!this.anketaCache[mode]) this.anketaCache[mode] = [];
                const exists = this.anketaCache[mode].find(a => a.player_id === data.anketa.player_id);
                if (!exists) {
                    this.anketaCache[mode].push(data.anketa);
                    this.saveCache();
                }
                this.showSwipe(data.anketa);
            } else if (data.status === 'empty') {
                this.showEmptyState();
            }
        })
        .catch(err => {
            console.error('❌ Ошибка:', err);
            this.showEmptyState();
        });
    },

    // 🔥 ПОКАЗАТЬ ЧТО КАРТОЧКИ ЗАКОНЧИЛИСЬ
    showEmptyState() {
        if (typeof Swipe !== 'undefined' && Swipe._toast) {
            Swipe._toast('Карточки закончились');
        }
        setTimeout(() => {
            if (window.App) App.showScreen('mainScreen', true);
        }, 1500);
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
            console.log('❤️ Лайк:', data.status);
            
            // 🔥 Если мэтч — передаём match_info в колбэк
            if (callback) callback(data);
            
            // 🔥 Очищаем кэш после лайка (чтобы не показывать повторно)
            if (this.currentMode) {
                const cached = this.anketaCache[this.currentMode] || [];
                this.anketaCache[this.currentMode] = cached.filter(
                    a => a.player_id !== likedPlayerId
                );
                this.saveCache();
            }
        })
        .catch(err => {
            console.error('❌ Ошибка лайка:', err);
            if (callback) callback(null);
        });
    },

    // 🔥 ОЧИСТИТЬ КЭШ
    clearCache() {
        this.anketaCache = {};
        this.cacheLoaded = false;
        this.saveCache();
        this.preloadAllAnketas();
    }
};

window.Search = Search;
Search.init();

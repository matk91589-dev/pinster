// ============================================
// АНКЕТЫ + ЛАЙКИ - Pingster v2.0
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v2.0 - ANKETA MODE)');

const Search = {
    currentMode: '',
    isBrowsing: false,
    likedPlayerIds: new Set(),
    
    init() {
        console.log('🚀 Search.init() v2.0');
        this.hookIntoScreenChange();
    },

    hookIntoScreenChange() {
        const waitForApp = setInterval(() => {
            if (window.App && window.App.showScreen) {
                clearInterval(waitForApp);
                
                const originalShow = window.App.showScreen;
                const self = this;
                
                window.App.showScreen = function(screenId, updateNav) {
                    originalShow.call(window.App, screenId, updateNav);
                    
                    setTimeout(() => {
                        if (screenId === 'faceitScreen') {
                            self.fillFaceitScreen();
                        } else if (screenId === 'premierScreen') {
                            self.fillPremierScreen();
                        } else if (screenId === 'primeScreen') {
                            self.fillPrimeScreen();
                        } else if (screenId === 'publicScreen') {
                            self.fillPublicScreen();
                        }
                    }, 100);
                };
            }
        }, 50);
    },
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    getPlayerId() {
        return localStorage.getItem('player_id') || null;
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
    
    fillFaceitScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('faceitAgeValue');
        const faceitInput = document.getElementById('faceitLinkInput');
        if (ageInput && p.age) ageInput.value = p.age;
        if (faceitInput && p.faceit) faceitInput.value = p.faceit;
    },
    
    fillPremierScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('premierAgeValue');
        const steamInput = document.getElementById('premierSteamInput');
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
    },
    
    fillPrimeScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('primeAgeValue');
        const steamInput = document.getElementById('primeSteamInput');
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
    },
    
    fillPublicScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('publicAgeValue');
        const steamInput = document.getElementById('publicSteamInput');
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
    },

    // 🔥 ЗАПУСК ПРОСМОТРА АНКЕТ (вместо поиска)
    startBrowse(mode, value) {
        this.currentMode = mode;
        this.likedPlayerIds.clear();
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            App.showAlert('Ошибка авторизации');
            return;
        }
        
        // Создаём/обновляем анкету
        const data = this.collectData(mode);
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/anketa/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegram_id),
                mode: mode.toLowerCase(),
                rank: String(data.rating || data.rank),
                age: data.age || undefined,
                steam_link: data.steam_link || undefined,
                faceit_link: data.faceit_link || undefined,
                about: data.comment || ''
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'ok') {
                this.showNextAnketa(telegram_id, mode);
            } else {
                App.showAlert(res.message || 'Ошибка создания анкеты');
            }
        })
        .catch(() => {
            App.showAlert('Ошибка соединения');
        });
    },
    
    // 🔥 ПОЛУЧИТЬ СЛЕДУЮЩУЮ АНКЕТУ
    showNextAnketa(telegram_id, mode) {
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/anketa/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegram_id),
                mode: mode.toLowerCase()
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && data.anketa) {
                this.showSwipe(data.anketa);
            } else if (data.status === 'empty') {
                // Анкеты кончились
                if (typeof Swipe !== 'undefined' && Swipe.showToastMessage) {
                    Swipe.showToastMessage('Анкеты закончились, заходи позже', false);
                }
                setTimeout(() => App.showScreen('mainScreen', true), 1000);
            }
        })
        .catch(() => {
            App.showScreen('mainScreen', true);
        });
    },
    
    collectData(mode) {
        const data = { age: 0, steam_link: '', faceit_link: '', rating: 0, rank: '', comment: '' };
        
        if (mode === 'FACEIT') {
            data.rating = parseInt(document.getElementById('faceitELOInput')?.value) || 0;
            data.age = parseInt(document.getElementById('faceitAgeValue')?.value) || 0;
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
            data.comment = document.getElementById('faceitComment')?.value || '';
        } else if (mode === 'PREMIER') {
            data.rating = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.comment = document.getElementById('premierComment')?.value || '';
        } else if (mode === 'PRIME') {
            data.rank = document.getElementById('primeRankSelect')?.value || '';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        } else if (mode === 'PUBLIC') {
            data.rank = document.getElementById('publicRankSelect')?.value || '';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.comment = document.getElementById('publicComment')?.value || '';
        }
        
        const steamFromStorage = localStorage.getItem('profile_steam');
        const faceitFromStorage = localStorage.getItem('profile_faceit');
        if (!data.steam_link && steamFromStorage) data.steam_link = steamFromStorage;
        if (!data.faceit_link && faceitFromStorage) data.faceit_link = faceitFromStorage;
        
        return data;
    },
    
    showSwipe(anketa) {
        if (window.App && window.App.showScreen) {
            window.App.showScreen('swipeScreen', false);
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('swipeScreen')?.classList.add('active');
        }
        
        if (typeof Swipe !== 'undefined') {
            Swipe.startWithAnketa(anketa, this.currentMode);
        } else {
            App.showScreen('mainScreen', true);
        }
    },
    
    // 🔥 ЛАЙК
    likePlayer(likedPlayerId, callback) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegram_id),
                liked_player_id: likedPlayerId
            })
        })
        .then(res => res.json())
        .then(data => {
            this.likedPlayerIds.add(likedPlayerId);
            if (callback) callback(data);
        })
        .catch(() => {
            if (callback) callback(null);
        });
    }
};

window.Search = Search;
Search.init();

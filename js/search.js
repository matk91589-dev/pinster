// ============================================
// ПОИСК - v2.5 FINAL (ПРЯМОЕ ЗАПОЛНЕНИЕ)
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v2.5 FINAL)');

// Константы валидации
const SEARCH_VALIDATION = {
    FACEIT: { min: 0, max: 5000 },
    PREMIER: { min: 0, max: 40000 },
    AGE: { min: 0, max: 100 }
};

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    pollingInterval: null,
    currentMatchId: null,
    matchTimerInterval: null,
    blockUntil: null,
    waitingForPartner: false,
    matchEndTime: null,
    myResponse: null,
    isSearching: false,
    processedMatchIds: new Set(),
    
    validationErrors: {
        age: false,
        rating: false,
        rank: false
    },
    
    init() {
        this.resetTimer();
        console.log('Search.init()');
        this.ensureMatchAccepted();
        setTimeout(() => this.startPolling(), 1000);
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('activated', () => {
                console.log('App activated, checking match...');
                this.checkMatchStatus();
            });
        }
        
        // Переопределяем функцию перехода на экраны
        this.overrideShowScreen();
    },
    
    // ========== ПЕРЕОПРЕДЕЛЯЕМ SHOWSCREEN ==========
    overrideShowScreen() {
        if (!window.App) {
            setTimeout(() => this.overrideShowScreen(), 100);
            return;
        }
        
        const originalShow = window.App.showScreen;
        const self = this;
        
        window.App.showScreen = function(screenId, updateNav) {
            originalShow.call(window.App, screenId, updateNav);
            
            // Заполняем поля при открытии экранов
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
            }, 50);
        };
        
        console.log('✅ ShowScreen переопределён');
    },
    
    ensureMatchAccepted() {
        if (!window.MatchAccepted) {
            window.MatchAccepted = {
                chatLink: null,
                teammateInfo: null,
                show(teammateInfo, chatLink) {
                    if (window.Telegram?.WebApp?.openTelegramLink && chatLink) {
                        window.Telegram.WebApp.openTelegramLink(chatLink);
                    }
                    App.showScreen('mainScreen', true);
                }
            };
        }
    },
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    // ========== ПОЛУЧЕНИЕ ДАННЫХ ИЗ ПРОФИЛЯ ==========
    getProfileData() {
        // Берём напрямую из localStorage
        const age = localStorage.getItem('profile_age') || '';
        const steam = localStorage.getItem('profile_steam') || '';
        const faceit = localStorage.getItem('profile_faceit') || '';
        
        console.log('📦 localStorage данные:', { age, steam, faceit });
        
        return { age, steam, faceit };
    },
    
    // ========== ЗАПОЛНЕНИЕ ЭКРАНОВ ==========
    fillFaceitScreen() {
        const profile = this.getProfileData();
        console.log('📋 FACEIT заполнение:', profile);
        
        const ageInput = document.getElementById('faceitAgeValue');
        const faceitInput = document.getElementById('faceitLinkInput');
        
        if (ageInput) {
            ageInput.value = profile.age || '';
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (faceitInput) {
            faceitInput.value = profile.faceit || '';
        }
        
        this.setupLiveValidation('FACEIT');
    },
    
    fillPremierScreen() {
        const profile = this.getProfileData();
        console.log('📋 PREMIER заполнение:', profile);
        
        const ageInput = document.getElementById('premierAgeValue');
        const steamInput = document.getElementById('premierSteamInput');
        
        if (ageInput) {
            ageInput.value = profile.age || '';
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput) {
            steamInput.value = profile.steam || '';
        }
        
        this.setupLiveValidation('PREMIER');
    },
    
    fillPrimeScreen() {
        const profile = this.getProfileData();
        console.log('📋 PRIME заполнение:', profile);
        
        const ageInput = document.getElementById('primeAgeValue');
        const steamInput = document.getElementById('primeSteamInput');
        
        if (ageInput) {
            ageInput.value = profile.age || '';
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput) {
            steamInput.value = profile.steam || '';
        }
        
        this.setupLiveValidation('PRIME');
    },
    
    fillPublicScreen() {
        const profile = this.getProfileData();
        console.log('📋 PUBLIC заполнение:', profile);
        
        const ageInput = document.getElementById('publicAgeValue');
        const steamInput = document.getElementById('publicSteamInput');
        
        if (ageInput) {
            ageInput.value = profile.age || '';
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput) {
            steamInput.value = profile.steam || '';
        }
        
        this.setupLiveValidation('PUBLIC');
    },
    
    // ========== ВАЛИДАЦИЯ ==========
    validateAge(age) {
        if (!age || age === '') return true; // Пустое поле не красим красным сразу
        const ageNum = parseInt(age, 10);
        return !isNaN(ageNum) && ageNum >= SEARCH_VALIDATION.AGE.min && ageNum <= SEARCH_VALIDATION.AGE.max;
    },
    
    validateRating(rating, mode) {
        if (!rating || rating === '') return true;
        const ratingNum = parseInt(rating, 10);
        const limits = mode === 'FACEIT' ? SEARCH_VALIDATION.FACEIT : SEARCH_VALIDATION.PREMIER;
        return !isNaN(ratingNum) && ratingNum >= limits.min && ratingNum <= limits.max;
    },
    
    validateRank(rank) {
        return rank && rank !== '' && rank !== 'Выберите ранг';
    },
    
    updateFieldError(input, isValid) {
        if (!input) return;
        
        if (!isValid && input.value.trim() !== '') {
            input.style.color = '#FF3B30';
            input.style.borderColor = '#FF3B30';
        } else {
            input.style.color = '';
            input.style.borderColor = '';
        }
    },
    
    setupLiveValidation(mode) {
        // Возраст
        let ageInput;
        if (mode === 'FACEIT') ageInput = document.getElementById('faceitAgeValue');
        else if (mode === 'PREMIER') ageInput = document.getElementById('premierAgeValue');
        else if (mode === 'PRIME') ageInput = document.getElementById('primeAgeValue');
        else if (mode === 'PUBLIC') ageInput = document.getElementById('publicAgeValue');
        
        if (ageInput) {
            ageInput.oninput = () => {
                const isValid = this.validateAge(ageInput.value);
                this.updateFieldError(ageInput, isValid);
            };
        }
        
        // Рейтинг/ранг
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            if (ratingInput) {
                ratingInput.oninput = () => {
                    const isValid = this.validateRating(ratingInput.value, 'FACEIT');
                    this.updateFieldError(ratingInput, isValid);
                };
            }
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            if (ratingInput) {
                ratingInput.oninput = () => {
                    const isValid = this.validateRating(ratingInput.value, 'PREMIER');
                    this.updateFieldError(ratingInput, isValid);
                };
            }
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            if (rankSelect) {
                rankSelect.onchange = () => {
                    const isValid = this.validateRank(rankSelect.value);
                    this.updateFieldError(rankSelect, isValid);
                };
            }
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            if (rankSelect) {
                rankSelect.onchange = () => {
                    const isValid = this.validateRank(rankSelect.value);
                    this.updateFieldError(rankSelect, isValid);
                };
            }
        }
    },
    
    setStyle(style, element) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.style-option');
        options.forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        
        localStorage.setItem('selected_style', style);
        
        if (window.Settings) Settings.click();
    },
    
    // ========== ЗАПУСК ПОИСКА ==========
    start(mode, value) {
        console.log('🔍 Search.start:', mode);
        if (window.Settings) Settings.click();
        
        // Проверяем валидность
        if (!this.isFormValid(mode)) {
            if (typeof Profile !== 'undefined' && Profile.showToast) {
                Profile.showToast('Исправьте ошибки в полях', true);
            } else {
                App.showAlert('Исправьте ошибки в полях');
            }
            return;
        }
        
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.processedMatchIds.clear();
        this.currentMode = mode;
        
        const data = this.collectSearchData(mode);
        this.doStartSearch(mode, data);
    },
    
    isFormValid(mode) {
        let ageInput;
        if (mode === 'FACEIT') ageInput = document.getElementById('faceitAgeValue');
        else if (mode === 'PREMIER') ageInput = document.getElementById('premierAgeValue');
        else if (mode === 'PRIME') ageInput = document.getElementById('primeAgeValue');
        else if (mode === 'PUBLIC') ageInput = document.getElementById('publicAgeValue');
        
        // Возраст обязателен
        if (ageInput && !this.validateAge(ageInput.value)) return false;
        if (ageInput && ageInput.value.trim() === '') return false;
        
        // Рейтинг/ранг обязателен
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            if (!ratingInput || ratingInput.value.trim() === '') return false;
            if (!this.validateRating(ratingInput.value, 'FACEIT')) return false;
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            if (!ratingInput || ratingInput.value.trim() === '') return false;
            if (!this.validateRating(ratingInput.value, 'PREMIER')) return false;
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            if (!rankSelect || !this.validateRank(rankSelect.value)) return false;
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            if (!rankSelect || !this.validateRank(rankSelect.value)) return false;
        }
        
        return true;
    },
    
    collectSearchData(mode) {
        const data = {
            style: 'fan',
            age: 0,
            steam_link: '',
            faceit_link: '',
            rating: 0,
            rank: '',
            comment: ''
        };
        
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) {
            data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        }
        
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
        
        return data;
    },
    
    doStartSearch(mode, data) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            App.showAlert('Ошибка авторизации');
            return;
        }
        
        App.showScreen('searchScreen', true);
        
        const modeTitle = document.getElementById('searchModeTitle');
        if (modeTitle) modeTitle.textContent = mode;
        
        this.resetTimer();
        this.startTimer();
        
        const payload = {
            telegram_id: telegram_id,
            mode: mode.toLowerCase(),
            rating_value: String(data.rating || data.rank),
            style: data.style,
            age: data.age,
            steam_link: data.steam_link || null,
            faceit_link: data.faceit_link || null,
            comment: data.comment || ''
        };
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'searching') {
                this.startPolling();
            } else if (data.status === 'match_found') {
                this.showSwipeScreen(data);
            } else {
                App.showAlert(data.message || 'Ошибка поиска');
                App.showScreen('mainScreen', true);
            }
        })
        .catch(() => {
            App.showAlert('Ошибка соединения');
            App.showScreen('mainScreen', true);
        });
    },
    
    startPolling() {
        if (this.pollingInterval) return;
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        if (!this.isSearching) return;
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.match_found && !this.processedMatchIds.has(data.match_id)) {
                this.processedMatchIds.add(data.match_id);
                this.stopPolling();
                this.showSwipeScreen(data);
            }
        })
        .catch(e => console.error('Poll error:', e));
    },
    
    showSwipeScreen(data) {
        this.currentMatchId = data.match_id;
        this.isSearching = false;
        
        if (typeof Swipe !== 'undefined') {
            Swipe.startWithOpponent(data.opponent, data.match_id, data.expires_at);
        } else {
            App.showScreen('mainScreen', true);
        }
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },
    
    startTimer() {
        this.seconds = 0;
        this.updateDisplay();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    },
    
    updateDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timer = document.getElementById('searchTimer');
        if (timer) {
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    
    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.seconds = 0;
        this.updateDisplay();
    },
    
    cancel() {
        this.resetTimer();
        this.stopPolling();
        this.isSearching = false;
        
        const telegram_id = this.getTelegramId();
        if (telegram_id) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id })
            });
        }
        
        App.showScreen('mainScreen', true);
    }
};

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    window.Search = Search;
    Search.init();
});

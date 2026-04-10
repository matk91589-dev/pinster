// ============================================
// ПОИСК - v2.4 FINAL (АВТОЗАПОЛНЕНИЕ ПРИ ОТКРЫТИИ ЭКРАНА)
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v2.4 FINAL)');

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
        this.interceptScreenOpens();
        setTimeout(() => this.startPolling(), 1000);
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('activated', () => {
                console.log('App activated, checking match...');
                this.checkMatchStatus();
            });
        }
    },
    
    // ========== ПЕРЕХВАТ ОТКРЫТИЯ ЭКРАНОВ ==========
    interceptScreenOpens() {
        if (!window.App) return;
        
        const originalShowScreen = window.App.showScreen;
        const self = this;
        
        window.App.showScreen = function(screenId, updateNav) {
            originalShowScreen.call(window.App, screenId, updateNav);
            
            // Заполняем поля при открытии экранов режимов
            setTimeout(() => {
                if (screenId === 'faceitScreen') {
                    self.fillFaceitFields();
                    self.setupLiveValidation('FACEIT');
                } else if (screenId === 'premierScreen') {
                    self.fillPremierFields();
                    self.setupLiveValidation('PREMIER');
                } else if (screenId === 'primeScreen') {
                    self.fillPrimeFields();
                    self.setupLiveValidation('PRIME');
                } else if (screenId === 'publicScreen') {
                    self.fillPublicFields();
                    self.setupLiveValidation('PUBLIC');
                }
            }, 50);
        };
        
        console.log('✅ Перехват открытия экранов настроен');
    },
    
    ensureMatchAccepted() {
        if (!window.MatchAccepted) {
            window.MatchAccepted = {
                chatLink: null,
                teammateInfo: null,
                show(teammateInfo, chatLink) {
                    console.log('MatchAccepted.show', teammateInfo, chatLink);
                    if (window.Telegram?.WebApp?.openTelegramLink && chatLink) {
                        window.Telegram.WebApp.openTelegramLink(chatLink);
                    }
                    App.showScreen('mainScreen', true);
                },
                goToChat() {
                    if (this.chatLink) window.location.href = this.chatLink;
                },
                clear() {
                    this.chatLink = null;
                    this.teammateInfo = null;
                }
            };
        }
    },
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    // ========== ПОЛУЧЕНИЕ ДАННЫХ ИЗ ПРОФИЛЯ ==========
    getProfileData() {
        const age = localStorage.getItem('profile_age') || '';
        const steam = localStorage.getItem('profile_steam') || '';
        const faceit = localStorage.getItem('profile_faceit') || '';
        
        console.log('📦 Данные из localStorage:', { age, steam, faceit });
        
        if (!age && window.Profile && window.Profile.savedAge) {
            return {
                age: window.Profile.savedAge || '',
                steam: window.Profile.savedSteam || '',
                faceit: window.Profile.savedFaceitLink || ''
            };
        }
        
        return { age, steam, faceit };
    },
    
    // ========== ЗАПОЛНЕНИЕ ПОЛЕЙ ==========
    fillFaceitFields() {
        const profileData = this.getProfileData();
        console.log('📋 Заполнение FACEIT:', profileData);
        
        const ageInput = document.getElementById('faceitAgeValue');
        const faceitInput = document.getElementById('faceitLinkInput');
        
        if (ageInput && profileData.age) {
            ageInput.value = profileData.age;
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (faceitInput && profileData.faceit) {
            faceitInput.value = profileData.faceit;
        }
        
        const ratingInput = document.getElementById('faceitELOInput');
        if (ratingInput) {
            this.updateFieldError(ratingInput, this.validateRating(ratingInput.value, 'FACEIT'));
        }
    },
    
    fillPremierFields() {
        const profileData = this.getProfileData();
        console.log('📋 Заполнение PREMIER:', profileData);
        
        const ageInput = document.getElementById('premierAgeValue');
        const steamInput = document.getElementById('premierSteamInput');
        
        if (ageInput && profileData.age) {
            ageInput.value = profileData.age;
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput && profileData.steam) {
            steamInput.value = profileData.steam;
        }
        
        const ratingInput = document.getElementById('premierRatingInput');
        if (ratingInput) {
            this.updateFieldError(ratingInput, this.validateRating(ratingInput.value, 'PREMIER'));
        }
    },
    
    fillPrimeFields() {
        const profileData = this.getProfileData();
        console.log('📋 Заполнение PRIME:', profileData);
        
        const ageInput = document.getElementById('primeAgeValue');
        const steamInput = document.getElementById('primeSteamInput');
        
        if (ageInput && profileData.age) {
            ageInput.value = profileData.age;
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput && profileData.steam) {
            steamInput.value = profileData.steam;
        }
        
        const rankSelect = document.getElementById('primeRankSelect');
        if (rankSelect) {
            this.updateFieldError(rankSelect, this.validateRank(rankSelect.value));
        }
    },
    
    fillPublicFields() {
        const profileData = this.getProfileData();
        console.log('📋 Заполнение PUBLIC:', profileData);
        
        const ageInput = document.getElementById('publicAgeValue');
        const steamInput = document.getElementById('publicSteamInput');
        
        if (ageInput && profileData.age) {
            ageInput.value = profileData.age;
            this.updateFieldError(ageInput, this.validateAge(ageInput.value));
        }
        if (steamInput && profileData.steam) {
            steamInput.value = profileData.steam;
        }
        
        const rankSelect = document.getElementById('publicRankSelect');
        if (rankSelect) {
            this.updateFieldError(rankSelect, this.validateRank(rankSelect.value));
        }
    },
    
    // ========== ВАЛИДАЦИЯ ==========
    validateAge(age) {
        if (!age || age === '') return false;
        const ageNum = parseInt(age, 10);
        return !isNaN(ageNum) && ageNum >= SEARCH_VALIDATION.AGE.min && ageNum <= SEARCH_VALIDATION.AGE.max;
    },
    
    validateRating(rating, mode) {
        if (!rating || rating === '') return false;
        const ratingNum = parseInt(rating, 10);
        const limits = mode === 'FACEIT' ? SEARCH_VALIDATION.FACEIT : SEARCH_VALIDATION.PREMIER;
        return !isNaN(ratingNum) && ratingNum >= limits.min && ratingNum <= limits.max;
    },
    
    validateRank(rank) {
        return rank && rank !== '' && rank !== 'Выберите ранг';
    },
    
    // ========== ДИНАМИЧЕСКАЯ ПОДСВЕТКА ОШИБОК ==========
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
    
    // ========== ЖИВАЯ ВАЛИДАЦИЯ ПРИ ВВОДЕ ==========
    setupLiveValidation(mode) {
        // Возраст
        let ageInput;
        if (mode === 'FACEIT') ageInput = document.getElementById('faceitAgeValue');
        else if (mode === 'PREMIER') ageInput = document.getElementById('premierAgeValue');
        else if (mode === 'PRIME') ageInput = document.getElementById('primeAgeValue');
        else if (mode === 'PUBLIC') ageInput = document.getElementById('publicAgeValue');
        
        if (ageInput) {
            ageInput.removeEventListener('input', ageInput._handler);
            ageInput._handler = () => {
                const isValid = this.validateAge(ageInput.value);
                this.validationErrors.age = !isValid;
                this.updateFieldError(ageInput, isValid);
            };
            ageInput.addEventListener('input', ageInput._handler);
        }
        
        // Рейтинг/ранг
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            if (ratingInput) {
                ratingInput.removeEventListener('input', ratingInput._handler);
                ratingInput._handler = () => {
                    const isValid = this.validateRating(ratingInput.value, 'FACEIT');
                    this.validationErrors.rating = !isValid;
                    this.updateFieldError(ratingInput, isValid);
                };
                ratingInput.addEventListener('input', ratingInput._handler);
            }
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            if (ratingInput) {
                ratingInput.removeEventListener('input', ratingInput._handler);
                ratingInput._handler = () => {
                    const isValid = this.validateRating(ratingInput.value, 'PREMIER');
                    this.validationErrors.rating = !isValid;
                    this.updateFieldError(ratingInput, isValid);
                };
                ratingInput.addEventListener('input', ratingInput._handler);
            }
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            if (rankSelect) {
                rankSelect.removeEventListener('change', rankSelect._handler);
                rankSelect._handler = () => {
                    const isValid = this.validateRank(rankSelect.value);
                    this.validationErrors.rank = !isValid;
                    this.updateFieldError(rankSelect, isValid);
                };
                rankSelect.addEventListener('change', rankSelect._handler);
            }
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            if (rankSelect) {
                rankSelect.removeEventListener('change', rankSelect._handler);
                rankSelect._handler = () => {
                    const isValid = this.validateRank(rankSelect.value);
                    this.validationErrors.rank = !isValid;
                    this.updateFieldError(rankSelect, isValid);
                };
                rankSelect.addEventListener('change', rankSelect._handler);
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
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },
    
    // ========== ГЛАВНЫЙ МЕТОД ЗАПУСКА ==========
    start(mode, value) {
        console.log('🔍 Search.start called:', mode);
        if (window.Settings) Settings.click();
        
        if (this.blockUntil && Date.now() < this.blockUntil) {
            const waitSeconds = Math.ceil((this.blockUntil - Date.now()) / 1000);
            App.showAlert(`Подождите ${waitSeconds} секунд`);
            return;
        }
        
        // Проверяем валидность
        if (!this.isFormValid(mode)) {
            if (window.Settings) Settings.error();
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
        
        if (ageInput && !this.validateAge(ageInput.value)) return false;
        
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            if (ratingInput && !this.validateRating(ratingInput.value, 'FACEIT')) return false;
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            if (ratingInput && !this.validateRating(ratingInput.value, 'PREMIER')) return false;
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            if (rankSelect && !this.validateRank(rankSelect.value)) return false;
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            if (rankSelect && !this.validateRank(rankSelect.value)) return false;
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
        } else {
            const savedStyle = localStorage.getItem('selected_style');
            if (savedStyle) data.style = savedStyle;
        }
        
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            data.rating = parseInt(ratingInput?.value) || 0;
            data.age = parseInt(document.getElementById('faceitAgeValue')?.value) || 0;
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
            data.comment = document.getElementById('faceitComment')?.value || '';
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            data.rating = parseInt(ratingInput?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.comment = document.getElementById('premierComment')?.value || '';
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            data.rank = rankSelect?.value || '';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            data.rank = rankSelect?.value || '';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.comment = document.getElementById('publicComment')?.value || '';
        }
        
        return data;
    },
    
    doStartSearch(mode, data) {
        console.log('🚀 Запуск поиска:', mode, data);
        
        this.currentMode = mode;
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.currentMatchId = null;
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            App.showAlert('Ошибка авторизации');
            return;
        }
        
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => screen.classList.remove('active'));
        
        const searchScreen = document.getElementById('searchScreen');
        if (searchScreen) searchScreen.classList.add('active');
        
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
        
        console.log('📤 Отправляем:', payload);
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.status === 'searching') {
                this.startPolling();
            } else if (data.status === 'match_found') {
                this.showSwipeScreen(data);
            } else if (data.status === 'error') {
                App.showAlert(data.message || 'Ошибка поиска');
                App.showScreen('mainScreen', true);
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            App.showAlert('Ошибка соединения с сервером');
            App.showScreen('mainScreen', true);
        });
    },
    
    startPolling() {
        if (this.pollingInterval) return;
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        if (!this.isSearching && !this.waitingForPartner) return;
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegram_id })
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            
            if (data.match_found && !this.processedMatchIds.has(data.match_id)) {
                this.processedMatchIds.add(data.match_id);
                
                if (this.waitingForPartner) {
                    this.updateWaitingStatus(data);
                } else {
                    this.stopPolling();
                    localStorage.setItem('opponentData', JSON.stringify(data.opponent));
                    localStorage.setItem('matchExpiresAt', data.expires_at);
                    localStorage.setItem('currentMatchId', data.match_id);
                    this.showSwipeScreen(data);
                }
            }
        })
        .catch(error => console.error('Error checking match:', error));
    },
    
    showSwipeScreen(data) {
        if (window.Settings) Settings.match();
        
        if (data.opponent) {
            data.opponent.mode = this.currentMode;
        } else {
            data.opponent = { mode: this.currentMode };
        }
        
        this.currentMatchId = data.match_id;
        this.myResponse = null;
        this.isSearching = false;
        this.waitingForPartner = false;
    
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => screen.classList.remove('active'));
        
        const swipeScreen = document.getElementById('swipeScreen');
        if (swipeScreen) {
            swipeScreen.classList.add('active');
        } else {
            App.showScreen('mainScreen', true);
            return;
        }
        
        setTimeout(() => {
            if (typeof Swipe !== 'undefined' && Swipe.startWithOpponent) {
                Swipe.startWithOpponent(data.opponent, this.currentMatchId, data.expires_at, data.server_time);
            } else {
                App.showScreen('mainScreen', true);
            }
        }, 100);
    },
    
    updateWaitingStatus(data) {
        if (data.opponent_response === 'reject') {
            this.handlePartnerReject();
        } else if (data.opponent_response === 'accept' && this.myResponse === 'accept') {
            this.handleBothAccepted();
        }
    },
    
    handlePartnerReject() {
        if (window.Settings) Settings.error();
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
        this.waitingForPartner = false;
        this.isSearching = true;
        this.currentMatchId = null;
        App.showAlert('Собеседник отклонил приглашение');
        App.showScreen('mainScreen', true);
    },
    
    handleBothAccepted() {
        if (window.Settings) Settings.success();
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
        this.stopPolling();
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
        console.log('Отмена поиска');
        if (window.Settings) Settings.error();
        this.resetTimer();
        this.stopPolling();
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = false;
        this.currentMatchId = null;
        this.processedMatchIds.clear();
        
        const telegram_id = this.getTelegramId();
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegram_id })
        })
        .catch(error => console.error('Error stopping search:', error))
        .finally(() => {
            App.showScreen('mainScreen', true);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Search: DOM загружен');
    window.Search = Search;
    Search.init();
});

console.log('✅ SEARCH.JS ЗАГРУЖЕН');

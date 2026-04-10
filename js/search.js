// ============================================
// ПОИСК - v2.1 FINAL (БЫСТРОЕ АВТОЗАПОЛНЕНИЕ)
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v2.1 FINAL)');

// Константы валидации
const SEARCH_VALIDATION = {
    FACEIT: { min: 0, max: 5000, error: '0-5000' },
    PREMIER: { min: 0, max: 40000, error: '0-40000' },
    AGE: { min: 0, max: 100, error: '0-100' }
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
    
    // ========== ПОЛУЧЕНИЕ ДАННЫХ ИЗ ПРОФИЛЯ (МГНОВЕННО) ==========
    getProfileData() {
        // Сначала пробуем взять из Profile объекта
        if (window.Profile) {
            return {
                age: window.Profile.savedAge || '',
                steam: window.Profile.savedSteam || '',
                faceit: window.Profile.savedFaceitLink || '',
                nick: window.Profile.savedName || ''
            };
        }
        
        // Fallback на localStorage
        return {
            age: localStorage.getItem('profile_age') || '',
            steam: localStorage.getItem('profile_steam') || '',
            faceit: localStorage.getItem('profile_faceit') || '',
            nick: localStorage.getItem('profile_nick') || ''
        };
    },
    
    // ========== ВАЛИДАЦИЯ ==========
    validateAge(age) {
        if (!age || age === '') {
            return { valid: false, error: 'обязательно' };
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < SEARCH_VALIDATION.AGE.min || ageNum > SEARCH_VALIDATION.AGE.max) {
            return { valid: false, error: SEARCH_VALIDATION.AGE.error };
        }
        return { valid: true, value: ageNum };
    },
    
    validateRating(rating, mode) {
        if (!rating || rating === '') {
            return { valid: false, error: 'обязательно' };
        }
        const ratingNum = parseInt(rating, 10);
        const limits = mode === 'FACEIT' ? SEARCH_VALIDATION.FACEIT : SEARCH_VALIDATION.PREMIER;
        
        if (isNaN(ratingNum) || ratingNum < limits.min || ratingNum > limits.max) {
            return { valid: false, error: limits.error };
        }
        return { valid: true, value: ratingNum };
    },
    
    validateRank(rank) {
        if (!rank || rank === '' || rank === 'Выберите ранг') {
            return { valid: false, error: 'выберите ранг' };
        }
        return { valid: true, value: rank };
    },
    
    // ========== ПОДСВЕТКА ОШИБОК ==========
    showFieldError(fieldId, hasError, errorText = 'неверный ввод') {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const parent = input.closest('.stat-value, .input-field, .search-input-field, .rank-select, .link-with-copy');
        const label = parent?.previousElementSibling;
        
        if (input) {
            if (hasError) {
                input.style.color = '#FF3B30';
                input.style.borderColor = '#FF3B30';
            } else {
                input.style.color = '';
                input.style.borderColor = '';
            }
        }
        
        if (label && label.classList.contains('input-label')) {
            const originalText = label.getAttribute('data-original') || label.textContent;
            if (!label.getAttribute('data-original')) {
                label.setAttribute('data-original', originalText);
            }
            
            if (hasError) {
                label.innerHTML = `${originalText} <span style="color: #FF3B30; font-weight: 400;">*${errorText}</span>`;
            } else {
                label.textContent = originalText;
            }
        }
    },
    
    // ========== ВАЛИДАЦИЯ ФОРМЫ ==========
    validateForm(mode) {
        let isValid = true;
        this.validationErrors = { age: false, rating: false, rank: false };
        
        // Валидация возраста
        let ageInput;
        if (mode === 'FACEIT') ageInput = document.getElementById('faceitAgeValue');
        else if (mode === 'PREMIER') ageInput = document.getElementById('premierAgeValue');
        else if (mode === 'PRIME') ageInput = document.getElementById('primeAgeValue');
        else if (mode === 'PUBLIC') ageInput = document.getElementById('publicAgeValue');
        
        if (ageInput) {
            const ageValid = this.validateAge(ageInput.value);
            this.validationErrors.age = !ageValid.valid;
            this.showFieldError(ageInput.id, !ageValid.valid, ageValid.error);
            if (!ageValid.valid) isValid = false;
        }
        
        // Валидация рейтинга/ранга
        if (mode === 'FACEIT') {
            const ratingInput = document.getElementById('faceitELOInput');
            if (ratingInput) {
                const ratingValid = this.validateRating(ratingInput.value, 'FACEIT');
                this.validationErrors.rating = !ratingValid.valid;
                this.showFieldError(ratingInput.id, !ratingValid.valid, ratingValid.error);
                if (!ratingValid.valid) isValid = false;
            }
        } else if (mode === 'PREMIER') {
            const ratingInput = document.getElementById('premierRatingInput');
            if (ratingInput) {
                const ratingValid = this.validateRating(ratingInput.value, 'PREMIER');
                this.validationErrors.rating = !ratingValid.valid;
                this.showFieldError(ratingInput.id, !ratingValid.valid, ratingValid.error);
                if (!ratingValid.valid) isValid = false;
            }
        } else if (mode === 'PRIME') {
            const rankSelect = document.getElementById('primeRankSelect');
            if (rankSelect) {
                const rankValid = this.validateRank(rankSelect.value);
                this.validationErrors.rank = !rankValid.valid;
                this.showFieldError(rankSelect.id, !rankValid.valid, rankValid.error);
                if (!rankValid.valid) isValid = false;
            }
        } else if (mode === 'PUBLIC') {
            const rankSelect = document.getElementById('publicRankSelect');
            if (rankSelect) {
                const rankValid = this.validateRank(rankSelect.value);
                this.validationErrors.rank = !rankValid.valid;
                this.showFieldError(rankSelect.id, !rankValid.valid, rankValid.error);
                if (!rankValid.valid) isValid = false;
            }
        }
        
        return isValid;
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
        console.log('🔍 Search.start called:', mode, value);
        if (window.Settings) Settings.click();
        
        if (this.blockUntil && Date.now() < this.blockUntil) {
            const waitSeconds = Math.ceil((this.blockUntil - Date.now()) / 1000);
            App.showAlert(`Подождите ${waitSeconds} секунд`);
            return;
        }
        
        // МГНОВЕННОЕ автозаполнение из профиля
        const profileData = this.getProfileData();
        console.log('📋 Автозаполнение из профиля:', profileData);
        
        // Заполняем поля
        if (mode === 'FACEIT') {
            const ageInput = document.getElementById('faceitAgeValue');
            const faceitInput = document.getElementById('faceitLinkInput');
            if (ageInput && profileData.age) ageInput.value = profileData.age;
            if (faceitInput && profileData.faceit) faceitInput.value = profileData.faceit;
        } else if (mode === 'PREMIER') {
            const ageInput = document.getElementById('premierAgeValue');
            const steamInput = document.getElementById('premierSteamInput');
            if (ageInput && profileData.age) ageInput.value = profileData.age;
            if (steamInput && profileData.steam) steamInput.value = profileData.steam;
        } else if (mode === 'PRIME') {
            const ageInput = document.getElementById('primeAgeValue');
            const steamInput = document.getElementById('primeSteamInput');
            if (ageInput && profileData.age) ageInput.value = profileData.age;
            if (steamInput && profileData.steam) steamInput.value = profileData.steam;
        } else if (mode === 'PUBLIC') {
            const ageInput = document.getElementById('publicAgeValue');
            const steamInput = document.getElementById('publicSteamInput');
            if (ageInput && profileData.age) ageInput.value = profileData.age;
            if (steamInput && profileData.steam) steamInput.value = profileData.steam;
        }
        
        // Валидация
        if (!this.validateForm(mode)) {
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
        
        // Собираем данные и запускаем поиск
        const data = this.collectSearchData(mode);
        this.doStartSearch(mode, data);
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
        
        console.log('📦 Collected search data:', data);
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
            console.error('❌ Нет telegram_id!');
            App.showAlert('Ошибка авторизации');
            return;
        }
        
        // Показываем экран поиска
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => screen.classList.remove('active'));
        
        const searchScreen = document.getElementById('searchScreen');
        if (searchScreen) searchScreen.classList.add('active');
        
        const modeTitle = document.getElementById('searchModeTitle');
        if (modeTitle) modeTitle.textContent = mode;
        
        const statusEl = document.getElementById('searchStatus');
        if (statusEl) {
            statusEl.textContent = 'Поиск тиммейта начат';
            statusEl.style.color = '#9BA1B0';
        }
        
        this.resetTimer();
        this.startTimer();
        
        // Формируем payload
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
        
        console.log('📤 Отправляем запрос:', payload);
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ошибка сервера:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Search start response:', data);
            
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
            console.error('❌ Error starting search:', error);
            App.showAlert('Ошибка соединения с сервером');
            App.showScreen('mainScreen', true);
        });
    },
    
    startPolling() {
        if (this.pollingInterval) return;
        console.log('Polling started');
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
        console.log('🔄 Показываем экран свайпа');
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
        console.log('Партнер отклонил');
        if (window.Settings) Settings.error();
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
        this.waitingForPartner = false;
        this.isSearching = true;
        this.currentMatchId = null;
        App.showAlert('Собеседник отклонил приглашение');
        App.showScreen('mainScreen', true);
    },
    
    handleBothAccepted() {
        console.log('Оба приняли!');
        if (window.Settings) Settings.success();
        if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
        this.stopPolling();
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Тиммейт принял!';
            statusEl.style.color = '#FF5500';
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Search: DOM загружен');
    window.Search = Search;
});

console.log('✅ SEARCH.JS ЗАГРУЖЕН');

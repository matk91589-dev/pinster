// ============================================
// ПОИСК (Telegram Mini App версия) - ИСПРАВЛЕННЫЙ
// ============================================

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
    
    setStyle(style, element) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.style-option');
        options.forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        if (window.Settings) Settings.click();
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },
    
    start(mode, value) {
        console.log('Search.start called with mode:', mode);
        if (window.Settings) Settings.click();
        
        if (this.blockUntil && Date.now() < this.blockUntil) {
            const waitSeconds = Math.ceil((this.blockUntil - Date.now()) / 1000);
            App.showAlert(`Подождите ${waitSeconds} секунд`);
            return;
        }
        
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.processedMatchIds.clear();
        this.currentMode = mode;
        
        this.showSearchScreen(mode);
    },
    
    collectSearchData(mode) {
        const data = {
            style: 'fan',
            age: 21,
            steam_link: '',
            faceit_link: '',
            rating_value: 0,
            comment: ''
        };
        
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) {
            data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        }
        
        if (mode === 'FACEIT') {
            data.rating_value = parseInt(document.getElementById('faceitELOInput')?.value) || 0;
            data.age = parseInt(document.getElementById('faceitAgeValue')?.value) || 21;
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
            data.comment = document.getElementById('faceitComment')?.value || '';
        }
        else if (mode === 'PREMIER') {
            data.rating_value = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.comment = document.getElementById('premierComment')?.value || '';
        }
        else if (mode === 'PRIME') {
            data.rating_value = document.getElementById('primeRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        }
        else if (mode === 'PUBLIC') {
            data.rating_value = document.getElementById('publicRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.comment = document.getElementById('publicComment')?.value || '';
        }
        
        return data;
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
            console.log('Match check response:', data);
            
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
    
        // ✅ ПРАВИЛЬНОЕ ПОКАЗЫВАНИЕ ЭКРАНА СВАЙПА
        // Сначала деактивируем все экраны
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Активируем экран свайпа
        const swipeScreen = document.getElementById('swipeScreen');
        if (swipeScreen) {
            swipeScreen.classList.add('active');
            console.log('✅ swipeScreen активирован');
        } else {
            console.error('❌ swipeScreen не найден в DOM');
        }
        
        // Даем время на активацию экрана и появление карточки
        setTimeout(() => {
            // Проверяем, что карточка появилась
            const swipeCard = document.getElementById('swipeCard');
            if (swipeCard) {
                console.log('✅ swipeCard найден в DOM');
            } else {
                console.warn('⚠️ swipeCard еще не в DOM, ждем...');
                // Если карточки нет, пробуем еще раз через 100ms
                setTimeout(() => {
                    const cardAgain = document.getElementById('swipeCard');
                    if (cardAgain) {
                        console.log('✅ swipeCard появился после ожидания');
                    }
                }, 100);
            }
            
            // Запускаем Swipe
            if (typeof Swipe !== 'undefined' && Swipe && Swipe.startWithOpponent) {
                Swipe.startWithOpponent(
                    data.opponent, 
                    this.currentMatchId, 
                    data.expires_at,
                    data.server_time
                );
            } else {
                console.error('❌ Swipe не загружен или нет метода startWithOpponent');
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
        setTimeout(() => this.showSearchScreen(this.currentMode), 1500);
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
    
    showSearchScreen(mode) {
        this.currentMode = mode;
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.currentMatchId = null;
        
        const telegram_id = this.getTelegramId();
        const data = this.collectSearchData(mode);
        
        // ✅ СКРЫВАЕМ ВСЕ ЭКРАНЫ, потом показываем экран поиска
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const searchScreen = document.getElementById('searchScreen');
        if (searchScreen) {
            searchScreen.classList.add('active');
        }
        
        const modeTitle = document.getElementById('searchModeTitle');
        if (modeTitle) modeTitle.textContent = mode;
        
        const statusEl = document.getElementById('searchStatus');
        if (statusEl) {
            statusEl.textContent = 'Поиск тиммейта начат';
            statusEl.style.color = '#9BA1B0';
        }
        
        this.resetTimer();
        this.startTimer();
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                mode: mode,
                rating_value: data.rating_value,
                style: data.style,
                age: data.age,
                steam_link: data.steam_link,
                faceit_link: data.faceit_link,
                comment: data.comment || ''
            })
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            console.log('Search start response:', data);
            if (data.status === 'searching') {
                this.startPolling();
            } else if (data.status === 'match_found') {
                this.showSwipeScreen(data);
            }
        })
        .catch(error => console.error('Error starting search:', error));
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
        .finally(() => {
            App.showScreen('mainScreen', true);
        })
        .catch(error => console.error('Error stopping search:', error));
    },
    
    showMatchScreen(data) {
        this.showSwipeScreen(data);
    },
    
    acceptMatch() {
        console.log('acceptMatch - используйте Swipe.acceptPlayer()');
    },
    
    rejectMatch() {
        console.log('rejectMatch - используйте Swipe.rejectPlayer()');
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Search: DOM загружен');
    window.Search = Search;
});

if (document.getElementById('searchScreen')?.classList.contains('active')) {
    setTimeout(() => Search.init(), 100);
}

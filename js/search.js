// ============================================
// ПОИСК (Telegram Mini App версия) - ИСПРАВЛЕНО
// теперь Search только ищет и передает управление Swipe
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
    
    // Добавлена функция проверки MatchAccepted (заглушка, на случай если нужна)
    ensureMatchAccepted() {
        if (!window.MatchAccepted) {
            console.warn('MatchAccepted не найден, создаем заглушку');
            window.MatchAccepted = {
                chatLink: null,
                teammateInfo: null,
                show(teammateInfo, chatLink) {
                    console.log('MatchAccepted.show (заглушка)', teammateInfo, chatLink);
                    if (window.Telegram?.WebApp?.openTelegramLink && chatLink) {
                        window.Telegram.WebApp.openTelegramLink(chatLink);
                    }
                    App.showScreen('mainScreen', true);
                },
                goToChat() {
                    if (this.chatLink) {
                        window.location.href = this.chatLink;
                    }
                },
                clear() {
                    this.chatLink = null;
                    this.teammateInfo = null;
                }
            };
        }
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
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    setStyle(style, element) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.style-option');
        options.forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },
    
    start(mode, value) {
        console.log('Search.start called with mode:', mode);
        
        if (this.blockUntil && Date.now() < this.blockUntil) {
            const waitSeconds = Math.ceil((this.blockUntil - Date.now()) / 1000);
            const statusEl = document.getElementById('searchStatus');
            if (statusEl) {
                statusEl.textContent = `⏳ Подождите ${waitSeconds} сек`;
                statusEl.style.color = '#FF5500';
            }
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
            data.steam_link = Profile?.savedSteam || '';
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
            data.comment = document.getElementById('faceitComment')?.value || '';
        }
        else if (mode === 'PREMIER') {
            data.rating_value = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
            data.comment = document.getElementById('premierComment')?.value || '';
        }
        else if (mode === 'PRIME') {
            data.rating_value = document.getElementById('primeRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        }
        else if (mode === 'PUBLIC') {
            data.rating_value = document.getElementById('publicRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
            data.comment = document.getElementById('publicComment')?.value || '';
        }
        
        return data;
    },
    
    startPolling() {
        if (this.pollingInterval) {
            console.log('Polling уже запущен, пропускаем');
            return;
        }
        
        console.log('Polling started (каждые 2 сек)');
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        if (!this.isSearching && !this.waitingForPartner) {
            return;
        }
        
        console.log('Checking match status...');
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id
            })
        })
        .then(res => {
            if (!res.ok) {
                console.error('HTTP ошибка:', res.status, res.statusText);
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) {
                console.log('Пустой ответ от сервера');
                return;
            }
            
            console.log('Match check response:', data);
            
            if (data.match_found) {
                console.log('🎯 Мэтч найден!');
                
                // Проверяем, не обрабатывали ли мы уже этот матч
                if (this.processedMatchIds.has(data.match_id)) {
                    console.log('Матч уже обработан, пропускаем');
                    return;
                }
                
                this.processedMatchIds.add(data.match_id);
                
                if (this.waitingForPartner) {
                    this.updateWaitingStatus(data);
                } else {
                    // Останавливаем polling
                    this.stopPolling();
                    
                    // Сохраняем данные в localStorage
                    localStorage.setItem('opponentData', JSON.stringify(data.opponent));
                    localStorage.setItem('matchExpiresAt', data.expires_at);
                    localStorage.setItem('serverTime', data.server_time);
                    localStorage.setItem('currentMatchId', data.match_id);
                    
                    // Показываем экран свайпа с найденным игроком
                    this.showSwipeScreen(data);
                }
            }
        })
        .catch(error => {
            console.error('Error checking match:', error);
        });
    },
    
    // ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ showSwipeScreen ==========
    showSwipeScreen(data) {
        console.log('🔄 Показываем экран свайпа для match_id:', data.match_id);
        console.log('Данные от сервера:', data);
        
        // 👇 ВАЖНО: Добавляем mode к opponent, если его нет
        if (data.opponent) {
            // Добавляем режим из поиска в объект opponent
            data.opponent.mode = this.currentMode;
            console.log('✅ Добавлен mode к opponent:', this.currentMode);
        } else {
            console.warn('⚠️ opponent отсутствует в данных!');
            // Создаем объект opponent, если его нет
            data.opponent = { mode: this.currentMode };
        }
        
        this.currentMatchId = data.match_id;
        this.myResponse = null;
        this.isSearching = false;
        this.waitingForPartner = false;
    
        // Скрываем экран поиска
        document.getElementById('searchScreen')?.classList.remove('active');
        
        // Показываем экран свайпа
        document.getElementById('swipeScreen')?.classList.add('active');
    
        // Передаем управление Swipe
        if (typeof Swipe !== 'undefined' && Swipe) {
            console.log('✅ Передаем управление Swipe');
            
            // Немного задержки для плавности
            setTimeout(() => {
                Swipe.startWithOpponent(
                    data.opponent, 
                    this.currentMatchId, 
                    data.expires_at,
                    data.server_time
                );
            }, 100);
        } else {
            console.error('❌ Swipe не найден!');
            // Фолбэк на главный экран
            App.showScreen('mainScreen', true);
        }
    },
    
    updateWaitingStatus(data) {
        console.log('Обновление статуса ожидания:', data);
        
        if (data.opponent_response === 'reject') {
            this.handlePartnerReject();
        } else if (data.opponent_response === 'accept' && this.myResponse === 'accept') {
            this.handleBothAccepted();
        }
    },
    
    handlePartnerReject() {
        console.log('Партнер отклонил мэтч');
        
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.currentMatchId = null;
        
        this.showRejectNotification();
        
        setTimeout(() => {
            this.showSearchScreen(this.currentMode);
        }, 2000);
    },
    
    showRejectNotification() {
        const swipeCard = document.querySelector('.swipe-card');
        if (!swipeCard) return;
        
        swipeCard.classList.add('rejected');
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Игрок отклонил приглашение';
            statusEl.style.color = '#FF3B30';
        }
        
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0.5';
            buttons.style.pointerEvents = 'none';
        }
    },
    
    handleBothAccepted() {
        console.log('Оба приняли!');
        
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        this.stopPolling();
        
        document.querySelector('.connection-screen')?.classList.add('both-accepted');
        
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Тиммейт принял приглашение!';
            statusEl.style.color = '#FF5500';
        }
        
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0';
            buttons.style.pointerEvents = 'none';
        }
        
        // Не создаем игру здесь - это делает Swipe
        console.log('Ожидаем создания игры в Swipe');
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Polling остановлен');
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
        
        App.showScreen('searchScreen', true);
        
        // Показываем режим (FACEIT, PREMIER, PRIME, PUBLIC)
        document.getElementById('searchModeTitle').textContent = mode;
        
        const statusEl = document.getElementById('searchStatus');
        if (statusEl) {
            statusEl.textContent = 'Поиск тиммейта начат';
            statusEl.style.color = '#9BA1B0';
        }
        
        this.resetTimer();
        this.startTimer();
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                mode: mode,  // Отправляем PRIME или PUBLIC
                rating_value: data.rating_value,
                style: data.style,
                age: data.age,
                steam_link: data.steam_link,
                faceit_link: data.faceit_link,
                comment: data.comment || ''
            })
        })
        .then(res => {
            if (!res.ok) {
                console.error('HTTP ошибка при старте поиска:', res.status);
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;
            
            console.log('Search start response:', data);
            
            if (data.status === 'searching') {
                console.log('В очереди, запускаем polling');
                this.startPolling();
            } 
            else if (data.status === 'match_found') {
                console.log('Мэтч найден сразу!', data);
                this.showSwipeScreen(data);
            }
        })
        .catch(error => {
            console.error('Error starting search:', error);
        });
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
        this.resetTimer();
        this.stopPolling();
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = false;
        this.currentMatchId = null;
        
        this.processedMatchIds.clear();
        
        const telegram_id = this.getTelegramId();
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id
            })
        })
        .then(() => {
            App.showScreen('mainScreen', true);
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        })
        .catch(error => {
            console.error('Error stopping search:', error);
            App.showScreen('mainScreen', true);
        });
    },
    
    showMatchScreen(data) {
        console.log('showMatchScreen вызван, перенаправляем на showSwipeScreen');
        this.showSwipeScreen(data);
    },
    
    startMatchTimer() {
        console.log('startMatchTimer - устаревший метод');
    },
    
    matchTimeout() {
        console.log('matchTimeout - устаревший метод');
    },
    
    acceptMatch() {
        console.log('acceptMatch - устаревший метод, используйте Swipe.acceptPlayer()');
    },
    
    rejectMatch() {
        console.log('rejectMatch - устаревший метод, используйте Swipe.rejectPlayer()');
    },
    
    getConnectionHTML(opponent) {
        return '';
    },
    
    // ========== УДАЛЕНА ФУНКЦИЯ createGame ==========
    // Вся логика создания игры теперь в Swipe
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Search: DOM загружен');
    window.Search = Search;
});

if (document.getElementById('searchScreen')?.classList.contains('active')) {
    console.log('Search экран уже активен, инициализируем');
    setTimeout(() => Search.init(), 100);
}

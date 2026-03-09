// ============================================
// ПОИСК (Telegram Mini App версия) - ИСПРАВЛЕНО
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
    processedMatchIds: new Set(), // храним ID обработанных мэтчей
    
    init() {
        this.resetTimer();
        console.log('Search.init()');
        
        // Сразу начинаем проверять мэтчи при загрузке
        setTimeout(() => this.startPolling(), 1000);
        
        // Добавляем проверку при фокусе на приложение
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('activated', () => {
                console.log('App activated, checking match...');
                this.checkMatchStatus();
            });
        }
    },
    
    // Безопасное получение Telegram ID
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
    
    // НАЧАТЬ ПОИСК
    start(mode, value) {
        console.log('Search.start called with mode:', mode);
        
        // Проверяем не заблокирован ли поиск
        if (this.blockUntil && Date.now() < this.blockUntil) {
            const waitSeconds = Math.ceil((this.blockUntil - Date.now()) / 1000);
            const statusEl = document.getElementById('searchStatus');
            if (statusEl) {
                statusEl.textContent = `⏳ Подождите ${waitSeconds} сек`;
                statusEl.style.color = '#FF5500';
            }
            return;
        }
        
        // Сбрасываем флаги
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        
        // Очищаем processedMatchIds при новом поиске
        this.processedMatchIds.clear();
        
        // Сохраняем текущий режим
        this.currentMode = mode;
        
        // Показываем экран поиска
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
        
        // Определяем стиль
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) {
            data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        }
        
        // Собираем данные в зависимости от режима
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
        else if (mode === 'MM PRIME') {
            data.rating_value = document.getElementById('primeRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        }
        else if (mode === 'MM PUBLIC') {
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
    
    // ИСПРАВЛЕННАЯ ФУНКЦИЯ
    checkMatchStatus() {
        // Если не ищем и не ждем партнера - выходим
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
        .then(res => res.json())
        .then(data => {
            console.log('Match check response:', data);
            
            if (data.match_found) {
                console.log('Мэтч найден!');
                
                // Проверяем не обрабатывали ли мы уже этот мэтч
                if (this.processedMatchIds.has(data.match_id)) {
                    console.log('Мэтч уже обработан, пропускаем');
                    return;
                }
                
                this.processedMatchIds.add(data.match_id);
                
                // Если мы уже ждем ответа партнера, обновляем статус
                if (this.waitingForPartner) {
                    this.updateWaitingStatus(data);
                } else {
                    // Показываем экран свайпа
                    this.stopPolling();
                    this.showSwipeScreen(data);
                    this.currentMatchId = data.match_id;
                }
            }
        })
        .catch(error => {
            console.error('Error checking match:', error);
        });
    },
    
    // ИСПРАВЛЕНО: показываем экран свайпа с карточкой, временем истечения и серверным временем
    showSwipeScreen(data) {
        console.log('Показываем экран свайпа для match_id:', data.match_id);
        console.log('Данные от сервера:', data);
    
        this.currentMatchId = data.match_id;
        this.myResponse = null;
        this.isSearching = false;
    
        // Сохраняем данные оппонента (на всякий случай)
        localStorage.setItem('opponentData', JSON.stringify(data.opponent));
        localStorage.setItem('matchExpiresAt', data.expires_at);
        localStorage.setItem('serverTime', data.server_time);
        localStorage.setItem('currentMatchId', data.match_id);
    
        // Переходим на экран свайпа
        App.showScreen('swipeScreen', false);
    
        // Инициализируем свайп с данными оппонента, временем истечения и серверным временем
        if (typeof Swipe !== 'undefined') {
            // УБИРАЕМ setTimeout - вызываем сразу после перехода
            Swipe.startWithOpponent(
                data.opponent, 
                this.currentMatchId, 
                data.expires_at,
                data.server_time
            );
        } else {
            console.error('❌ Swipe не найден!');
        }
    },
    
    updateWaitingStatus(data) {
        console.log('Обновление статуса ожидания:', data);
        
        // Проверяем ответ оппонента
        if (data.opponent_response === 'reject') {
            // Оппонент отклонил
            this.handlePartnerReject();
        } else if (data.opponent_response === 'accept' && this.myResponse === 'accept') {
            // Оба приняли
            this.handleBothAccepted();
        }
    },
    
    handlePartnerReject() {
        console.log('Партнер отклонил мэтч');
        
        // Очищаем таймер
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        // Сбрасываем флаги
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.currentMatchId = null;
        
        // Показываем уведомление об отказе
        this.showRejectNotification();
        
        // Возвращаемся на экран поиска через 2 секунды
        setTimeout(() => {
            this.showSearchScreen(this.currentMode);
        }, 2000);
    },
    
    showRejectNotification() {
        const swipeCard = document.querySelector('.swipe-card');
        if (!swipeCard) return;
        
        // Добавляем класс rejected
        swipeCard.classList.add('rejected');
        
        // Меняем статус
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Игрок отклонил приглашение';
            statusEl.style.color = '#FF3B30';
        }
        
        // Убираем кнопки
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0.5';
            buttons.style.pointerEvents = 'none';
        }
    },
    
    handleBothAccepted() {
        console.log('Оба приняли!');
        
        // Очищаем таймер
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        this.stopPolling();
        
        // Добавляем эффект both-accepted
        document.querySelector('.connection-screen')?.classList.add('both-accepted');
        
        // Меняем статус
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Тиммейт принял приглашение! Создаем игру...';
            statusEl.style.color = '#FF5500';
        }
        
        // Скрываем кнопки
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0';
            buttons.style.pointerEvents = 'none';
        }
        
        // Создаем игру через небольшую паузу
        setTimeout(() => {
            this.createGame();
        }, 1000);
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Polling остановлен');
        }
    },
    
    // ПОКАЗАТЬ ЭКРАН ПОИСКА
    showSearchScreen(mode) {
        this.currentMode = mode;
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = true;
        this.currentMatchId = null;
        
        // Получаем Telegram ID для отправки запроса
        const telegram_id = this.getTelegramId();
        
        // Собираем данные для поиска
        const data = this.collectSearchData(mode);
        
        // Показываем экран поиска
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        
        // Сбрасываем статус
        const statusEl = document.getElementById('searchStatus');
        if (statusEl) {
            statusEl.textContent = 'Поиск тиммейта начат';
            statusEl.style.color = '#9BA1B0';
        }
        
        this.resetTimer();
        this.startTimer();
        
        // Отправляем запрос на поиск
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/start', {
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
        .then(res => res.json())
        .then(data => {
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
    
    // ПОКАЗАТЬ ЭКРАН НАЙДЕННОГО ТИММЕЙТА (ТЕПЕРЬ ЭТОТ МЕТОД НЕ ИСПОЛЬЗУЕТСЯ)
    // Оставлен для обратной совместимости, но показываем через showSwipeScreen
    showMatchScreen(data) {
        console.log('showMatchScreen вызван, перенаправляем на showSwipeScreen');
        this.showSwipeScreen(data);
    },
    
    startMatchTimer() {
        // Этот метод больше не нужен, таймер управляется в Swipe
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
        // Этот метод больше не нужен, HTML генерируется в Swipe
        return '';
    },
    
    createGame() {
        console.log('Создаем игру для match_id:', this.currentMatchId);
        
        if (!this.currentMatchId) {
            console.log('Нет активного мэтча');
            return;
        }
        
        const matchId = this.currentMatchId;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: matchId
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Game create response:', data);
            
            this.processedMatchIds.clear();
            
            this.waitingForPartner = false;
            this.myResponse = null;
            this.isSearching = false;
            this.currentMatchId = null;
            
            // Открываем ссылку в Telegram
            if (window.Telegram?.WebApp?.openTelegramLink && data.chat_link) {
                window.Telegram.WebApp.openTelegramLink(data.chat_link);
            }
            
            // Переходим на главный экран
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Error creating game:', error);
            App.showScreen('mainScreen', true);
        });
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe: DOM загружен');
    window.Search = Search;
});

if (document.getElementById('searchScreen')?.classList.contains('active')) {
    console.log('Search экран уже активен, инициализируем');
    setTimeout(() => Search.init(), 100);
}

// ============================================
// ПОИСК (Telegram Mini App версия) - 10/10 UX
// ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    
    // ИСПРАВЛЕНО: защита от множественных polling
    startPolling() {
        if (this.pollingInterval) {
            console.log('Polling уже запущен, пропускаем');
            return;
        }
        
        console.log('Polling started (каждые 2 сек)');
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    // ИСПРАВЛЕНО: добавлены проверки состояния
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
            
            // ИСПРАВЛЕНО: защита от повторного показа мэтча
            if (data.match_found && !this.currentMatchId) {
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
                    // Показываем экран мэтча
                    this.stopPolling();
                    this.showMatchScreen(data);
                }
            }
        })
        .catch(error => {
            console.error('Error checking match:', error);
        });
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
        
        // ИСПРАВЛЕНО: останавливаем polling
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
    
    // ПОКАЗАТЬ ЭКРАН НАЙДЕННОГО ТИММЕЙТА
    showMatchScreen(data) {
        // ИСПРАВЛЕНО: останавливаем polling перед показом
        this.stopPolling();
        
        this.currentMatchId = data.match_id;
        this.myResponse = null;
        this.isSearching = false;
        console.log('Показываем экран для match_id:', data.match_id);
        console.log('Данные оппонента:', data.opponent);
        
        // Определяем режим из данных оппонента или из сохраненного
        const mode = data.opponent.mode || this.currentMode || 'PREMIER';
        console.log('Режим для отображения:', mode);
        
        // ИСПРАВЛЕНО: проверка существования DOM элементов
        const swipeCard = document.querySelector('.swipe-card');
        const swipeContent = document.querySelector('.swipe-card-content');
        
        if (!swipeCard || !swipeContent) {
            console.warn('Swipe card not found');
            return;
        }
        
        // Добавляем класс для анимации появления
        swipeCard.classList.add('connection-mode');
        
        // Меняем содержимое карточки на экран соединения
        swipeContent.innerHTML = this.getConnectionHTML(data.opponent);
        
        // ИСПРАВЛЕНО: используем App.showScreen вместо прямых манипуляций
        App.showScreen('connectionScreen', true);
        
        // Запускаем таймер на 30 секунд
        this.startMatchTimer();
    },
    
    // HTML для карточки соединения
    getConnectionHTML(opponent) {
        return `
            <div class="swipe-card-content connection-mode">
                <div class="connection-avatars">
                    <!-- Твой аватар (всегда оранжевый с пульсацией) -->
                    <div class="connection-avatar self-avatar" id="selfAvatar">
                        <div class="tg-avatar-svg">
                            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>
                    
                    <!-- Линия соединения -->
                    <div class="connection-line-container">
                        <div class="connection-line" id="connectionLine">
                            <div class="line-pulse" id="linePulse"></div>
                        </div>
                    </div>
                    
                    <!-- Аватар тиммейта (сначала серый) -->
                    <div class="teammate-avatar" id="teammateAvatar">
                        <div class="tg-avatar-svg">
                            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Информация о тиммейте -->
                <div class="teammate-info">
                    <span class="teammate-nick">${opponent.nick || 'Игрок'}</span>
                    <span class="teammate-rating">${opponent.rating || '0'} ❤️</span>
                </div>
                
                <!-- Статус соединения -->
                <div class="connection-status" id="connectionStatus">
                    Ожидание ответа игрока...
                </div>
                
                <!-- Кнопки действий -->
                <div class="connection-actions">
                    <button class="connection-btn accept" onclick="Search.acceptMatch()">✓ Принять</button>
                    <button class="connection-btn decline" onclick="Search.rejectMatch()">✗ Отклонить</button>
                </div>
            </div>
        `;
    },
    
    startMatchTimer() {
        const timerElement = document.getElementById('matchTimer');
        
        // Создаем или обновляем таймер
        let connectionTimer = document.querySelector('.connection-timer');
        if (!connectionTimer) {
            connectionTimer = document.createElement('div');
            connectionTimer.className = 'connection-timer';
            document.querySelector('.connection-screen')?.appendChild(connectionTimer);
        }
        
        // Очищаем предыдущий таймер если был
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        // ВАЖНО: Всегда 30 секунд от МОМЕНТА ЗАПУСКА
        const startTime = Date.now();
        const endTime = startTime + 30000; // ровно 30 секунд
        this.matchEndTime = endTime;
        
        console.log('✅ Таймер запущен, до:', new Date(endTime).toLocaleTimeString());
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((endTime - now) / 1000));
            
            // Форматируем время (MM:SS)
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            connectionTimer.textContent = timeString;
            
            if (diff <= 0) {
                connectionTimer.textContent = '00:00';
                clearInterval(this.matchTimerInterval);
                this.matchTimerInterval = null;
                this.matchTimeout();
                return;
            }
            
            // Если осталось меньше 10 секунд - добавляем класс warning
            if (diff < 10) {
                connectionTimer.classList.add('warning');
            } else {
                connectionTimer.classList.remove('warning');
            }
        };
        
        updateTimer();
        this.matchTimerInterval = setInterval(updateTimer, 1000);
    },
    
    // ТАЙМАУТ - не нажали кнопки
    matchTimeout() {
        console.log('⏰ Время вышло, отменяем мэтч');
        
        // Если уже нет текущего мэтча - выходим
        if (!this.currentMatchId) {
            console.log('Нет активного мэтча');
            return;
        }
        
        const telegram_id = this.getTelegramId();
        const matchId = this.currentMatchId;
        
        // Показываем уведомление о таймауте
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '⏰ Время ожидания истекло';
            statusEl.style.color = '#FF3B30';
        }
        
        // Скрываем кнопки
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0.5';
            buttons.style.pointerEvents = 'none';
        }
        
        // Сначала сбрасываем флаги, чтобы предотвратить повторные вызовы
        this.waitingForPartner = false;
        this.myResponse = null;
        this.isSearching = false;
        this.currentMatchId = null;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: matchId,
                response: 'timeout'
            })
        })
        .then(() => {
            // Через 2 секунды на главный экран
            setTimeout(() => {
                App.showScreen('mainScreen', true);
            }, 2000);
        })
        .catch(error => {
            console.error('Error timing out match:', error);
            setTimeout(() => {
                App.showScreen('mainScreen', true);
            }, 2000);
        });
    },
    
    acceptMatch() {
        console.log('✅ Принимаем мэтч:', this.currentMatchId);
        
        if (!this.currentMatchId) {
            console.log('Нет активного мэтча');
            return;
        }
        
        // Визуальная обратная связь
        const acceptBtn = document.querySelector('.connection-btn.accept');
        if (acceptBtn) {
            acceptBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                acceptBtn.style.transform = '';
            }, 200);
        }
        
        const telegram_id = this.getTelegramId();
        this.myResponse = 'accept';
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: this.currentMatchId,
                response: 'accept'
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Accept response:', data);
            
            if (data.both_accepted) {
                // Оба приняли!
                this.handleBothAccepted();
            } 
            else if (data.status === 'waiting') {
                // Ждем ответа второго игрока
                this.waitingForPartner = true;
                
                // Меняем статус
                const statusEl = document.getElementById('connectionStatus');
                if (statusEl) {
                    statusEl.textContent = '✅ Вы приняли, ожидаем ответа тиммейта...';
                }
                
                // Скрываем кнопки
                const buttons = document.querySelector('.connection-actions');
                if (buttons) {
                    buttons.style.opacity = '0.5';
                    buttons.style.pointerEvents = 'none';
                }
                
                // Продолжаем проверять статус
                this.startPolling();
            }
        })
        .catch(error => {
            console.error('Error accepting match:', error);
        });
        
        // UX УЛУЧШЕНИЕ: вибрация при успехе
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    },
    
    rejectMatch() {
        console.log('❌ Отклоняем мэтч:', this.currentMatchId);
        
        if (!this.currentMatchId) {
            console.log('Нет активного мэтча');
            return;
        }
        
        // Визуальная обратная связь
        const declineBtn = document.querySelector('.connection-btn.decline');
        if (declineBtn) {
            declineBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                declineBtn.style.transform = '';
            }, 200);
        }
        
        const telegram_id = this.getTelegramId();
        const matchId = this.currentMatchId;
        
        // Показываем статус отказа
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Вы отклонили приглашение';
            statusEl.style.color = '#FF3B30';
        }
        
        // Скрываем кнопки
        const buttons = document.querySelector('.connection-actions');
        if (buttons) {
            buttons.style.opacity = '0.5';
            buttons.style.pointerEvents = 'none';
        }
        
        // Очищаем таймер
        if (this.matchTimerInterval) {
            clearInterval(this.matchTimerInterval);
            this.matchTimerInterval = null;
        }
        
        // ИСПРАВЛЕНО: останавливаем polling
        this.stopPolling();
        
        this.myResponse = 'reject';
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: matchId,
                response: 'reject'
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Reject response:', data);
            
            // Устанавливаем блокировку на 2 секунды
            this.blockUntil = Date.now() + 2000;
            this.waitingForPartner = false;
            this.myResponse = null;
            this.isSearching = true;
            this.currentMatchId = null;
            
            // Через 2 секунды на главный экран
            setTimeout(() => {
                App.showScreen('mainScreen', true);
            }, 2000);
        })
        .catch(error => {
            console.error('Error rejecting match:', error);
            setTimeout(() => {
                App.showScreen('mainScreen', true);
            }, 2000);
        });
        
        // UX УЛУЧШЕНИЕ: вибрация при отказе
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
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
            
            // ИСПРАВЛЕНО: очищаем processedMatchIds
            this.processedMatchIds.clear();
            
            // Сбрасываем флаги
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
    },
    
    // НОВАЯ ФУНКЦИЯ для показа экрана поиска
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
                this.showMatchScreen(data);
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
        
        // ИСПРАВЛЕНО: очищаем processedMatchIds при отмене
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
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
});

window.Search = Search;

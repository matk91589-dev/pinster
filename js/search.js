// ============================================
// ПОИСК (Telegram Mini App версия) - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    pollingInterval: null,
    currentMatchId: null,
    matchTimerInterval: null,
    blockUntil: null,
    waitingForPartner: false, // флаг что ждем ответа партнера
    
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
            App.showAlert(`⏳ Подождите ${waitSeconds} сек перед новым поиском`);
            return;
        }
        
        // Сбрасываем флаг ожидания
        this.waitingForPartner = false;
        
        // Сохраняем текущий режим
        this.currentMode = mode;
        
        // Показываем экран поиска
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.resetTimer();
        this.startTimer();
        
        // Получаем Telegram ID
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        console.log('Telegram ID:', telegram_id);
        
        if (!telegram_id) {
            console.error('No telegram_id');
            App.showAlert('Ошибка: не удалось получить Telegram ID');
            return;
        }
        
        // Собираем данные
        const data = this.collectSearchData(mode);
        console.log('Collected data:', data);
        
        // Отправляем запрос
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
        .then(res => {
            console.log('Response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Response data:', data);
            
            if (data.status === 'searching') {
                console.log('В очереди, запускаем polling');
                this.startPolling();
            } 
            else if (data.status === 'match_found') {
                console.log('Мэтч найден сразу!', data);
                this.showMatchScreen(data);
            }
            else {
                console.log('Неизвестный статус:', data);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            App.showAlert('Ошибка при запуске поиска');
        });
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
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        console.log('Запуск polling (каждые 2 сек)');
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        console.log('Checking match status...');
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
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
        // Обновляем информацию о том, что партнер еще не ответил
        if (data.your_response === 'accept' && !data.opponent_response) {
            // Мы приняли, партнер еще нет
            const timer = document.getElementById('matchTimer');
            if (timer) {
                timer.innerHTML = `⏳ Ожидаем ответа тиммейта...`;
                timer.style.color = '#FF5500';
            }
        }
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
        this.currentMatchId = data.match_id;
        console.log('Показываем экран для match_id:', data.match_id);
        console.log('Данные оппонента:', data.opponent);
        
        // Определяем режим из данных оппонента или из сохраненного
        const mode = data.opponent.mode || this.currentMode || 'PREMIER';
        console.log('Режим для отображения:', mode);
        
        // Показываем кнопки (на случай если они были скрыты)
        const buttons = document.querySelector('.match-buttons');
        if (buttons) buttons.style.display = 'flex';
        
        // Заполняем данные с проверкой существования элементов
        const playerIdEl = document.getElementById('matchPlayerId');
        if (playerIdEl) playerIdEl.textContent = data.opponent.player_id || '???';
        
        const playerNickEl = document.getElementById('matchPlayerNick');
        if (playerNickEl) playerNickEl.textContent = data.opponent.nick || 'Игрок';
        
        // Рейтинг - просто число из профиля
        const ratingValueEl = document.getElementById('matchRatingValue');
        if (ratingValueEl) {
            ratingValueEl.textContent = data.opponent.rating || '0';
        }
        
        const ageEl = document.getElementById('matchAge');
        if (ageEl) {
            if (ageEl.tagName === 'INPUT' || ageEl.tagName === 'TEXTAREA') {
                ageEl.value = data.opponent.age + ' лет' || '? лет';
            } else {
                ageEl.textContent = data.opponent.age + ' лет' || '? лет';
            }
        }
        
        const rankEl = document.getElementById('matchRank');
        if (rankEl) {
            if (rankEl.tagName === 'INPUT' || rankEl.tagName === 'TEXTAREA') {
                rankEl.value = data.opponent.rank || 'Не указан';
            } else {
                rankEl.textContent = data.opponent.rank || 'Не указан';
            }
        }
        
        // Получаем элементы ссылок и их контейнеры (родительские div)
        const steamContainer = document.querySelector('.match-steam-container');
        const faceitContainer = document.querySelector('.match-faceit-container');
        
        const steamLinkEl = document.getElementById('matchSteamLink');
        const faceitLinkEl = document.getElementById('matchFaceitLink');
        
        // Для FACEIT показываем только ссылку Faceit, Steam скрываем
        if (mode === 'FACEIT') {
            console.log('FACEIT режим: показываем только Faceit ссылку');
            
            // Скрываем Steam контейнер
            if (steamContainer) {
                steamContainer.style.display = 'none';
            }
            
            // Показываем и заполняем Faceit
            if (faceitContainer) {
                faceitContainer.style.display = 'block';
            }
            
            if (faceitLinkEl) {
                if (faceitLinkEl.tagName === 'INPUT' || faceitLinkEl.tagName === 'TEXTAREA') {
                    faceitLinkEl.value = data.opponent.faceit_link || 'Не указана';
                } else {
                    faceitLinkEl.textContent = data.opponent.faceit_link || 'Не указана';
                }
            }
        } 
        // Для остальных режимов показываем только ссылку Steam, Faceit скрываем
        else {
            console.log('Другой режим: показываем только Steam ссылку');
            
            // Показываем и заполняем Steam
            if (steamContainer) {
                steamContainer.style.display = 'block';
            }
            
            if (steamLinkEl) {
                if (steamLinkEl.tagName === 'INPUT' || steamLinkEl.tagName === 'TEXTAREA') {
                    steamLinkEl.value = data.opponent.steam_link || 'Не указана';
                } else {
                    steamLinkEl.textContent = data.opponent.steam_link || 'Не указана';
                }
            }
            
            // Скрываем Faceit контейнер
            if (faceitContainer) {
                faceitContainer.style.display = 'none';
            }
        }
        
        // Комментарий
        const commentEl = document.getElementById('matchComment');
        if (commentEl) {
            if (commentEl.tagName === 'TEXTAREA' || commentEl.tagName === 'INPUT') {
                commentEl.value = data.opponent.comment || 'Нет комментария';
            } else {
                commentEl.textContent = data.opponent.comment || 'Нет комментария';
            }
        }
        
        // Показываем экран
        App.showScreen('matchFoundScreen', true);
        
        this.resetTimer();
        this.stopPolling();
        
        // Запускаем таймер на 30 секунд
        this.startMatchTimer(data.expires_at);
    },
    
    startMatchTimer(expiresAt) {
        const timerElement = document.getElementById('matchTimer');
        if (!timerElement) return;
        
        const endTime = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 30000;
        
        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((endTime - now) / 1000));
            
            if (diff <= 0) {
                timerElement.textContent = '0с';
                clearInterval(this.matchTimerInterval);
                this.matchTimeout();
                return;
            }
            
            timerElement.textContent = `⏳ ${diff}с`;
            
            if (diff < 10) {
                timerElement.style.color = '#FF5500';
            }
        };
        
        updateTimer();
        this.matchTimerInterval = setInterval(updateTimer, 1000);
    },
    
    // ТАЙМАУТ - не нажали кнопки
    matchTimeout() {
        console.log('Время вышло, отменяем мэтч');
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: this.currentMatchId,
                response: 'timeout'
            })
        })
        .then(() => {
            // Сбрасываем флаги
            this.waitingForPartner = false;
            
            // Показываем сообщение
            App.showCustomAlert(
                'Время истекло',
                'Вы не подтвердили тиммейта. Начните поиск заново.',
                () => {
                    App.showScreen('mainScreen', true);
                }
            );
        })
        .catch(error => {
            console.error('Error timing out match:', error);
            App.showScreen('mainScreen', true);
        });
    },
    
    acceptMatch() {
        console.log('Принимаем мэтч:', this.currentMatchId);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
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
                App.showAlert('✅ Тиммейт принял приглашение! Создаем игру...');
                this.createGame();
            } 
            else if (data.status === 'waiting') {
                // Ждем ответа второго игрока
                this.waitingForPartner = true;
                
                // Скрываем кнопки, показываем статус ожидания
                const buttons = document.querySelector('.match-buttons');
                if (buttons) buttons.style.display = 'none';
                
                const timer = document.getElementById('matchTimer');
                if (timer) {
                    timer.innerHTML = '⏳ Ожидаем ответа тиммейта...';
                    timer.style.color = '#FF5500';
                }
                
                // Продолжаем проверять статус
                this.startPolling();
            }
        })
        .catch(error => {
            console.error('Error accepting match:', error);
        });
    },
    
    rejectMatch() {
        console.log('Отклоняем мэтч:', this.currentMatchId);
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: telegram_id,
                match_id: this.currentMatchId,
                response: 'reject'
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Reject response:', data);
            
            // Устанавливаем блокировку на 2 секунды
            this.blockUntil = Date.now() + 2000;
            this.waitingForPartner = false;
            
            App.showAlert('❌ Мэтч отклонен');
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Error rejecting match:', error);
        });
    },
    
    createGame() {
        console.log('Создаем игру для match_id:', this.currentMatchId);
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: this.currentMatchId
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Game create response:', data);
            
            // Сбрасываем флаги
            this.waitingForPartner = false;
            
            // Показываем сообщение
            App.showCustomAlert(
                '✅ Игра создана!',
                `Ссылка на чат: ${data.chat_link}`,
                () => {
                    // Открываем ссылку в Telegram
                    if (window.Telegram?.WebApp?.openTelegramLink) {
                        window.Telegram.WebApp.openTelegramLink(data.chat_link);
                    }
                    App.showScreen('mainScreen', true);
                }
            );
        })
        .catch(error => {
            console.error('Error creating game:', error);
        });
    },
    
    showScreen(mode) {
        this.currentMode = mode;
        this.waitingForPartner = false;
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        this.resetTimer();
        this.startTimer();
        this.startPolling();
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
        
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
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

// Вспомогательная функция для кастомного алерта
App.showCustomAlert = function(title, message, callback) {
    // Создаем простой alert (позже можно заменить на красивый)
    alert(`${title}\n\n${message}`);
    if (callback) callback();
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
});

window.Search = Search;

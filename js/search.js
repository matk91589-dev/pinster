// ============================================
// ПОИСК (Telegram Mini App версия) - С БЭКЕНДОМ
// ============================================

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    pollingInterval: null,
    currentMatchId: null,
    
    init() {
        this.resetTimer();
    },
    
    setStyle(style, element) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.style-option');
        options.forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        App.hapticFeedback('light');
    },
    
    // НАЧАТЬ ПОИСК
    start(mode, value) {
        this.currentMode = mode;
        
        // Получаем данные из формы
        const data = this.collectSearchData(mode);
        
        // Отправляем на бэкенд
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                mode: mode,
                rating_value: data.rating_value,
                style: data.style,
                age: data.age,
                steam_link: data.steam_link,
                faceit_link: data.faceit_link
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'searching') {
                // Показываем экран поиска
                App.showScreen('searchScreen', false);
                document.getElementById('searchModeTitle').textContent = mode;
                
                this.resetTimer();
                this.startTimer();
                
                // Запускаем проверку статуса
                this.startPolling();
                
                App.hapticFeedback('medium');
            } else if (data.status === 'match_found') {
                // Сразу нашли мэтч!
                this.showMatchPopup(data);
            }
        })
        .catch(error => {
            console.error('Ошибка при запуске поиска:', error);
            App.showAlert('❌ Ошибка при запуске поиска');
        });
    },
    
    // СБОР ДАННЫХ С ЭКРАНА ПОИСКА
    collectSearchData(mode) {
        const data = {
            style: 'fan',
            age: 21,
            steam_link: '',
            faceit_link: '',
            rating_value: 0
        };
        
        // Определяем стиль (активный таб)
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) {
            data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        }
        
        if (mode === 'FACEIT') {
            data.rating_value = parseInt(document.getElementById('faceitELOInput')?.value) || 0;
            data.age = parseInt(document.getElementById('faceitAgeValue')?.value) || 21;
            data.steam_link = Profile.savedSteam || '';
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
        }
        else if (mode === 'PREMIER') {
            data.rating_value = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.faceit_link = Profile.savedFaceitLink || '';
        }
        else if (mode === 'MM PRIME') {
            data.rating_value = document.getElementById('primeRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.faceit_link = Profile.savedFaceitLink || '';
        }
        else if (mode === 'MM PUBLIC') {
            data.rating_value = document.getElementById('publicRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.faceit_link = Profile.savedFaceitLink || '';
        }
        
        return data;
    },
    
    // ЗАПУСТИТЬ ПРОВЕРКУ СТАТУСА
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(() => {
            this.checkMatchStatus();
        }, 2000); // Каждые 2 секунды
    },
    
    // ПРОВЕРИТЬ СТАТУС МЭТЧА
    checkMatchStatus() {
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram.WebApp.initDataUnsafe.user.id
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.match_found) {
                this.stopPolling();
                this.showMatchPopup(data);
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке статуса:', error);
        });
    },
    
    // ОСТАНОВИТЬ ПРОВЕРКУ
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },
    
    // ПОКАЗАТЬ ПОПАП С НАЙДЕННЫМ ТИММЕЙТОМ
    showMatchPopup(data) {
        this.currentMatchId = data.match_id;
        
        // Создаем попап
        const popup = document.createElement('div');
        popup.className = 'match-popup';
        popup.id = 'matchPopup';
        popup.innerHTML = `
            <div class="match-popup-content">
                <h3>✅ Найден тиммейт!</h3>
                <div class="match-info">
                    <p>👤 Ник: <span>${data.opponent.nick || 'Игрок'}</span></p>
                    <p>📅 Возраст: <span>${data.opponent.age}</span></p>
                    <p>🎮 Стиль: <span>${data.opponent.style === 'fan' ? 'Fan' : 'Tryhard'}</span></p>
                    <p>⭐ Совместимость: <span>${Math.round((1 - data.score/1000)*100)}%</span></p>
                </div>
                <div class="match-buttons">
                    <button onclick="Search.acceptMatch()" class="accept-btn">✅ Принять</button>
                    <button onclick="Search.rejectMatch()" class="reject-btn">❌ Отклонить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Останавливаем таймер поиска
        this.resetTimer();
        App.hapticFeedback('medium');
    },
    
    // ПРИНЯТЬ МЭТЧ
    acceptMatch() {
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                match_id: this.currentMatchId,
                response: 'accept'
            })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('matchPopup')?.remove();
            
            if (data.both_accepted) {
                // Оба приняли - создаем игру
                this.createGame();
            } else if (data.status === 'waiting') {
                App.showAlert('⏳ Ожидаем ответа второго игрока...');
                // Возвращаемся на экран поиска
                App.showScreen('searchScreen', false);
                this.startTimer();
                this.startPolling();
            }
        })
        .catch(error => {
            console.error('Ошибка при принятии мэтча:', error);
        });
    },
    
    // ОТКЛОНИТЬ МЭТЧ
    rejectMatch() {
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/match/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                match_id: this.currentMatchId,
                response: 'reject'
            })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('matchPopup')?.remove();
            App.showAlert('❌ Мэтч отклонен');
            
            // Возвращаемся на главную
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Ошибка при отклонении мэтча:', error);
        });
    },
    
    // СОЗДАТЬ ИГРУ (ЧАТ В TELEGRAM)
    createGame() {
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: this.currentMatchId
            })
        })
        .then(res => res.json())
        .then(data => {
            App.showAlert(`✅ Чат создан! Ссылка: ${data.chat_link}`);
            
            // Открываем ссылку в Telegram
            window.Telegram.WebApp.openTelegramLink(data.chat_link);
            
            // Возвращаемся на главную
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('Ошибка при создании игры:', error);
        });
    },
    
    // ПОКАЗАТЬ ЭКРАН ПОИСКА
    showScreen(mode) {
        this.currentMode = mode;
        App.showScreen('searchScreen', false);
        
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.resetTimer();
        this.startTimer();
        
        // Запускаем проверку статуса
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
        document.getElementById('searchTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        
        // Отправляем запрос на остановку поиска
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram.WebApp.initDataUnsafe.user.id
            })
        })
        .then(() => {
            App.showScreen('mainScreen', true);
            App.hapticFeedback('light');
        })
        .catch(error => {
            console.error('Ошибка при остановке поиска:', error);
            App.showScreen('mainScreen', true);
        });
    }
};

window.Search = Search;

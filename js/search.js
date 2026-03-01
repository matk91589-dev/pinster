// ============================================
// ПОИСК (Telegram Mini App версия) - ПОЛНОСТЬЮ РАБОЧИЙ
// ============================================

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    pollingInterval: null,
    currentMatchId: null,
    
    init() {
        this.resetTimer();
        console.log('Search.init()');
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
    
    // НАЧАТЬ ПОИСК - ИСПРАВЛЕНО!
    start(mode, value) {
        console.log('🚀 Search.start called with mode:', mode);
        
        // СНАЧАЛА ПОКАЗЫВАЕМ ЭКРАН ПОИСКА
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.currentMode = mode;
        this.resetTimer();
        this.startTimer();
        
        // ПОЛУЧАЕМ TELEGRAM ID
        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        console.log('🆔 Telegram ID:', telegram_id);
        
        if (!telegram_id) {
            console.error('❌ No telegram_id');
            App.showAlert('❌ Ошибка: не удалось получить Telegram ID');
            return;
        }
        
        // СОБИРАЕМ ДАННЫЕ
        const data = this.collectSearchData(mode);
        console.log('📦 Collected data:', data);
        
        // ОТПРАВЛЯЕМ ЗАПРОС
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
                faceit_link: data.faceit_link
            })
        })
        .then(res => {
            console.log('📥 Response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('📥 Response data:', data);
            
            if (data.status === 'searching') {
                console.log('✅ В очереди, запускаем polling');
                this.startPolling();
            } 
            else if (data.status === 'match_found') {
                console.log('✅ Мэтч найден сразу!', data);
                this.showMatchPopup(data);
            }
            else {
                console.log('❌ Неизвестный статус:', data);
            }
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            App.showAlert('❌ Ошибка при запуске поиска');
        });
    },
    
    collectSearchData(mode) {
        const data = {
            style: 'fan',
            age: 21,
            steam_link: '',
            faceit_link: '',
            rating_value: 0
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
        }
        else if (mode === 'PREMIER') {
            data.rating_value = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
        }
        else if (mode === 'MM PRIME') {
            data.rating_value = document.getElementById('primeRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
        }
        else if (mode === 'MM PUBLIC') {
            data.rating_value = document.getElementById('publicRankSelect')?.value || 'Silver 1';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 21;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.faceit_link = Profile?.savedFaceitLink || '';
        }
        
        return data;
    },
    
    startPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        console.log('🔄 Запуск polling (каждые 2 сек)');
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        console.log('🔍 Checking match status...');
        
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
            console.log('📥 Match check response:', data);
            
            if (data.match_found) {
                console.log('✅ Мэтч найден!');
                this.stopPolling();
                this.showMatchPopup(data);
            }
        })
        .catch(error => {
            console.error('❌ Error checking match:', error);
        });
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('🛑 Polling остановлен');
        }
    },
    
    showMatchPopup(data) {
        this.currentMatchId = data.match_id;
        console.log('🎯 Показываем попап для match_id:', data.match_id);
        
        // Удаляем старый попап если есть
        const oldPopup = document.getElementById('matchPopup');
        if (oldPopup) oldPopup.remove();
        
        const popup = document.createElement('div');
        popup.className = 'match-popup';
        popup.id = 'matchPopup';
        popup.innerHTML = `
            <div class="match-popup-content">
                <h3>✅ Найден тиммейт!</h3>
                <div class="match-info">
                    <p>👤 Возраст: <span>${data.opponent?.age || '?'}</span></p>
                    <p>🎮 Стиль: <span>${data.opponent?.style === 'fan' ? 'Fan' : 'Tryhard'}</span></p>
                    <p>⭐ Рейтинг: <span>${data.opponent?.rating || '?'}</span></p>
                    <p>📊 Совместимость: <span>${Math.round((1 - (data.score || 0)/1000)*100)}%</span></p>
                </div>
                <div class="match-buttons">
                    <button onclick="Search.acceptMatch()" class="accept-btn">✅ Принять</button>
                    <button onclick="Search.rejectMatch()" class="reject-btn">❌ Отклонить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.resetTimer();
        this.stopPolling();
    },
    
    acceptMatch() {
        console.log('✅ Принимаем мэтч:', this.currentMatchId);
        
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
            console.log('📥 Accept response:', data);
            document.getElementById('matchPopup')?.remove();
            
            if (data.both_accepted) {
                App.showAlert('✅ Оба приняли! Создаем игру...');
                this.createGame();
            } else if (data.status === 'waiting') {
                App.showAlert('⏳ Ожидаем ответа второго игрока...');
                // Возвращаемся на экран поиска
                App.showScreen('searchScreen', true);
                this.startTimer();
                this.startPolling();
            }
        })
        .catch(error => {
            console.error('❌ Error accepting match:', error);
            document.getElementById('matchPopup')?.remove();
        });
    },
    
    rejectMatch() {
        console.log('❌ Отклоняем мэтч:', this.currentMatchId);
        
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
            console.log('📥 Reject response:', data);
            document.getElementById('matchPopup')?.remove();
            App.showAlert('❌ Мэтч отклонен');
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('❌ Error rejecting match:', error);
            document.getElementById('matchPopup')?.remove();
        });
    },
    
    createGame() {
        console.log('🎮 Создаем игру для match_id:', this.currentMatchId);
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                match_id: this.currentMatchId
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('📥 Game create response:', data);
            App.showAlert(`✅ Чат создан! Ссылка: ${data.chat_link}`);
            
            // Открываем ссылку в Telegram
            if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink(data.chat_link);
            }
            
            App.showScreen('mainScreen', true);
        })
        .catch(error => {
            console.error('❌ Error creating game:', error);
        });
    },
    
    showScreen(mode) {
        this.currentMode = mode;
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
        console.log('🛑 Отмена поиска');
        this.resetTimer();
        this.stopPolling();
        
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
            console.error('❌ Error stopping search:', error);
            App.showScreen('mainScreen', true);
        });
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
});

window.Search = Search;

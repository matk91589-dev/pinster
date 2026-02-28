// ============================================
// ПОИСК (Telegram Mini App версия) - ИСПРАВЛЕННЫЙ
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
        console.log('Search.start called with mode:', mode);
        
        // ПРОСТО ПОКАЗЫВАЕМ ЭКРАН ПОИСКА (для теста)
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.currentMode = mode;
        this.resetTimer();
        this.startTimer();
        
        const data = this.collectSearchData(mode);
        
        fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 123456789,
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
                App.showScreen('searchScreen', true);
                document.getElementById('searchModeTitle').textContent = mode;
                this.resetTimer();
                this.startTimer();
                this.startPolling();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            App.showAlert('❌ Ошибка');
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
        
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) {
            data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        }
        
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
        this.pollingInterval = setInterval(() => this.checkMatchStatus(), 2000);
    },
    
    checkMatchStatus() {
        // TODO: будет проверять статус
        console.log('Checking match status...');
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },
    
    showMatchPopup(data) {
        this.currentMatchId = data.match_id;
        
        const popup = document.createElement('div');
        popup.className = 'match-popup';
        popup.id = 'matchPopup';
        popup.innerHTML = `
            <div class="match-popup-content">
                <h3>✅ Найден тиммейт!</h3>
                <div class="match-info">
                    <p>👤 Ник: <span>${data.opponent?.nick || 'Игрок'}</span></p>
                    <p>📅 Возраст: <span>${data.opponent?.age || '?'}</span></p>
                    <p>🎮 Стиль: <span>${data.opponent?.style === 'fan' ? 'Fan' : 'Tryhard'}</span></p>
                    <p>⭐ Совместимость: <span>${Math.round((1 - (data.score || 0)/1000)*100)}%</span></p>
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
        document.getElementById('matchPopup')?.remove();
        App.showAlert('✅ Мэтч принят!');
        App.showScreen('mainScreen', true);
    },
    
    rejectMatch() {
        document.getElementById('matchPopup')?.remove();
        App.showAlert('❌ Мэтч отклонен');
        App.showScreen('mainScreen', true);
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
        this.resetTimer();
        this.stopPolling();
        App.showScreen('mainScreen', true);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
});

window.Search = Search;



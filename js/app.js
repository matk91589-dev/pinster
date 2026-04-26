// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

(function() {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
        }
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        tg.onEvent('themeChanged', () => {
            document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        });
    }

    // Функция для обновления username на сервере
    let lastUsername = '';
    function updateUsername() {
        const tg = window.Telegram?.WebApp;
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        const username = tg?.initDataUnsafe?.user?.username || '';
        
        if (username === lastUsername) return;
        lastUsername = username;
        
        if (telegram_id && username) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/user/update-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id, username })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') console.log('✅ Username обновлён:', data.username);
            })
            .catch(e => console.error('Ошибка обновления username:', e));
        }
    }

    // Функция для показа главного экрана
    function showMainScreen() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
            
            const navMain = document.getElementById('navMain');
            if (navMain) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                navMain.classList.add('active');
            }
            
            const settingsIcon = document.getElementById('settingsIcon');
            if (settingsIcon) settingsIcon.classList.remove('active');
            
            return true;
        }
        return false;
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM загружен, запускаем Pingster...');
            showMainScreen();
            setTimeout(() => {
                updateUsername();
                initUser();
            }, 50);  // 🔥 БЫСТРЕЕ!
            initModules();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        showMainScreen();
        setTimeout(() => {
            updateUsername();
            initUser();
        }, 50);  // 🔥 БЫСТРЕЕ!
        initModules();
    }
    
    function initModules() {
        setTimeout(() => {
            try {
                if (typeof Search !== 'undefined') Search.init();
                if (typeof Profile !== 'undefined' && !Profile.isProfileLoaded) {
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                }
                console.log('✅ Модули инициализированы');
            } catch (e) {
                console.error('Ошибка инициализации модулей:', e);
            }
        }, 150);  // 🔥 БЫСТРЕЕ — 150мс вместо 300мс
    }
    
    function initUser() {
        const tg = window.Telegram?.WebApp;
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        console.log('Telegram ID:', telegram_id);
        
        if (telegram_id) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/user/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    username: tg?.initDataUnsafe?.user?.username || ''
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log('User init response:', data);
                if (data.player_id) {
                    localStorage.setItem('player_id', data.player_id);
                    if (data.nick) localStorage.setItem('nick', data.nick);
                }
            })
            .catch(error => console.error('Error initializing user:', error));
        }
    }
})();

// ============================================
// НАВИГАЦИЯ (ЕДИНЫЙ ОБЪЕКТ App)
// ============================================

window.App = window.App || {};

Object.assign(window.App, {
    currentScreen: null,
    
    hapticFeedback: function(style = 'light') {
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(style);
        }
    },
    
    // 🔥 КАСТОМНЫЙ ПОПАП В СТИЛЕ TELEGRAM
    showCustomPopup: function(title, message, onConfirm, onCancel, confirmText = 'Выйти', cancelText = 'Остаться', isDestructive = true) {
        const oldPopup = document.querySelector('.pingster-popup-overlay');
        if (oldPopup) oldPopup.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'pingster-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
        `;
        
        const popup = document.createElement('div');
        popup.className = 'pingster-popup';
        popup.style.cssText = `
            background: #1C1E24;
            border-radius: 14px;
            width: 100%;
            max-width: 320px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: popupFadeIn 0.2s ease;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 17px; font-weight: 600; color: #FFFFFF; margin-bottom: 8px;">${title}</div>
            <div style="font-size: 14px; color: #8E97A6; margin-bottom: 20px; line-height: 1.4;">${message}</div>
            <div style="display: flex; gap: 8px;">
                <button class="popup-cancel-btn" style="
                    flex: 1;
                    padding: 12px;
                    border-radius: 10px;
                    border: none;
                    background: #2A2F3A;
                    color: #FFFFFF;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                ">${cancelText}</button>
                <button class="popup-confirm-btn" style="
                    flex: 1;
                    padding: 12px;
                    border-radius: 10px;
                    border: none;
                    background: ${isDestructive ? '#FF3B30' : '#FF5500'};
                    color: #FFFFFF;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                ">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        if (!document.querySelector('#popup-animation-style')) {
            const style = document.createElement('style');
            style.id = 'popup-animation-style';
            style.textContent = `
                @keyframes popupFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        const cancelBtn = popup.querySelector('.popup-cancel-btn');
        const confirmBtn = popup.querySelector('.popup-confirm-btn');
        
        const close = () => {
            overlay.style.opacity = '0';
            popup.style.transform = 'scale(0.95)';
            setTimeout(() => overlay.remove(), 150);
        };
        
        cancelBtn.onclick = () => { close(); if (onCancel) onCancel(); };
        confirmBtn.onclick = () => { close(); if (onConfirm) onConfirm(); };
        
        overlay.onclick = (e) => {
            if (e.target === overlay) { close(); if (onCancel) onCancel(); }
        };
    },
    
    // 🔥 ПРОВЕРКА ФОРУМА — ВРЕМЕННО ОТКЛЮЧЕНА!
    checkForumBeforeSearch: function(callback) {
        // 🔥 ПРОПУСКАЕМ ВСЕХ БЕЗ ПРОВЕРКИ ФОРУМА!
        if (callback) callback(true);
    },
    
    checkSwipeAndExit: function(targetScreenId, updateNav) {
        const isInSwipe = (typeof Swipe !== 'undefined' && Swipe.currentMatchId);
        const isInWaiting = (typeof Swipe !== 'undefined' && Swipe.isWaitingMode);
        
        if (!isInSwipe && !isInWaiting) {
            this._doShowScreen(targetScreenId, updateNav);
            return;
        }
        
        const message = isInWaiting 
            ? 'Выйти из ожидания? Мэтч будет отменён.'
            : 'Выйти? Текущий мэтч будет отменён.';
        
        this.showCustomPopup('Выйти?', message,
            () => {
                const tg = window.Telegram?.WebApp;
                if (Swipe.currentMatchId) {
                    const telegram_id = tg?.initDataUnsafe?.user?.id;
                    fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegram_id, match_id: Swipe.currentMatchId, response: 'reject' })
                    }).catch(e => console.error('Ошибка reject:', e));
                }
                Swipe.exitSwipeMode('navigation');
                if (typeof Swipe.showToastMessage === 'function') Swipe.showToastMessage('Поиск отменён', false);
                this._doShowScreen(targetScreenId, updateNav);
            },
            () => {}, 'Выйти', 'Остаться', true
        );
    },
    
    _doShowScreen: function(screenId, updateNav = true) {
        const screen = document.getElementById(screenId);
        if (!screen) return;
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        this.currentScreen = screenId;
        
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            if (screenId === 'mainScreen') document.getElementById('navMain')?.classList.add('active');
            else if (screenId === 'profileScreen') document.getElementById('navProfile')?.classList.add('active');
        }
        
        this.hapticFeedback('light');
        
        const modeScreens = ['faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen'];
        if (modeScreens.includes(screenId)) {
            this.fillModeFields(screenId);
        }
    },
    
    fillModeFields: function(screenId) {
        let ageValue = localStorage.getItem('profile_age') || '';
        let steamLink = localStorage.getItem('profile_steam') || '';
        let faceitLink = localStorage.getItem('profile_faceit') || '';
        let rating = localStorage.getItem('user_rating') || '0';
        
        if (typeof Profile !== 'undefined') {
            if (Profile.savedAge) ageValue = Profile.savedAge;
            if (Profile.savedSteam) steamLink = Profile.savedSteam;
            if (Profile.savedFaceitLink) faceitLink = Profile.savedFaceitLink;
            if (Profile.savedRating) rating = String(Profile.savedRating);
        }
        
        if (screenId === 'faceitScreen') {
            const ageInput = document.getElementById('faceitAgeValue');
            const faceitInput = document.getElementById('faceitLinkInput');
            if (ageInput && ageValue) ageInput.value = ageValue;
            if (faceitInput && faceitLink) faceitInput.value = faceitLink;
        } else if (screenId === 'premierScreen') {
            const ageInput = document.getElementById('premierAgeValue');
            const steamInput = document.getElementById('premierSteamInput');
            if (ageInput && ageValue) ageInput.value = ageValue;
            if (steamInput && steamLink) steamInput.value = steamLink;
        } else if (screenId === 'primeScreen') {
            const ageInput = document.getElementById('primeAgeValue');
            const steamInput = document.getElementById('primeSteamInput');
            if (ageInput && ageValue) ageInput.value = ageValue;
            if (steamInput && steamLink) steamInput.value = steamLink;
        } else if (screenId === 'publicScreen') {
            const ageInput = document.getElementById('publicAgeValue');
            const steamInput = document.getElementById('publicSteamInput');
            if (ageInput && ageValue) ageInput.value = ageValue;
            if (steamInput && steamLink) steamInput.value = steamLink;
        }
    },
    
    showScreen: function(screenId, updateNav = true) {
        this.checkSwipeAndExit(screenId, updateNav);
    },
    
    goBack: function() {
        this._doShowScreen('mainScreen', true);
    },
    
    showAlert: function(message) {
        this.showCustomPopup('Pingster', message, () => {}, () => {}, 'OK', '', false);
    }
});

window.App = window.App;

// ============================================
// УДАЛЕНИЕ ЛОАДЕРА
// ============================================
window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }, 50);  // 🔥 БЫСТРЕЕ — 50мс вместо 100мс
});

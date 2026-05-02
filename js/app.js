// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ - Pingster v2.6
// ============================================

(function() {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        tg.onEvent('themeChanged', () => {
            document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        });
    }

    let lastUsername = '';
    function updateUsername() {
        const tg = window.Telegram?.WebApp;
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        const username = tg?.initDataUnsafe?.user?.username || '';
        if (username === lastUsername) return;
        lastUsername = username;
        if (telegram_id && username) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/user/update-username', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id, username })
            }).then(res => res.json()).then(data => {
                if (data.status === 'ok') console.log('✅ Username обновлён:', data.username);
            }).catch(e => console.error('Ошибка обновления username:', e));
        }
    }

    function showMainScreen() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.getElementById('navMain')?.classList.add('active');
            const settingsIcon = document.getElementById('settingsIcon');
            if (settingsIcon) settingsIcon.classList.remove('active');
            return true;
        }
        return false;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            showMainScreen();
            setTimeout(() => { updateUsername(); initUser(); }, 50);
            initModules();
        });
    } else {
        showMainScreen();
        setTimeout(() => { updateUsername(); initUser(); }, 50);
        initModules();
    }
    
    function initModules() {
        setTimeout(() => {
            try {
                if (typeof Search !== 'undefined') Search.init();
                if (typeof Anketa !== 'undefined') Anketa.init();
                if (typeof Profile !== 'undefined' && !Profile.isProfileLoaded) {
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                }
            } catch (e) { console.error('Ошибка инициализации модулей:', e); }
        }, 150);
    }
    
    function initUser() {
        const tg = window.Telegram?.WebApp;
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        if (telegram_id) {
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/user/init', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: telegram_id, username: tg?.initDataUnsafe?.user?.username || '' })
            }).then(res => res.json()).then(data => {
                if (data.player_id) {
                    localStorage.setItem('player_id', data.player_id);
                    if (data.nick) localStorage.setItem('nick', data.nick);
                }
            }).catch(error => console.error('Error initializing user:', error));
        }
    }
})();

// ============================================
// НАВИГАЦИЯ - Pingster v2.6
// ============================================

window.App = window.App || {};

Object.assign(window.App, {
    currentScreen: null,
    
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    
    hapticFeedback: function(style = 'light') {
        // 🔥 ФИКС: только валидные стили
        const validStyles = ['light', 'medium', 'heavy', 'rigid', 'soft'];
        const useStyle = validStyles.includes(style) ? style : 'light';
        try {
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(useStyle);
        } catch(e) {
            // Игнорируем ошибки haptic
        }
    },
    
    getTelegramId: function() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || localStorage.getItem('telegram_id') || null;
    },
    
    // 🔥 ПОПАП "СОЗДАЙ КАРТОЧКУ"
    showCreateCardPopup: function(mode) {
        const old = document.querySelector('.popup-overlay');
        if (old) old.remove();
        
        const modeNames = { faceit: 'FACEIT', premier: 'PREMIER', prime: 'PRIME', public: 'PUBLIC' };
        const modeName = modeNames[mode] || mode.toUpperCase();
        
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-card">
                <div class="popup-card-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7V5h4M19 7V5h-4M5 17v2h4M19 17v2h-4" stroke="#FF5500" stroke-width="1.4" stroke-linecap="round"/>
                        <circle cx="12" cy="10" r="2" stroke="#FF5500" stroke-width="1.5"/>
                        <path d="M8.5 16c1.3-2 5.7-2 7 0" stroke="#FF5500" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="popup-card-title">Нет карточки</div>
                <div class="popup-card-text">
                    Чтобы начать поиск в режиме <b>${modeName}</b>, сначала создайте свою карточку
                </div>
                <button class="popup-card-btn" id="popupCreateBtn">Создать карточку</button>
                <button class="popup-card-close" id="popupCloseBtn">Закрыть</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        };
        
        overlay.querySelector('#popupCreateBtn').onclick = () => {
            close();
            App.showScreen(mode + 'Screen', true);
        };
        
        overlay.querySelector('#popupCloseBtn').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
    },
    
    // 🔥 ОБРАБОТЧИК КЛИКА ПО РЕЖИМУ (ФИКС: POST вместо GET)
    handleModeClick: function(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            this.showScreen(mode + 'Screen', true);
            return;
        }
        
        fetch(`${this.BACKEND_URL}/api/anketa/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegramId) })
        })
        .then(r => r.json())
        .then(data => {
            const cards = data.anketas || [];
            const hasCard = cards.find(c => c.mode === mode);
            
            if (hasCard) {
                const rankValue = hasCard.rank || hasCard.elo || '';
                if (typeof Search !== 'undefined') {
                    Search.startBrowse(mode.toUpperCase(), rankValue);
                } else {
                    App.showScreen('swipeScreen', false);
                }
            } else {
                this.showCreateCardPopup(mode);
            }
        })
        .catch(() => {
            this.showCreateCardPopup(mode);
        });
    },
    
    // 🔥 СОЗДАНИЕ КАРТОЧКИ (ФИКС: haptic 'medium')
    createCard: function(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            this.showAlert('Ошибка авторизации');
            return;
        }
        
        let rank = '';
        let age = '';
        let link = '';
        let about = '';
        
        if (mode === 'faceit') {
            rank = document.getElementById('faceitELOInput')?.value || '';
            age = document.getElementById('faceitAge')?.value || '';
            link = document.getElementById('faceitLinkInput')?.value || '';
            about = document.getElementById('faceitAbout')?.value || '';
        } else if (mode === 'premier') {
            rank = document.getElementById('premierRatingInput')?.value || '';
            age = document.getElementById('premierAge')?.value || '';
            link = document.getElementById('premierLinkInput')?.value || '';
            about = document.getElementById('premierAbout')?.value || '';
        } else if (mode === 'prime') {
            rank = document.getElementById('primeRankSelect')?.value || '';
            age = document.getElementById('primeAge')?.value || '';
            link = document.getElementById('primeLinkInput')?.value || '';
            about = document.getElementById('primeAbout')?.value || '';
        } else if (mode === 'public') {
            rank = document.getElementById('publicRankSelect')?.value || '';
            age = document.getElementById('publicAge')?.value || '';
            link = document.getElementById('publicLinkInput')?.value || '';
            about = document.getElementById('publicAbout')?.value || '';
        }
        
        if (!rank) {
            this.showAlert('Укажите ранг / ELO / CS Rating');
            return;
        }
        if (!age || age < 1 || age > 100) {
            this.showAlert('Укажите возраст (1-100)');
            return;
        }
        
        const payload = {
            telegram_id: String(telegramId),
            mode: mode,
            rank: rank,
            age: parseInt(age),
            link: link,
            about: about
        };
        
        console.log('🃏 Создание карточки:', payload);
        
        fetch(`${this.BACKEND_URL}/api/anketa/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'ok') {
                // 🔥 ФИКС: 'medium' вместо 'success'
                this.hapticFeedback('medium');
                this.showCustomPopup(
                    '✅ Карточка создана!',
                    'Смотреть карточки других игроков?',
                    () => {
                        if (typeof Search !== 'undefined') {
                            Search.startBrowse(mode.toUpperCase(), rank);
                        } else {
                            App.showScreen('swipeScreen', false);
                        }
                    },
                    () => App.showScreen('mainScreen', true),
                    'Смотреть',
                    'На главную',
                    false
                );
            } else {
                this.showAlert('Ошибка: ' + (data.message || 'попробуйте позже'));
            }
        })
        .catch(err => {
            console.error('Ошибка создания карточки:', err);
            this.showAlert('Ошибка соединения');
        });
    },
    
    showCustomPopup: function(title, message, onConfirm, onCancel, confirmText = 'Выйти', cancelText = 'Остаться', isDestructive = true) {
        const oldPopup = document.querySelector('.pingster-popup-overlay');
        if (oldPopup) oldPopup.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'pingster-popup-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;';
        
        const popup = document.createElement('div');
        popup.style.cssText = 'background:#1C1E24;border-radius:14px;width:100%;max-width:320px;padding:20px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.5);animation:popupFadeIn 0.2s ease;';
        popup.innerHTML = `
            <div style="font-size:17px;font-weight:600;color:#FFFFFF;margin-bottom:8px;">${title}</div>
            <div style="font-size:14px;color:#8E97A6;margin-bottom:20px;line-height:1.4;">${message}</div>
            <div style="display:flex;gap:8px;">
                <button class="popup-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:none;background:#2A2F3A;color:#FFFFFF;font-size:15px;font-weight:600;cursor:pointer;">${cancelText}</button>
                <button class="popup-confirm-btn" style="flex:1;padding:12px;border-radius:10px;border:none;background:${isDestructive?'#FF3B30':'#FF5500'};color:#FFFFFF;font-size:15px;font-weight:600;cursor:pointer;">${confirmText}</button>
            </div>`;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        if (!document.querySelector('#popup-animation-style')) {
            const style = document.createElement('style');
            style.id = 'popup-animation-style';
            style.textContent = '@keyframes popupFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}';
            document.head.appendChild(style);
        }
        
        const cancelBtn = popup.querySelector('.popup-cancel-btn');
        const confirmBtn = popup.querySelector('.popup-confirm-btn');
        const close = () => { overlay.style.opacity='0'; popup.style.transform='scale(0.95)'; setTimeout(()=>overlay.remove(),150); };
        cancelBtn.onclick = () => { close(); if (onCancel) onCancel(); };
        confirmBtn.onclick = () => { close(); if (onConfirm) onConfirm(); };
        overlay.onclick = (e) => { if (e.target===overlay) { close(); if (onCancel) onCancel(); } };
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
            else if (screenId === 'anketaScreen') document.getElementById('navCards')?.classList.add('active');
            else if (screenId === 'profileScreen') document.getElementById('navProfile')?.classList.add('active');
        }
        
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) settingsIcon.classList.toggle('active', screenId === 'settingsScreen');
        
        this.hapticFeedback('light');
        
        if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
            setTimeout(() => {
                if (!Profile.isProfileLoaded && !Profile.isLoading) { Profile.loadProfileFromServer(); Profile.loadAvatar(); }
                else if (Profile.updateDisplay) Profile.updateDisplay();
            }, 200);
        }
        if (screenId === 'settingsScreen' && typeof Settings !== 'undefined') {
            setTimeout(() => { if (Settings.init) Settings.init(); }, 100);
        }
        if (screenId === 'anketaScreen' && typeof Anketa !== 'undefined') {
            setTimeout(() => Anketa.init(), 100);
        }
        
        const modeScreens = ['faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen'];
        if (modeScreens.includes(screenId)) {
            this.fillModeFields(screenId);
        }
    },
    
    fillModeFields: function(screenId) {
        let ageValue = localStorage.getItem('profile_age') || '';
        let steamLink = localStorage.getItem('profile_steam') || '';
        let faceitLink = localStorage.getItem('profile_faceit') || '';
        
        if (typeof Profile !== 'undefined') {
            if (Profile.savedAge) ageValue = Profile.savedAge;
            if (Profile.savedSteam) steamLink = Profile.savedSteam;
            if (Profile.savedFaceitLink) faceitLink = Profile.savedFaceitLink;
        }
        
        if (screenId === 'faceitScreen') {
            const a = document.getElementById('faceitAge'); if (a && ageValue) a.value = ageValue;
            const f = document.getElementById('faceitLinkInput'); if (f && faceitLink) f.value = faceitLink;
        } else if (screenId === 'premierScreen') {
            const a = document.getElementById('premierAge'); if (a && ageValue) a.value = ageValue;
            const s = document.getElementById('premierLinkInput'); if (s && steamLink) s.value = steamLink;
        } else if (screenId === 'primeScreen') {
            const a = document.getElementById('primeAge'); if (a && ageValue) a.value = ageValue;
            const s = document.getElementById('primeLinkInput'); if (s && steamLink) s.value = steamLink;
        } else if (screenId === 'publicScreen') {
            const a = document.getElementById('publicAge'); if (a && ageValue) a.value = ageValue;
            const s = document.getElementById('publicLinkInput'); if (s && steamLink) s.value = steamLink;
        }
    },
    
    showScreen: function(screenId, updateNav = true) {
        this._doShowScreen(screenId, updateNav);
    },
    
    goBack: function() {
        const isInSwipe = (typeof Swipe !== 'undefined' && Swipe.currentAnketa);
        
        if (isInSwipe) {
            this.showCustomPopup('Выйти?', 'Вернуться на главный экран?', 
                () => { 
                    if (typeof Swipe !== 'undefined') Swipe.exitSwipeMode('user_back');
                    this._doShowScreen('mainScreen', true); 
                }, 
                () => {}, 'Да', 'Нет', false
            );
        } else {
            this._doShowScreen('mainScreen', true);
        }
    },
    
    showAlert: function(message) {
        this.showCustomPopup('Pingster', message, () => {}, () => {}, 'OK', '', false);
    }
});

window.App = window.App;

window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('app-loader');
        if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 300); }
    }, 50);
});

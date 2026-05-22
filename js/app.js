// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ - Pingster v5.0
// ============================================

(function() {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
        
        // 🔥 Полноэкранный режим
        if (tg.isExpanded) {
            window.TG_FEATURES.fullscreen = true;
        }
        
        // 🔥 Проверка DeviceStorage
        if (tg.isVersionAtLeast('6.9')) {
            window.TG_FEATURES.deviceStorage = true;
        }
        
        // 🔥 Проверка нативного чата
        if (tg.requestChat) {
            window.TG_FEATURES.nativeChat = true;
        }
        
        window.TG_FEATURES.version = tg.version;
        console.log('📱 TG Features:', window.TG_FEATURES);
        
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
                if (data.status === 'ok') console.log('✅ Username:', data.username);
            }).catch(e => console.error('Username error:', e));
        }
    }

    function showMainScreen() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.getElementById('navMain')?.classList.add('active');
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
            } catch (e) { console.error('Init error:', e); }
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
                    
                    // 🔥 Кешируем в DeviceStorage
                    if (window.TG_FEATURES.deviceStorage) {
                        window.saveToDeviceStorage('user_data', {
                            player_id: data.player_id,
                            nick: data.nick,
                            timestamp: Date.now()
                        });
                    }
                    
                    window.App.refreshCards();
                }
            }).catch(error => console.error('Init user error:', error));
        }
    }
})();

// ============================================
// НАВИГАЦИЯ - Pingster v5.0
// ============================================

window.App = window.App || {};

Object.assign(window.App, {
    currentScreen: null,
    cachedCards: {},
    cardsLoaded: false,
    
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    
    // 🔥 ХАПТИКА
    hapticFeedback: function(style = 'light') {
        const validStyles = ['light', 'medium', 'heavy', 'rigid', 'soft'];
        const useStyle = validStyles.includes(style) ? style : 'light';
        try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(useStyle); } catch(e) {}
    },
    
    // 🔥 ПОЛУЧИТЬ TELEGRAM ID
    getTelegramId: function() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || localStorage.getItem('telegram_id') || null;
    },

    // 🔥 ОТКРЫТЬ НАТИВНЫЙ ЧАТ
    openNativeChat: function(username, nickname) {
        console.log('🚀 Native chat:', username);
        
        if (window.TG_FEATURES.nativeChat && window.Telegram?.WebApp?.requestChat) {
            try {
                window.Telegram.WebApp.requestChat({ username: username });
                this.hapticFeedback('medium');
                return;
            } catch(e) {
                console.log('⚠️ requestChat error:', e);
            }
        }
        
        // Фолбек
        if (username) {
            window.open('https://t.me/' + username, '_blank');
        }
    },

    // 🔥 СИНХРОНИЗАЦИЯ С DEVICE STORAGE
    syncToDeviceStorage: function(key, data) {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) indicator.classList.add('visible');
        
        window.saveToDeviceStorage(key, data, (success) => {
            if (indicator) {
                setTimeout(() => indicator.classList.remove('visible'), 1000);
            }
            console.log('📱 Synced:', key, success);
        });
    },

    // 🔥 ПОКАЗАТЬ МЭТЧ ПОПАП
    showMatchPopup: function(matchData) {
        const old = document.querySelector('.popup-overlay');
        if (old) old.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-card">
                <div class="popup-card-icon match-popup-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <use href="#icon-match"/>
                    </svg>
                </div>
                <div class="popup-card-title">Взаимный мэтч!</div>
                <div class="popup-card-text">
                    Вы и <b>${matchData.nick || 'игрок'}</b> лайкнули друг друга<br>
                    <span style="color:#FF5500;">Теперь вы тиммейты!</span>
                </div>
                ${matchData.username ? `
                <button class="popup-card-btn" onclick="window.App.openNativeChat('${matchData.username}', '${matchData.nick}')">
                    <svg width="18" height="18" viewBox="0 0 24 24"><use href="#icon-chat"/></svg>
                    Написать ${matchData.nick}
                </button>` : ''}
                <button class="popup-card-btn secondary" onclick="this.closest('.popup-overlay').remove()">
                    Продолжить
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.hapticFeedback('heavy');
        
        overlay.onclick = (e) => { 
            if (e.target === overlay) overlay.remove(); 
        };
    },

    // 🔥 ПРОВЕРКА КАРТОЧКИ
    handleModeClick: function(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) {
            this.showScreen(mode + 'Screen', true);
            return;
        }

        const cachedCard = this.cachedCards[mode];
        
        if (cachedCard) {
            console.log('🃏 Cached:', mode);
            this.openSwipe(mode, cachedCard.rank || '');
            return;
        }

        console.log('📡 API check:', mode);
        this.checkCardViaAPI(mode);
    },

    // 🔥 ПРОВЕРКА ЧЕРЕЗ API
    checkCardViaAPI: function(mode) {
        const telegramId = this.getTelegramId();
        
        fetch(`${this.BACKEND_URL}/api/anketa/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegramId) })
        })
        .then(r => r.json())
        .then(data => {
            const cards = data.anketas || [];
            
            this.cachedCards = {};
            cards.forEach(c => { this.cachedCards[c.mode] = c; });
            this.cardsLoaded = true;
            
            // 🔥 Кешируем карточки
            this.syncToDeviceStorage('cached_cards', {
                cards: this.cachedCards,
                timestamp: Date.now()
            });
            
            const hasCard = cards.find(c => c.mode === mode);
            
            if (hasCard) {
                console.log('✅ Found:', mode);
                this.openSwipe(mode, hasCard.rank || '');
            } else {
                console.log('❌ Not found:', mode);
                this.showCreateCardPopup(mode);
            }
        })
        .catch(() => {
            this.showCreateCardPopup(mode);
        });
    },

    // 🔥 ОТКРЫТЬ СВАЙП
    openSwipe: function(mode, rankValue) {
        if (typeof Search !== 'undefined') {
            Search.startBrowse(mode.toUpperCase(), rankValue);
        } else {
            this.showScreen('swipeScreen', false);
        }
    },

    // 🔥 ОБНОВИТЬ КЭШ
    refreshCards: function() {
        const telegramId = this.getTelegramId();
        if (!telegramId) return;

        fetch(`${this.BACKEND_URL}/api/anketa/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegramId) })
        })
        .then(r => r.json())
        .then(data => {
            if (data.anketas) {
                this.cachedCards = {};
                data.anketas.forEach(c => { this.cachedCards[c.mode] = c; });
                this.cardsLoaded = true;
                
                this.syncToDeviceStorage('cached_cards', {
                    cards: this.cachedCards,
                    timestamp: Date.now()
                });
                
                console.log('🃏 Cache updated:', Object.keys(this.cachedCards));
            }
        })
        .catch(() => {});
    },
    
    // 🔥 ПОПАП "НЕТ КАРТОЧКИ"
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <use href="#icon-cards"/>
                    </svg>
                </div>
                <div class="popup-card-title">Нет карточки</div>
                <div class="popup-card-text">
                    Чтобы начать поиск в режиме <b>${modeName}</b>, сначала создайте свою карточку
                </div>
                <button class="popup-card-btn" id="popupCreateBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24"><use href="#icon-edit"/></svg>
                    Создать карточку
                </button>
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
    
    // 🔥 СОЗДАТЬ КАРТОЧКУ
    createCard: function(mode) {
        const telegramId = this.getTelegramId();
        if (!telegramId) { this.showAlert('Ошибка авторизации'); return; }
        
        let rank = '', age = '', link = '', about = '';
        
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
        
        if (!rank) { this.showAlert('Укажите ранг / ELO / CS Rating'); return; }
        if (!age || age < 1 || age > 100) { this.showAlert('Укажите возраст (1-100)'); return; }
        
        const payload = { 
            telegram_id: String(telegramId), 
            mode: mode, 
            rank: rank, 
            age: parseInt(age), 
            link: link, 
            about: about 
        };
        
        fetch(`${this.BACKEND_URL}/api/anketa/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'ok') {
                this.refreshCards();
                this.hapticFeedback('medium');
                this.showCustomPopup(
                    'Карточка создана',
                    'Смотреть карточки других игроков?',
                    () => {
                        if (typeof Search !== 'undefined') Search.startBrowse(mode.toUpperCase(), rank);
                        else App.showScreen('swipeScreen', false);
                    },
                    () => App.showScreen('mainScreen', true),
                    'Смотреть', 'На главную', false
                );
            } else {
                this.showAlert('Ошибка: ' + (data.message || 'попробуйте позже'));
            }
        })
        .catch(err => { 
            console.error('Create card error:', err); 
            this.showAlert('Ошибка соединения'); 
        });
    },
    
    // 🔥 КАСТОМНЫЙ ПОПАП
    showCustomPopup: function(title, message, onConfirm, onCancel, confirmText, cancelText, isDestructive) {
        confirmText = confirmText || 'OK';
        cancelText = cancelText || 'Отмена';
        isDestructive = isDestructive !== undefined ? isDestructive : true;
        
        const oldPopup = document.querySelector('.pingster-popup-overlay');
        if (oldPopup) oldPopup.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'pingster-popup-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;right:0;bottom:0;
            background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);
            z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;
            animation: fadeIn 0.2s ease;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            background:linear-gradient(145deg, #1c1c24, #16161c);
            border:1px solid rgba(255,255,255,0.08);
            border-radius:16px;width:100%;max-width:320px;padding:24px 20px;
            text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.5);
            animation: popupIn 0.3s cubic-bezier(0.22,0.61,0.36,1);
        `;
        
        const hasCancel = cancelText && cancelText !== '';
        
        popup.innerHTML = `
            <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;">${title}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px;line-height:1.5;">${message}</div>
            <div style="display:flex;gap:8px;${hasCancel ? '' : 'justify-content:center;'}">
                ${hasCancel ? `<button class="popup-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:14px;font-weight:600;cursor:pointer;">${cancelText}</button>` : ''}
                <button class="popup-confirm-btn" style="${hasCancel ? 'flex:1;' : 'width:100%;'}padding:12px;border-radius:10px;border:none;background:${isDestructive ? '#FF5500' : '#FF5500'};color:#fff;font-size:14px;font-weight:600;cursor:pointer;">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        const close = () => { 
            overlay.style.opacity = '0'; 
            setTimeout(() => overlay.remove(), 150); 
        };
        
        if (hasCancel) {
            popup.querySelector('.popup-cancel-btn').onclick = () => { 
                close(); 
                if (onCancel) onCancel(); 
            };
        }
        
        popup.querySelector('.popup-confirm-btn').onclick = () => { 
            close(); 
            if (onConfirm) onConfirm(); 
        };
        
        overlay.onclick = (e) => { 
            if (e.target === overlay) { 
                close(); 
                if (onCancel) onCancel(); 
            } 
        };
    },
    
    // 🔥 ПОКАЗАТЬ ЭКРАН
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
                if (!Profile.isProfileLoaded && !Profile.isLoading) { 
                    Profile.loadProfileFromServer(); 
                    Profile.loadAvatar(); 
                }
            }, 200);
        }
        if (screenId === 'anketaScreen' && typeof Anketa !== 'undefined') {
            setTimeout(() => Anketa.init(), 100);
        }
    },
    
    showScreen: function(screenId, updateNav = true) {
        this._doShowScreen(screenId, updateNav);
    },
    
    // 🔥 НАЗАД
    goBack: function() {
        if (typeof Swipe !== 'undefined' && Swipe.current) {
            this.showCustomPopup(
                'Выйти?', 
                'Вернуться на главный экран?',
                () => { 
                    if (typeof Swipe !== 'undefined') Swipe.exitSwipeMode();
                    this._doShowScreen('mainScreen', true); 
                }, 
                () => {}, 
                'Да', 'Нет', false
            );
        } else {
            this._doShowScreen('mainScreen', true);
        }
    },
    
    // 🔥 АЛЕРТ
    showAlert: function(message) {
        this.showCustomPopup('Pingster', message, () => {}, null, 'OK', '', false);
    },

    // 🔥 НАСТРОЙКИ → КАРТОЧКИ
    goToCards: function(tab) {
        App.showScreen('anketaScreen', true);
        setTimeout(() => {
            if (typeof Anketa !== 'undefined') {
                const tabEl = document.querySelector(
                    tab === 'my' 
                        ? '#anketaScreen .team-tab:first-child' 
                        : '#anketaScreen .team-tab:last-child'
                );
                Anketa.switchTab(tab, tabEl);
            }
        }, 200);
    },
    
    // 🔥 НАСТРОЙКИ → ТИММЕЙТЫ / ЛИДЕРБОРД
    goToTeam: function(tab) {
        App.showScreen('teamScreen', true);
        setTimeout(() => {
            if (typeof Team !== 'undefined') {
                const tabEl = document.querySelector(
                    tab === 'friends'
                        ? '#teamScreen .team-tab:first-child'
                        : '#teamScreen .team-tab:last-child'
                );
                Team.switchTab(tab, tabEl);
            }
        }, 200);
    }
});

window.App = window.App;

window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('app-loader');
        if (loader) { 
            loader.style.opacity = '0'; 
            setTimeout(() => loader.remove(), 300); 
        }
    }, 50);
});

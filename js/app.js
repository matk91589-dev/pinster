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

    // Функция для обновления username на сервере (только при реальных изменениях)
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
                body: JSON.stringify({
                    telegram_id: telegram_id,
                    username: username
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    console.log('✅ Username обновлён:', data.username);
                }
            })
            .catch(e => console.error('Ошибка обновления username:', e));
        }
    }

    // Функция для показа главного экрана
    function showMainScreen() {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            console.log('✅ mainScreen найден, показываем');
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
            }, 100);
            initModules();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        showMainScreen();
        setTimeout(() => {
            updateUsername();
            initUser();
        }, 100);
        initModules();
    }
    
    function initModules() {
        setTimeout(() => {
            try {
                if (typeof Search !== 'undefined') Search.init();
                console.log('✅ Модули инициализированы');
            } catch (e) {
                console.error('Ошибка инициализации модулей:', e);
            }
        }, 300);
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
                    if (data.pingcoins) localStorage.setItem('pingcoins', data.pingcoins);
                }
            })
            .catch(error => console.error('Error initializing user:', error));
        } else {
            console.warn('Нет Telegram ID');
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
        // Удаляем старый попап если есть
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
        
        // Добавляем стиль анимации если его нет
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
        
        cancelBtn.onclick = () => {
            close();
            if (onCancel) onCancel();
        };
        
        confirmBtn.onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };
        
        // Закрытие по клику на оверлей
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                close();
                if (onCancel) onCancel();
            }
        };
        
        // Ховер эффекты
        cancelBtn.onmouseover = () => cancelBtn.style.opacity = '0.8';
        cancelBtn.onmouseout = () => cancelBtn.style.opacity = '1';
        confirmBtn.onmouseover = () => confirmBtn.style.opacity = '0.8';
        confirmBtn.onmouseout = () => confirmBtn.style.opacity = '1';
    },
    
    // 🔥 ПРОВЕРКА НА СВАЙП И ВЫХОД
    checkSwipeAndExit: function(targetScreenId, updateNav) {
        const isInSwipe = (typeof Swipe !== 'undefined' && Swipe.currentMatchId);
        const isInWaiting = (typeof Swipe !== 'undefined' && Swipe.isWaitingMode);
        
        if (!isInSwipe && !isInWaiting) {
            // Не в свайпе — просто переходим
            this._doShowScreen(targetScreenId, updateNav);
            return;
        }
        
        const message = isInWaiting 
            ? 'Выйти из ожидания? Мэтч будет отменён.'
            : 'Выйти? Текущий мэтч будет отменён.';
        
        this.showCustomPopup(
            'Выйти?',
            message,
            () => {
                // Подтверждение — выходим
                const tg = window.Telegram?.WebApp;
                if (Swipe.currentMatchId) {
                    const telegram_id = tg?.initDataUnsafe?.user?.id;
                    fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            telegram_id: telegram_id,
                            match_id: Swipe.currentMatchId,
                            response: 'reject'
                        })
                    }).catch(e => console.error('Ошибка reject:', e));
                }
                Swipe.exitSwipeMode('navigation');
                
                if (typeof Swipe.showToastMessage === 'function') {
                    Swipe.showToastMessage('Поиск отменён', false);
                }
                
                this._doShowScreen(targetScreenId, updateNav);
            },
            () => {
                // Отмена — ничего не делаем
                console.log('Остаёмся на экране');
            },
            'Выйти',
            'Остаться',
            true
        );
    },
    
    // Внутренний метод для реального перехода
    _doShowScreen: function(screenId, updateNav = true) {
        const screen = document.getElementById(screenId);
        if (!screen) {
            console.error(`❌ Экран не найден: ${screenId}`);
            return;
        }
        
        console.log('📱 Переход на экран:', screenId);
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        this.currentScreen = screenId;
        
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (screenId === 'mainScreen') {
                document.getElementById('navMain')?.classList.add('active');
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
            }
        }
        
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            if (screenId === 'settingsScreen') {
                settingsIcon.classList.add('active');
            } else {
                settingsIcon.classList.remove('active');
            }
        }
        
        this.hapticFeedback('light');
        
        if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
            setTimeout(() => {
                if (!Profile.isProfileLoaded && !Profile.isLoading) {
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                } else if (Profile.updateDisplay) {
                    Profile.updateDisplay();
                }
            }, 200);
        }
        
        if (screenId === 'settingsScreen' && typeof Settings !== 'undefined') {
            setTimeout(() => {
                if (Settings.init) Settings.init();
            }, 100);
        }
    },
    
    // 🔥 ПУБЛИЧНЫЙ МЕТОД ДЛЯ ПЕРЕХОДА (С ПРОВЕРКОЙ СВАЙПА)
    showScreen: function(screenId, updateNav = true) {
        this.checkSwipeAndExit(screenId, updateNav);
    },
    
    // 🔥 МЕТОД ДЛЯ СТРЕЛКИ НАЗАД
    goBack: function() {
        const isInSwipe = (typeof Swipe !== 'undefined' && Swipe.currentMatchId);
        const isInWaiting = (typeof Swipe !== 'undefined' && Swipe.isWaitingMode);
        
        const doExit = () => {
            if (isInSwipe || isInWaiting) {
                const tg = window.Telegram?.WebApp;
                if (Swipe.currentMatchId) {
                    const telegram_id = tg?.initDataUnsafe?.user?.id;
                    fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            telegram_id: telegram_id,
                            match_id: Swipe.currentMatchId,
                            response: 'reject'
                        })
                    }).catch(e => console.error('Ошибка reject при выходе:', e));
                }
                
                Swipe.exitSwipeMode('user_back');
                
                if (typeof Swipe.showToastMessage === 'function') {
                    Swipe.showToastMessage('Поиск отменён', false);
                }
            }
            
            this._doShowScreen('mainScreen', true);
        };
        
        if (isInSwipe || isInWaiting) {
            const message = isInWaiting 
                ? 'Выйти из ожидания? Мэтч будет отменён.'
                : 'Выйти? Текущий мэтч будет отменён.';
            
            this.showCustomPopup(
                'Выйти?',
                message,
                () => doExit(),
                () => console.log('Остаёмся'),
                'Выйти',
                'Остаться',
                true
            );
        } else {
            // Не в свайпе — спрашиваем про возврат на главную
            this.showCustomPopup(
                'Выйти?',
                'Вернуться на главный экран?',
                () => this._doShowScreen('mainScreen', true),
                () => console.log('Остаёмся'),
                'Да',
                'Нет',
                false
            );
        }
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
            setTimeout(function() {
                loader.remove();
            }, 300);
        }
        console.log('✅ Лоадер удален');
    }, 100);
});

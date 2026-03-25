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

    // ✅ Функция для показа главного экрана
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
            return true;
        }
        return false;
    }

    // ✅ Удаление лоадера (оверлея)
    function removeLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 300);
        }
    }

    // ✅ Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM загружен, запускаем Pingster...');
            showMainScreen();
            initUser();
            initModules();
            // Удаляем лоадер после того как DOM готов и экран показан
            removeLoader();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        showMainScreen();
        initUser();
        initModules();
        // Удаляем лоадер сразу
        removeLoader();
    }
    
    function initModules() {
        setTimeout(() => {
            try {
                if (typeof Shop !== 'undefined') {
                    if (Shop.setupListeners) Shop.setupListeners();
                    else if (Shop.init) Shop.init();
                }
                if (typeof Search !== 'undefined') Search.init();
                console.log('✅ Модули инициализированы');
            } catch (e) {
                console.error('Ошибка инициализации модулей:', e);
            }
        }, 500);
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
            
            setTimeout(() => {
                if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                    Search.checkMatchStatus();
                }
            }, 2000);
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
    
    showScreen: function(screenId, updateNav = true) {
        const screen = document.getElementById(screenId);
        if (!screen) {
            console.error(`❌ Экран не найден: ${screenId}`);
            return;
        }
        
        console.log('📱 Переход на экран:', screenId);
        
        // МГНОВЕННО переключаем экран без задержек
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        this.currentScreen = screenId;
        
        // Обновляем навигацию
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (screenId === 'mainScreen') {
                document.getElementById('navMain')?.classList.add('active');
            } else if (screenId === 'shopScreen') {
                document.getElementById('navShop')?.classList.add('active');
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
            }
        }
        
        // Вибрация
        this.hapticFeedback('light');
        
        // Фоновая загрузка данных БЕЗ перекрытия экрана
        if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
            setTimeout(() => {
                if (!Profile.isProfileLoaded && !Profile.isLoading) {
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                } else if (Profile.updateDisplay) {
                    Profile.updateDisplay();
                }
            }, 100);
        }
        
        if (screenId === 'shopScreen' && typeof Shop !== 'undefined') {
            setTimeout(() => {
                if (!Shop._initialized && Shop.init) {
                    Shop.init();
                }
                if (typeof Shop.renderShop === 'function') {
                    Shop.renderShop();
                }
                if (typeof window.loadShopImages === 'function') {
                    window.loadShopImages();
                }
            }, 100);
        }
        
        if (screenId === 'settingsScreen' && typeof Settings !== 'undefined') {
            setTimeout(() => {
                if (Settings.init) Settings.init();
            }, 100);
        }
    },
    
    showAlert: function(message) {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }
});

window.App = window.App;

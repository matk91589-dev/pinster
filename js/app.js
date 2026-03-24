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

    // ✅ Функция для гарантированного показа главного экрана
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
        } else {
            console.warn('⚠️ mainScreen не найден, повторная попытка через 50ms');
            return false;
        }
    }

    // ✅ Фоновая загрузка данных
    async function backgroundLoadData() {
        console.log('🚀 Начинаем фоновую загрузку данных...');
        
        try {
            if (typeof Profile !== 'undefined') {
                if (!Profile.telegramId) {
                    Profile.telegramId = Profile.getTelegramId();
                }
                console.log('📥 Загружаем профиль...');
                await Profile.loadProfileFromServer();
                await Profile.loadAvatar();
                console.log('✅ Профиль загружен');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error);
        }
        
        try {
            if (typeof Friends !== 'undefined') {
                console.log('📥 Загружаем друзей...');
                await Friends.loadFriendsList();
                console.log('✅ Друзья загружены');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
        }
        
        try {
            if (typeof Shop !== 'undefined') {
                console.log('📥 Загружаем магазин...');
                if (typeof Shop.loadShopItems === 'function') {
                    await Shop.loadShopItems();
                } else if (typeof Shop.init === 'function') {
                    await Shop.init();
                }
                console.log('✅ Магазин загружен');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки магазина:', error);
        }
        
        console.log('🎉 Все данные загружены!');
    }

    // ✅ Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM загружен, запускаем Pingster...');
            if (showMainScreen()) {
                setTimeout(() => backgroundLoadData(), 100);
            }
            initUser();
            initModules();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        if (showMainScreen()) {
            setTimeout(() => backgroundLoadData(), 100);
        }
        initUser();
        initModules();
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
        }, 100);
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
        
        const content = document.querySelector('.content');
        if (content) {
            content.classList.remove('settings-mode', 'shop-mode');
        }
        if (screenId === 'settingsScreen') content?.classList.add('settings-mode');
        if (screenId === 'shopScreen') content?.classList.add('shop-mode');
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        this.currentScreen = screenId;
        
        // ✅ ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
        if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
            setTimeout(() => {
                if (!Profile.isProfileLoaded && !Profile.isLoading) {
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                } else {
                    Profile.updateDisplay();
                }
            }, 50);
        }
        
        // ✅ ИНИЦИАЛИЗАЦИЯ МАГАЗИНА
        if (screenId === 'shopScreen' && typeof Shop !== 'undefined') {
            setTimeout(() => {
                // Сначала инициализируем, если еще не инициализирован
                if (!Shop._initialized && Shop.init) {
                    Shop.init();
                    console.log('🛒 Shop инициализирован при открытии');
                }
                // Потом отрисовываем
                if (typeof Shop.renderShop === 'function') {
                    Shop.renderShop();
                }
                if (typeof window.loadShopImages === 'function') {
                    window.loadShopImages();
                }
            }, 100);
        }
        
        // ✅ ИНИЦИАЛИЗАЦИЯ ДРУЗЕЙ
        if (screenId === 'friendsScreen' && typeof Friends !== 'undefined') {
            setTimeout(() => {
                if (!Friends.friendsListLoaded && Friends.friendsList.length === 0) {
                    Friends.loadFriendsList();
                } else {
                    Friends.renderFriendsPage();
                }
            }, 50);
        }
        
        // ✅ ИНИЦИАЛИЗАЦИЯ НАСТРОЕК (КНОПКИ ЗВУКА)
        if (screenId === 'settingsScreen' && typeof Settings !== 'undefined') {
            setTimeout(() => {
                console.log('⚙️ Инициализация настроек');
                if (Settings.init) {
                    Settings.init();
                }
            }, 100);
        }
        
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
        
        // Вибрация при переходе
        this.hapticFeedback('light');
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

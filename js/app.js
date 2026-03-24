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
            
            // Активируем навигацию
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

    // ✅ Фоновая загрузка данных (последовательная)
    async function backgroundLoadData() {
        console.log('🚀 Начинаем фоновую загрузку данных...');
        
        // 1. Загружаем профиль
        try {
            if (typeof Profile !== 'undefined') {
                // Убеждаемся, что telegramId установлен
                if (!Profile.telegramId) {
                    Profile.telegramId = Profile.getTelegramId();
                }
                console.log('📥 1/3 Загружаем профиль...');
                await Profile.loadProfileFromServer();
                console.log('✅ Профиль загружен');
                
                // Загружаем аватар
                await Profile.loadAvatar();
                console.log('✅ Аватар загружен');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error);
        }
        
        // 2. Загружаем друзей (после профиля)
        try {
            if (typeof Friends !== 'undefined') {
                console.log('📥 2/3 Загружаем друзей...');
                await Friends.loadFriendsList();
                console.log('✅ Друзья загружены');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
        }
        
        // 3. Загружаем магазин (после друзей)
        try {
            if (typeof Shop !== 'undefined') {
                console.log('📥 3/3 Загружаем магазин...');
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

    // ✅ Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM загружен, запускаем Pingster...');
            
            // Показываем главный экран
            if (showMainScreen()) {
                // Запускаем фоновую загрузку данных
                setTimeout(() => {
                    backgroundLoadData();
                }, 100);
            }
            
            // Инициализируем пользователя (Telegram)
            initUser();
            
            // Инициализируем модули (неблокирующая, для обработчиков событий)
            initModules();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        
        // Показываем главный экран
        if (showMainScreen()) {
            // Запускаем фоновую загрузку данных
            setTimeout(() => {
                backgroundLoadData();
            }, 100);
        }
        
        // Инициализируем пользователя (Telegram)
        initUser();
        
        // Инициализируем модули (неблокирующая, для обработчиков событий)
        initModules();
    }
    
    function initModules() {
        // Инициализация модулей (только настройка обработчиков, без загрузки данных)
        setTimeout(() => {
            try {
                if (typeof Shop !== 'undefined' && Shop.setupListeners) {
                    Shop.setupListeners();
                } else if (typeof Shop !== 'undefined' && typeof Shop.init === 'function') {
                    // Если нет setupListeners, но есть init - вызываем его
                    Shop.init();
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
            
            // Проверка матча через 2 секунды
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

if (!window.App) {
    window.App = {};
}

Object.assign(window.App, {
    showScreen: function(screenId, updateNav = true) {
        const screen = document.getElementById(screenId);
        if (!screen) {
            console.error(`❌ Экран не найден: ${screenId}`);
            return;
        }
        
        console.log('App.showScreen:', screenId);
        
        const content = document.querySelector('.content');
        if (content) {
            content.classList.remove('settings-mode');
            content.classList.remove('shop-mode');
        }
        if (screenId === 'settingsScreen' && content) content.classList.add('settings-mode');
        if (screenId === 'shopScreen' && content) content.classList.add('shop-mode');
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        
        // ✅ ПРОФИЛЬ - если данные уже загружены, просто отображаем
        if (screenId === 'profileScreen') {
            setTimeout(() => {
                if (typeof Profile !== 'undefined') {
                    // Если профиль еще не загружен - загружаем
                    if (!Profile.isProfileLoaded && !Profile.isLoading) {
                        Profile.loadProfileFromServer();
                        Profile.loadAvatar();
                    } else {
                        // Если уже загружен - просто обновляем отображение
                        Profile.updateDisplay();
                    }
                }
            }, 50);
        }
        
        // ✅ МАГАЗИН - если данные уже загружены, отображаем
        if (screenId === 'shopScreen') {
            setTimeout(() => {
                if (typeof Shop !== 'undefined') {
                    if (typeof Shop.renderShop === 'function') {
                        Shop.renderShop();
                    }
                }
                if (typeof window.loadShopImages === 'function') {
                    window.loadShopImages();
                }
            }, 100);
        }
        
        // ✅ ДРУЗЬЯ - если данные уже загружены, отображаем
        if (screenId === 'friendsScreen') {
            setTimeout(() => {
                if (typeof Friends !== 'undefined') {
                    // Если друзья еще не загружены - загружаем
                    if (!Friends.friendsListLoaded && Friends.friendsList.length === 0) {
                        Friends.loadFriendsList();
                    } else {
                        // Если уже загружены - просто отрисовываем
                        Friends.renderFriendsPage();
                    }
                }
            }, 50);
        }
        
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
            } else if (screenId === 'friendsScreen') {
                document.getElementById('navFriends')?.classList.add('active');
            }
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

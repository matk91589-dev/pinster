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
        } else {
            console.warn('⚠️ mainScreen не найден, повторная попытка через 50ms');
            setTimeout(showMainScreen, 50);
        }
    }

    // ✅ Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM загружен, запускаем Pingster...');
            showMainScreen();
            initModules();
            initUser();
        });
    } else {
        console.log('🚀 DOM уже загружен, запускаем Pingster...');
        showMainScreen();
        initModules();
        initUser();
    }
    
    function initModules() {
        // Инициализация модулей (неблокирующая)
        setTimeout(() => {
            try {
                if (typeof Shop !== 'undefined') Shop.init();
                if (typeof Friends !== 'undefined') Friends.init();
                if (typeof Search !== 'undefined') Search.init();
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
        
        // ✅ ПРОФИЛЬ грузится ТОЛЬКО при открытии и с проверкой telegramId
        if (screenId === 'profileScreen') {
            setTimeout(() => {
                if (typeof Profile !== 'undefined') {
                    // Убеждаемся, что telegramId установлен
                    if (!Profile.telegramId) {
                        Profile.telegramId = Profile.getTelegramId();
                    }
                    // Загружаем профиль (только когда открыт экран)
                    Profile.loadProfileFromServer();
                    Profile.loadAvatar();
                }
            }, 50);
        }
        
        // ✅ Загружаем картинки магазина только при открытии
        if (screenId === 'shopScreen') {
            setTimeout(() => {
                if (typeof window.loadShopImages === 'function') {
                    window.loadShopImages();
                }
            }, 100);
        }
        
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            if (screenId === 'mainScreen') {
                document.getElementById('navMain')?.classList.add('active');
            } else if (screenId === 'shopScreen') {
                document.getElementById('navShop')?.classList.add('active');
                if (typeof Shop !== 'undefined' && Shop.renderShop) Shop.renderShop();
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
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

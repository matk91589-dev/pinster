// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

(function() {
    // Telegram Mini App init (обязательно в самом начале)
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

    // Функция принудительного показа кнопок (мгновенно)
    function forceShowButtons() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        if (modeBtns.length === 0) return;
        
        console.log('🔘 Принудительный показ кнопок...');
        
        modeBtns.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
            btn.style.visibility = 'visible';
            btn.style.display = 'flex';
            btn.style.animation = 'none';
        });
        
        const modeContainer = document.querySelector('.mode-container');
        if (modeContainer) {
            modeContainer.style.display = 'flex';
            modeContainer.style.visibility = 'visible';
            modeContainer.style.opacity = '1';
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.display = 'flex';
        }
    }

    // Глобальная функция для принудительного показа
    window.forceShowMainScreen = forceShowButtons;

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Запуск Pingster...');
        
        // ✅ СРАЗУ показываем главный экран
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
            mainScreen.style.display = 'flex';
        }
        
        // ✅ МГНОВЕННО показываем кнопки
        forceShowButtons();
        
        // Инициализация модулей (не блокирует UI)
        try {
            if (typeof Shop !== 'undefined') Shop.init();
            if (typeof Friends !== 'undefined') Friends.init();
            if (typeof Search !== 'undefined') Search.init();
        } catch (e) {
            console.error('Ошибка инициализации модулей:', e);
        }
        
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.remove('active');
        }
        
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        console.log('Telegram ID:', telegram_id);
        
        if (telegram_id) {
            // ✅ Асинхронно инициализируем пользователя (не блокирует UI)
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
                
                // ✅ Профиль грузим через 100ms (не блокирует UI)
                setTimeout(() => {
                    if (typeof Profile !== 'undefined' && Profile.loadProfileFromServer) {
                        Profile.loadProfileFromServer();
                    }
                }, 100);
            })
            .catch(error => {
                console.error('Error initializing user:', error);
            });
            
            // ✅ Проверка мэтча через 2 секунды
            setTimeout(() => {
                if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                    Search.checkMatchStatus();
                }
            }, 2000);
        } else {
            console.warn('Нет Telegram ID');
        }
        
        console.log('Pingster готов к работе!');
    });
})();

if (!window.App) {
    window.App = {};
}

Object.assign(window.App, {
    showScreen: function(screenId, updateNav = true) {
        console.log('App.showScreen:', screenId);
        
        const content = document.querySelector('.content');
        
        if (content) {
            content.classList.remove('settings-mode');
            content.classList.remove('shop-mode');
        }
        
        if (screenId === 'settingsScreen' && content) {
            content.classList.add('settings-mode');
            console.log('✅ Добавлен класс settings-mode');
        }
        
        if (screenId === 'shopScreen' && content) {
            content.classList.add('shop-mode');
            console.log('✅ Добавлен класс shop-mode');
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
        
        // ✅ При открытии главного экрана — показываем кнопки
        if (screenId === 'mainScreen') {
            setTimeout(() => {
                const modeBtns = document.querySelectorAll('.mode-btn');
                modeBtns.forEach(btn => {
                    btn.style.display = 'flex';
                    btn.style.visibility = 'visible';
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                    btn.style.animation = 'none';
                });
                const modeContainer = document.querySelector('.mode-container');
                if (modeContainer) {
                    modeContainer.style.display = 'flex';
                }
            }, 10);
        }
        
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (screenId === 'mainScreen') {
                document.getElementById('navMain')?.classList.add('active');
            } else if (screenId === 'shopScreen') {
                document.getElementById('navShop')?.classList.add('active');
                
                if (typeof Shop !== 'undefined' && Shop.renderShop) {
                    Shop.renderShop();
                }
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

// ✅ ГАРАНТИРОВАННЫЙ ЗАПУСК (на случай если DOMContentLoaded уже сработал)
if (document.readyState === 'loading') {
    // Ждем загрузки
} else {
    // DOM уже загружен, показываем главный экран
    setTimeout(() => {
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen && !mainScreen.classList.contains('active')) {
            console.log('🔥 Форсированный запуск главного экрана');
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
            if (window.forceShowMainScreen) window.forceShowMainScreen();
        }
    }, 10);
}

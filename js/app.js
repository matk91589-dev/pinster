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

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Запуск Pingster...');
        
        // ✅ СРАЗУ показываем главный экран (до любых запросов)
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
        }
        
        // ✅ Принудительно показываем кнопки
        const modeContainer = document.querySelector('.mode-container');
        if (modeContainer) {
            modeContainer.style.display = 'flex';
        }
        
        // Инициализация модулей (они не блокируют UI)
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
                
                // ✅ Профиль грузим в фоне (через 1 секунду, не блокируем)
                setTimeout(() => {
                    if (typeof Profile !== 'undefined' && Profile.loadProfileFromServer) {
                        console.log('📥 Фоновая загрузка профиля...');
                        Profile.loadProfileFromServer();
                    }
                }, 1000);
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
        
        // Получаем элемент content
        const content = document.querySelector('.content');
        
        // ВСЕГДА убираем классы при смене экрана
        if (content) {
            content.classList.remove('settings-mode');
            content.classList.remove('shop-mode');
        }
        
        // Если открываем настройки - добавляем класс настроек
        if (screenId === 'settingsScreen' && content) {
            content.classList.add('settings-mode');
            console.log('✅ Добавлен класс settings-mode');
        }
        
        // Если открываем магазин - добавляем класс магазина
        if (screenId === 'shopScreen' && content) {
            content.classList.add('shop-mode');
            console.log('✅ Добавлен класс shop-mode');
        }
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
        
        // ✅ ФИКС: принудительно показываем кнопки на главном экране
        if (screenId === 'mainScreen') {
            const modeContainer = document.querySelector('.mode-container');
            if (modeContainer) {
                modeContainer.style.display = 'flex';
            }
            
            const modeBtns = document.querySelectorAll('.mode-btn');
            if (modeBtns.length > 0) {
                modeBtns.forEach(btn => {
                    btn.style.display = 'flex';
                });
            }
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
                
                if (typeof Shop !== 'undefined' && Shop.renderShop) {
                    Shop.renderShop();
                }
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
            }
        }
        
        // ✅ При возврате на главный экран — проверяем кнопки
        if (screenId === 'mainScreen') {
            setTimeout(() => {
                const modeContainer = document.querySelector('.mode-container');
                if (modeContainer) {
                    modeContainer.style.display = 'flex';
                }
            }, 50);
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

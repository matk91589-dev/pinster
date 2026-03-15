// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

(function() {
    // Telegram Mini App init (обязательно в самом начале)
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();                    // растягиваем на весь экран
        if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes(); // убираем свайп закрытия
        }
        
        // Адаптация под тему Telegram
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        
        // Слушаем изменения темы
        tg.onEvent('themeChanged', () => {
            document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        });
    }

    // Запуск после полной загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Запуск Pingster...');
        
        // Инициализация модулей (с защитой от ошибок)
        try {
            if (typeof Shop !== 'undefined') Shop.init();
            if (typeof Friends !== 'undefined') Friends.init();
            if (typeof Search !== 'undefined') Search.init();
        } catch (e) {
            console.error('Ошибка инициализации модулей:', e);
        }
        
        // Сбрасываем иконку настроек
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.remove('active');
        }
        
        // ПОЛУЧАЕМ TELEGRAM ID И СРАЗУ ПОКАЗЫВАЕМ ГЛАВНЫЙ ЭКРАН
        const telegram_id = tg?.initDataUnsafe?.user?.id;
        console.log('Telegram ID:', telegram_id);
        
        if (telegram_id) {
            // Инициализируем пользователя на сервере
            fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/user/init', {
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
                
                // Сохраняем данные
                if (data.player_id) {
                    localStorage.setItem('player_id', data.player_id);
                    localStorage.setItem('nick', data.nick);
                    localStorage.setItem('pingcoins', data.pingcoins);
                }
                
                // СРАЗУ ПОКАЗЫВАЕМ ГЛАВНЫЙ ЭКРАН
                if (window.App && App.showScreen) {
                    App.showScreen('mainScreen', true);
                } else {
                    // Если App еще не загружен, показываем через запасной метод
                    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                    document.getElementById('mainScreen')?.classList.add('active');
                }
                
                // Проверяем мэтч при старте
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                        Search.checkMatchStatus();
                    }
                }, 1000);
            })
            .catch(error => {
                console.error('Error initializing user:', error);
                // Даже при ошибке показываем главный экран
                if (window.App && App.showScreen) {
                    App.showScreen('mainScreen', true);
                } else {
                    document.getElementById('mainScreen')?.classList.add('active');
                }
            });
        } else {
            console.warn('Нет Telegram ID, показываем главный экран');
            if (window.App && App.showScreen) {
                App.showScreen('mainScreen', true);
            } else {
                document.getElementById('mainScreen')?.classList.add('active');
            }
        }
        
        console.log('Pingster готов к работе!');
    });
})();

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (ДОПОЛНЕНИЕ К App ИЗ navigation.js)
// ============================================

// Проверяем, что App уже существует (из navigation.js)
if (!window.App) {
    window.App = {};
}

// Добавляем методы, которых нет в navigation.js
Object.assign(window.App, {
    // Показать экран (если вдруг не существует в navigation.js)
    showScreen: function(screenId, updateNav = true) {
        console.log('App.showScreen:', screenId);
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
        
        // Обновляем навигацию
        if (updateNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Активируем соответствующий пункт навигации
            if (screenId === 'mainScreen') {
                document.getElementById('navMain')?.classList.add('active');
                
                // ВАЖНО: при возврате на главный экран проверяем мэтч
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                        console.log('Проверяем мэтч после возврата на главный экран');
                        Search.checkMatchStatus();
                    }
                }, 500);
            } else if (screenId === 'shopScreen') {
                document.getElementById('navShop')?.classList.add('active');
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
                
                // Загружаем профиль при показе
                if (typeof Profile !== 'undefined' && Profile.load) {
                    Profile.load();
                }
            }
        }
        
        // Специальные действия для определенных экранов
        if (screenId === 'profileScreen') {
            // Дополнительная проверка мэтча при открытии профиля
            setTimeout(() => {
                if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                    Search.checkMatchStatus();
                }
            }, 1000);
        }
    },
    
    // Показать уведомление
    showAlert: function(message) {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }
    
    // МЕТОД startApp ПОЛНОСТЬЮ УДАЛЕН — БОЛЬШЕ НЕ НУЖЕН
});

// Делаем App глобальным (если вдруг перезаписалось)
window.App = window.App;

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
                    localStorage.setItem('nick', data.nick);
                    localStorage.setItem('pingcoins', data.pingcoins);
                    
                    // ✅ СРАЗУ показываем главный экран
                    if (window.App && App.showScreen) {
                        App.showScreen('mainScreen', true);
                    } else {
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        document.getElementById('mainScreen')?.classList.add('active');
                    }
                    
                    // ✅ Профиль грузим в фоне (не блокируем интерфейс)
                    setTimeout(() => {
                        if (typeof Profile !== 'undefined' && Profile.loadProfileFromServer) {
                            console.log('📥 Фоновая загрузка профиля...');
                            Profile.loadProfileFromServer();
                        }
                    }, 100);
                } else {
                    // Если нет player_id — все равно показываем главный
                    if (window.App && App.showScreen) {
                        App.showScreen('mainScreen', true);
                    } else {
                        document.getElementById('mainScreen')?.classList.add('active');
                    }
                }
                
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                        Search.checkMatchStatus();
                    }
                }, 1000);
            })
            .catch(error => {
                console.error('Error initializing user:', error);
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
            
            // Перестраиваем режимы (на случай если были скрыты)
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
                
                setTimeout(() => {
                    if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                        console.log('Проверяем мэтч после возврата на главный экран');
                        Search.checkMatchStatus();
                    }
                }, 500);
            } else if (screenId === 'shopScreen') {
                document.getElementById('navShop')?.classList.add('active');
                
                // Перерендериваем магазин при открытии
                if (typeof Shop !== 'undefined' && Shop.renderShop) {
                    Shop.renderShop();
                }
            } else if (screenId === 'profileScreen') {
                document.getElementById('navProfile')?.classList.add('active');
                
                // Загружаем профиль при открытии, если еще не загружен
                if (typeof Profile !== 'undefined' && Profile.loadProfileFromServer) {
                    const profileName = document.getElementById('profileName');
                    if (profileName && profileName.textContent === '-') {
                        console.log('📥 Загружаем профиль при открытии экрана');
                        Profile.loadProfileFromServer();
                    }
                }
            }
        }
        
        // Дополнительные действия для профиля
        if (screenId === 'profileScreen') {
            setTimeout(() => {
                if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                    Search.checkMatchStatus();
                }
            }, 1000);
        }
        
        // ✅ ФИКС: при возврате на главный экран из другого
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

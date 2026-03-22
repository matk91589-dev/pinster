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

    // Функция запуска анимации кнопок
    function startButtonsAnimation() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        if (modeBtns.length === 0) return;
        
        console.log('🎬 Запуск анимации кнопок...');
        
        // Сбрасываем стили для анимации
        modeBtns.forEach(btn => {
            btn.style.opacity = '';
            btn.style.transform = '';
            btn.style.animation = 'none';
        });
        
        // Форсируем перерисовку
        void modeBtns[0].offsetHeight;
        
        // Запускаем анимацию с задержками
        modeBtns.forEach((btn, index) => {
            const delays = [0.08, 0.16, 0.24, 0.32];
            btn.style.animation = `modeFade 0.45s ease forwards ${delays[index] || 0.08}s`;
        });
    }

    // Функция принудительного показа кнопок (без анимации, если что-то пошло не так)
    function forceShowButtons() {
        console.log('🔘 Принудительный показ кнопок (без анимации)...');
        
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
            btn.style.visibility = 'visible';
            btn.style.display = 'flex';
        });
        
        const modeContainer = document.querySelector('.mode-container');
        if (modeContainer) {
            modeContainer.style.display = 'flex';
            modeContainer.style.visibility = 'visible';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Запуск Pingster...');
        
        // ✅ СРАЗУ показываем главный экран
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            mainScreen.classList.add('active');
        }
        
        // ✅ Запускаем анимацию кнопок
        startButtonsAnimation();
        
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
            // ✅ Асинхронно инициализируем пользователя
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
                
                // ✅ Профиль грузим через 100ms
                setTimeout(() => {
                    console.log('📥 Попытка загрузить профиль...');
                    if (typeof Profile !== 'undefined' && Profile.loadProfileFromServer) {
                        console.log('📥 Фоновая загрузка профиля...');
                        Profile.loadProfileFromServer();
                    } else {
                        console.warn('⚠️ Profile.loadProfileFromServer не найден');
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
        
        // ✅ Запасной вариант: если анимация не сработала, показываем кнопки через 500ms
        setTimeout(() => {
            const modeBtns = document.querySelectorAll('.mode-btn');
            let allVisible = true;
            modeBtns.forEach(btn => {
                const style = getComputedStyle(btn);
                if (style.opacity === '0' || style.display === 'none') {
                    allVisible = false;
                }
            });
            
            if (!allVisible || modeBtns.length === 0) {
                console.log('⚠️ Анимация не сработала, показываем кнопки принудительно');
                forceShowButtons();
            }
        }, 500);
        
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
        
        // ✅ При открытии главного экрана — запускаем анимацию кнопок
        if (screenId === 'mainScreen') {
            setTimeout(() => {
                const modeBtns = document.querySelectorAll('.mode-btn');
                if (modeBtns.length > 0) {
                    // Проверяем, видны ли кнопки
                    let needAnimation = false;
                    modeBtns.forEach(btn => {
                        const style = getComputedStyle(btn);
                        if (style.opacity === '0') {
                            needAnimation = true;
                        }
                    });
                    
                    if (needAnimation) {
                        // Запускаем анимацию
                        modeBtns.forEach((btn, index) => {
                            const delays = [0.08, 0.16, 0.24, 0.32];
                            btn.style.animation = `modeFade 0.45s ease forwards ${delays[index] || 0.08}s`;
                        });
                    } else {
                        // Если кнопки уже видны, просто убеждаемся что они есть
                        modeBtns.forEach(btn => {
                            btn.style.display = 'flex';
                            btn.style.visibility = 'visible';
                        });
                    }
                }
            }, 50);
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

// ============================================
// НАВИГАЦИЯ (Telegram Mini App версия) - ФИНАЛ
// ============================================

const App = {
    currentScreen: null,
    tg: window.Telegram?.WebApp,
    
    init() {
        // Инициализация Telegram
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            // Отключаем вертикальные свайпы
            if (this.tg.disableVerticalSwipes) {
                this.tg.disableVerticalSwipes();
            }
            
            // Устанавливаем тему
            document.body.style.backgroundColor = 
                this.tg.themeParams.bg_color || "#0D0F15";
            
            // Слушаем изменения темы
            this.tg.onEvent('themeChanged', () => {
                document.body.style.backgroundColor =
                    this.tg.themeParams.bg_color || "#0D0F15";
            });
        }
        
        // Настраиваем BackButton
        this.setupBackButton();
        
        // Устанавливаем обработчики для кнопок режимов
        this.setupModeButtons();
        
        // Устанавливаем обработчик для логотипа
        this.setupLogoHandler();
        
        // Проверяем существование startScreen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            this.showScreen('startScreen', false);
        } else {
            console.log('startScreen не найден, показываем mainScreen');
            this.showScreen('mainScreen', true);
        }
    },
    
    setupBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.onClick(() => {
            this.handleBack();
        });
    },
    
    setupModeButtons() {
        // Показываем экраны с формами
        document.querySelector('.mode-btn.faceit')?.addEventListener('click', () => {
            localStorage.setItem('currentMode', 'FACEIT');
            this.showScreen('faceitScreen', false);
        });
        
        document.querySelector('.mode-btn.premier')?.addEventListener('click', () => {
            localStorage.setItem('currentMode', 'PREMIER');
            this.showScreen('premierScreen', false);
        });
        
        document.querySelector('.mode-btn.prime')?.addEventListener('click', () => {
            localStorage.setItem('currentMode', 'MM PRIME');
            this.showScreen('primeScreen', false);
        });
        
        document.querySelector('.mode-btn.public')?.addEventListener('click', () => {
            localStorage.setItem('currentMode', 'MM PUBLIC');
            this.showScreen('publicScreen', false);
        });
    },
    
    setupLogoHandler() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.handleLogoClick();
            });
        }
    },
    
    handleLogoClick() {
        console.log('Клик по логотипу, текущий экран:', this.currentScreen);
        
        // Если мы на экране поиска - спрашиваем подтверждение
        if (this.currentScreen === 'searchScreen') {
            this.showConfirm('Вы точно хотите отменить поиск?', (confirmed) => {
                if (confirmed) {
                    console.log('Пользователь подтвердил отмену поиска');
                    if (typeof Search !== 'undefined' && Search.cancel) {
                        Search.cancel();
                    } else {
                        // Прямой запрос на остановку
                        const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
                        if (telegram_id) {
                            fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/stop', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ telegram_id: telegram_id })
                            })
                            .then(() => this.showScreen('mainScreen', true))
                            .catch(e => console.error('Ошибка остановки поиска:', e));
                        }
                    }
                }
            });
        } 
        // Если мы на экране свайпа - тоже можем спросить
        else if (this.currentScreen === 'swipeScreen') {
            this.showConfirm('Вы точно хотите выйти из поиска?', (confirmed) => {
                if (confirmed) {
                    console.log('Пользователь подтвердил выход со свайпа');
                    if (typeof Swipe !== 'undefined' && Swipe.destroy) {
                        Swipe.destroy();
                    }
                    this.showScreen('mainScreen', true);
                }
            });
        }
        // В остальных случаях просто переходим на главную
        else if (this.currentScreen !== 'mainScreen') {
            this.showScreen('mainScreen', true);
        }
    },
    
    handleBack() {
        // Логика возврата
        if (this.currentScreen === 'profileScreen' || 
            this.currentScreen === 'shopScreen' || 
            this.currentScreen === 'settingsScreen') {
            this.showScreen('mainScreen', true);
        } else if (this.currentScreen !== 'startScreen' && 
                   this.currentScreen !== 'mainScreen') {
            this.showScreen('mainScreen', true);
        }
    },
    
    updateBackButton() {
        if (!this.tg) return;
        
        const screensWithBack = [
            'profileScreen', 'shopScreen', 'settingsScreen',
            'faceitScreen', 'premierScreen', 'primeScreen', 
            'publicScreen', 'searchScreen', 'swipeScreen'
        ];
        
        if (screensWithBack.includes(this.currentScreen)) {
            this.tg.BackButton.show();
        } else {
            this.tg.BackButton.hide();
        }
    },
    
    updateNavHighlight(screenId) {
        // Убираем active у всех кнопок
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Определяем, какая кнопка должна быть активной
        let activeNavId = null;
        
        if (screenId === 'mainScreen') {
            activeNavId = 'navMain';
        } else if (screenId === 'shopScreen') {
            activeNavId = 'navShop';
        } else if (screenId === 'profileScreen') {
            activeNavId = 'navProfile';
        } else if (screenId === 'settingsScreen') {
            activeNavId = 'navMain';
        } else {
            activeNavId = 'navMain';
        }
        
        // Добавляем active нужной кнопке
        if (activeNavId) {
            const navItem = document.getElementById(activeNavId);
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    },
    
    hapticFeedback(style = 'light') {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(style);
        }
    },
    
    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    },
    
    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, (confirmed) => {
                callback(confirmed);
            });
        } else {
            callback(confirm(message));
        }
    },
    
    showPopup(params, callback) {
        if (this.tg) {
            this.tg.showPopup(params, callback);
        } else {
            if (params.buttons && params.buttons.length > 0) {
                const result = confirm(params.message || 'Подтвердите действие');
                if (callback) {
                    callback(result ? 'ok' : 'cancel');
                }
            }
        }
    },
    
    showScreen(screenId, showNav = true) {
        console.log('Переход с экрана:', this.currentScreen, 'на экран:', screenId);
        
        // ВАЖНО: Если уходим с экрана поиска НЕ на свайп - останавливаем поиск
        if (this.currentScreen === 'searchScreen' && screenId !== 'searchScreen' && screenId !== 'swipeScreen') {
            console.log('⚠️ Уходим с экрана поиска (не на свайп), принудительно останавливаем поиск');
            if (typeof Search !== 'undefined' && Search.cancel) {
                Search.cancel();
            } else {
                // Если Search не определен, отправляем прямой запрос на остановку
                const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
                if (telegram_id) {
                    fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/search/stop', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegram_id: telegram_id })
                    }).catch(e => console.error('Ошибка остановки поиска:', e));
                }
            }
        }
        
        // Если уходим с экрана свайпа - чистим данные
        if (this.currentScreen === 'swipeScreen' && screenId !== 'swipeScreen') {
            console.log('⚠️ Уходим с экрана свайпа, чистим данные');
            if (typeof Swipe !== 'undefined' && Swipe.destroy) {
                Swipe.destroy();
            }
        }
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
            
            // Загружаем данные если нужно
            if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
                Profile.loadSavedValues();
            } else if (screenId === 'shopScreen' && typeof Shop !== 'undefined') {
                Shop.renderShop();
            }
            
            // ========== ВАЖНО: Инициализация Swipe при переходе на экран свайпа ==========
            if (screenId === 'swipeScreen') {
                console.log('🚀 Экран свайпа показан, инициализация будет в Search');
                // УБИРАЕМ ВЫЗОВ Swipe.startWithOpponent() ОТСЮДА!
                // Теперь инициализация только в Search.showSwipeScreen()
            }
            // =========================================================================
            
            // Хаптик
            this.hapticFeedback('light');
            
            // Обновляем подсветку навигации
            this.updateNavHighlight(screenId);
        }
        
        // Обновляем BackButton
        this.updateBackButton();
        
        // Обновляем иконку настроек
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.toggle('active', screenId === 'settingsScreen');
        }
    },
    
    startApp() {
        console.log('startApp вызвана');
        this.showScreen('mainScreen', true);
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Для обратной совместимости
window.App = App;

// ============================================
// НАВИГАЦИЯ (Telegram Mini App версия) - ИСПРАВЛЕНО
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
        
        // Показываем стартовый экран
        this.showScreen('startScreen', false);
    },
    
    setupBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.onClick(() => {
            this.handleBack();
        });
    },
    
    setupModeButtons() {
        // ИСПРАВЛЕНО: теперь показываем экраны с формами, а не сразу свайп
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
            // ИСПРАВЛЕНО: свайп инициализируется ТОЛЬКО из Search, не автоматически
            // Убираем автоматическую инициализацию свайпа
            
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

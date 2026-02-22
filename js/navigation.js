// ============================================
// НАВИГАЦИЯ (Telegram Mini App версия)
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
        
        // Показываем стартовый экран
        this.showScreen('startScreen', false);
    },
    
    setupBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.onClick(() => {
            this.handleBack();
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
            'publicScreen', 'searchScreen'
        ];
        
        if (screensWithBack.includes(this.currentScreen)) {
            this.tg.BackButton.show();
        } else {
            this.tg.BackButton.hide();
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
            alert(message); // fallback
        }
    },
    
    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, (confirmed) => {
                callback(confirmed);
            });
        } else {
            callback(confirm(message)); // fallback
        }
    },
    
    showPopup(params) {
        if (this.tg) {
            this.tg.showPopup(params);
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
            
            // Хаптик
            this.hapticFeedback('light');
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

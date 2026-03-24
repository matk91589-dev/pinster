// ============================================
// НАВИГАЦИЯ (Telegram Mini App версия) - РАБОЧАЯ
// ============================================

const App = {
    currentScreen: null,
    tg: window.Telegram?.WebApp,
    backButtonPressed: false,
    
    init() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            if (this.tg.disableVerticalSwipes) {
                this.tg.disableVerticalSwipes();
            }
            
            document.body.style.backgroundColor = 
                this.tg.themeParams.bg_color || "#0D0F15";
            
            this.tg.onEvent('themeChanged', () => {
                document.body.style.backgroundColor =
                    this.tg.themeParams.bg_color || "#0D0F15";
            });
        }
        
        this.setupBackButton();
        this.setupModeButtons();
        this.setupLogoHandler();
        
        this.showScreen('mainScreen', true);
    },
    
    setupBackButton() {
        if (!this.tg) return;
        
        this.tg.BackButton.onClick(() => {
            if (this.backButtonPressed) return;
            this.backButtonPressed = true;
            
            setTimeout(() => {
                this.backButtonPressed = false;
            }, 1000);
            
            this.handleBack();
        });
    },
    
    setupModeButtons() {
        const faceitBtn = document.querySelector('.mode-btn.faceit');
        const premierBtn = document.querySelector('.mode-btn.premier');
        const primeBtn = document.querySelector('.mode-btn.prime');
        const publicBtn = document.querySelector('.mode-btn.public');
        
        if (faceitBtn) faceitBtn.onclick = () => this.showScreen('faceitScreen', false);
        if (premierBtn) premierBtn.onclick = () => this.showScreen('premierScreen', false);
        if (primeBtn) primeBtn.onclick = () => this.showScreen('primeScreen', false);
        if (publicBtn) publicBtn.onclick = () => this.showScreen('publicScreen', false);
    },
    
    setupLogoHandler() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.onclick = () => {
                if (this.currentScreen !== 'mainScreen') {
                    this.showScreen('mainScreen', true);
                }
            };
        }
    },
    
    handleBack() {
        const screens = ['profileScreen', 'shopScreen', 'settingsScreen', 'faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen'];
        
        if (screens.includes(this.currentScreen)) {
            this.showScreen('mainScreen', true);
        } else if (this.currentScreen !== 'mainScreen') {
            this.showScreen('mainScreen', true);
        }
    },
    
    updateBackButton() {
        if (!this.tg) return;
        
        const screensWithBack = ['profileScreen', 'shopScreen', 'settingsScreen', 'faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen'];
        
        if (screensWithBack.includes(this.currentScreen)) {
            this.tg.BackButton.show();
        } else {
            this.tg.BackButton.hide();
        }
    },
    
    updateNavHighlight(screenId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        let activeId = 'navMain';
        if (screenId === 'shopScreen') activeId = 'navShop';
        if (screenId === 'profileScreen') activeId = 'navProfile';
        
        const activeItem = document.getElementById(activeId);
        if (activeItem) activeItem.classList.add('active');
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
            this.tg.showConfirm(message, callback);
        } else {
            callback(confirm(message));
        }
    },
    
    showScreen(screenId, updateNav = true) {
        console.log('Переход на экран:', screenId);
        
        const screen = document.getElementById(screenId);
        if (!screen) {
            console.error('Экран не найден:', screenId);
            return;
        }
        
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        screen.classList.add('active');
        this.currentScreen = screenId;
        
        // Инициализация при открытии
        if (screenId === 'profileScreen' && window.Profile) {
            if (Profile.isProfileLoaded) {
                Profile.updateDisplay();
            } else if (Profile.loadProfileFromServer) {
                Profile.loadProfileFromServer();
                Profile.loadAvatar();
            }
        }
        
        if (screenId === 'shopScreen' && window.Shop && Shop.renderShop) {
            Shop.renderShop();
        }
        
        if (screenId === 'settingsScreen' && window.Settings && Settings.init) {
            Settings.init();
        }
        
        if (updateNav) {
            this.updateNavHighlight(screenId);
        }
        
        this.updateBackButton();
        
        // Вибрация только если есть поддержка
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;

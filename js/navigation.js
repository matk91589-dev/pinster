// ============================================
// НАВИГАЦИЯ (Telegram Mini App версия) - ИСПРАВЛЕНО
// ============================================

const App = {
    currentScreen: null,
    tg: window.Telegram?.WebApp,
    backButtonPressed: false,
    
    init() {
        // Инициализация Telegram
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
            console.log('🔙 Нажата кнопка назад на экране:', this.currentScreen);
            
            if (this.backButtonPressed) {
                console.log('⏳ Уже обрабатываем нажатие, игнорируем');
                return;
            }
            this.backButtonPressed = true;
            
            setTimeout(() => {
                this.backButtonPressed = false;
            }, 1000);
            
            this.handleBack();
        });
    },
    
    setupModeButtons() {
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
        
        if (this.currentScreen === 'searchScreen') {
            this.showConfirm('Вы точно хотите отменить поиск?', (confirmed) => {
                if (confirmed) {
                    console.log('Пользователь подтвердил отмену поиска');
                    if (typeof Search !== 'undefined' && Search.cancel) {
                        Search.cancel();
                    } else {
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
        else if (this.currentScreen !== 'mainScreen') {
            this.showScreen('mainScreen', true);
        }
    },
    
    handleBack() {
        console.log('🔙 Обработка кнопки назад на экране:', this.currentScreen);
        
        if (this.currentScreen === 'swipeScreen') {
            console.log('⚠️ На экране свайпа, спрашиваем подтверждение');
            this.showConfirm('Вы точно хотите выйти из поиска?', (confirmed) => {
                if (confirmed) {
                    console.log('✅ Пользователь подтвердил выход');
                    if (typeof Swipe !== 'undefined' && Swipe.destroy) {
                        Swipe.destroy();
                    }
                    this.showScreen('mainScreen', true);
                } else {
                    console.log('❌ Пользователь отменил выход');
                }
            });
            return;
        }
        
        if (this.currentScreen === 'searchScreen') {
            console.log('⚠️ На экране поиска, спрашиваем подтверждение');
            this.showConfirm('Вы точно хотите отменить поиск?', (confirmed) => {
                if (confirmed) {
                    console.log('✅ Пользователь подтвердил отмену поиска');
                    if (typeof Search !== 'undefined' && Search.cancel) {
                        Search.cancel();
                    } else {
                        this.showScreen('mainScreen', true);
                    }
                }
            });
            return;
        }
        
        if (this.currentScreen === 'profileScreen' || 
            this.currentScreen === 'shopScreen' || 
            this.currentScreen === 'settingsScreen' ||
            this.currentScreen === 'faceitScreen' ||
            this.currentScreen === 'premierScreen' ||
            this.currentScreen === 'primeScreen' ||
            this.currentScreen === 'publicScreen') {
            console.log('🔙 Возврат на главный экран');
            this.showScreen('mainScreen', true);
        } else if (this.currentScreen !== 'startScreen' && 
                   this.currentScreen !== 'mainScreen') {
            console.log('🔙 Возврат на главный экран (по умолчанию)');
            this.showScreen('mainScreen', true);
        }
    },
    
    updateBackButton() {
        if (!this.tg) return;
        
        if (this.currentScreen === 'swipeScreen') {
            console.log('🚫 Прячем кнопку назад на экране свайпа');
            this.tg.BackButton.hide();
            return;
        }
        
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
    
    updateNavHighlight(screenId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
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
        
        if (this.currentScreen === 'searchScreen' && screenId !== 'searchScreen' && screenId !== 'swipeScreen') {
            console.log('⚠️ Уходим с экрана поиска (не на свайп), принудительно останавливаем поиск');
            if (typeof Search !== 'undefined' && Search.cancel) {
                Search.cancel();
            } else {
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
        
        if (this.currentScreen === 'swipeScreen' && screenId !== 'swipeScreen') {
            console.log('⚠️ Уходим с экрана свайпа, чистим данные');
            if (typeof Swipe !== 'undefined' && Swipe.destroy) {
                Swipe.destroy();
            }
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
            
            if (screenId === 'profileScreen' && typeof Profile !== 'undefined') {
                Profile.loadSavedValues();
            } else if (screenId === 'shopScreen' && typeof Shop !== 'undefined') {
                Shop.renderShop();
            }
            
            if (screenId === 'swipeScreen') {
                console.log('🚀 Экран свайпа показан, инициализация будет в Search');
            }
            
            this.hapticFeedback('light');
            this.updateNavHighlight(screenId);
        }
        
        this.updateBackButton();
        
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.toggle('active', screenId === 'settingsScreen');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;

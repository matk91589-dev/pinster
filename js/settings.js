// ============================================
// НАСТРОЙКИ PINGSTER - С ЗВУКАМИ (ИСПРАВЛЕНО)
// ============================================

const Settings = {
    state: {
        sound: true,
        theme: 'dark'
    },
    
    init() {
        this.loadSettings();
        this.setupSoundToggle();
        this.setupThemeToggle();
        console.log('Настройки загружены');
    },
    
    loadSettings() {
        this.state.sound = localStorage.getItem('settings_sound') !== 'false';
        this.state.theme = localStorage.getItem('settings_theme') || 'dark';
        this.applyTheme();
        this.updateToggles();
        console.log('Загружены настройки:', this.state);
    },
    
    // Обновляем состояние всех переключателей
    updateToggles() {
        // Звук - первый переключатель
        const soundToggle = document.querySelector('.settings-section:first-child .settings-row:first-child .toggle-switch');
        if (soundToggle) {
            if (this.state.sound) {
                soundToggle.classList.add('active');
            } else {
                soundToggle.classList.remove('active');
            }
        }
        
        // Тема - второй переключатель
        const themeToggle = document.querySelector('.settings-section:first-child .settings-row:nth-child(2) .toggle-switch');
        if (themeToggle) {
            if (this.state.theme === 'light') {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
        }
    },
    
    setupSoundToggle() {
        // Находим переключатель звука (первый в секции ОФОРМЛЕНИЕ)
        const soundToggle = document.querySelector('.settings-section:first-child .settings-row:first-child .toggle-switch');
        if (!soundToggle) {
            console.log('❌ Переключатель звука не найден');
            return;
        }
        
        console.log('✅ Переключатель звука найден');
        
        soundToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            soundToggle.classList.toggle('active');
            this.state.sound = soundToggle.classList.contains('active');
            localStorage.setItem('settings_sound', this.state.sound);
            
            console.log('Звук:', this.state.sound ? 'вкл 🔊' : 'выкл 🔇');
            
            // Пробный звук при включении (с небольшой задержкой)
            if (this.state.sound) {
                setTimeout(() => this.playSound('light'), 50);
            }
        });
    },
    
    setupThemeToggle() {
        // Находим переключатель темы (второй в секции ОФОРМЛЕНИЕ)
        const themeToggle = document.querySelector('.settings-section:first-child .settings-row:nth-child(2) .toggle-switch');
        if (!themeToggle) {
            console.log('❌ Переключатель темы не найден');
            return;
        }
        
        console.log('✅ Переключатель темы найден');
        
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            themeToggle.classList.toggle('active');
            
            // Тема: active = светлая, не active = тёмная
            this.state.theme = themeToggle.classList.contains('active') ? 'light' : 'dark';
            localStorage.setItem('settings_theme', this.state.theme);
            this.applyTheme();
            
            console.log('Тема:', this.state.theme === 'dark' ? '🌙 тёмная' : '☀️ светлая');
            
            // Звук при смене темы (если звук включен)
            if (this.state.sound) {
                setTimeout(() => this.playSound('medium'), 50);
            }
        });
    },
    
    applyTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            console.log('🌙 Тёмная тема');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            console.log('☀️ Светлая тема');
        }
    },
    
    // ===== ЗВУКИ =====
    playSound(type = 'light') {
        // Проверяем, включен ли звук
        if (!this.state || this.state.sound !== true) {
            console.log('Звук выключен, пропускаем');
            return;
        }
        
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(type);
            console.log(`🔊 Звук: ${type}`);
        } else {
            console.log('❌ Telegram HapticFeedback не доступен');
        }
    },
    
    // Специальные звуки для разных действий
    click() {
        this.playSound('light');
    },
    
    success() {
        this.playSound('medium');
    },
    
    error() {
        this.playSound('heavy');
    },
    
    swipe() {
        this.playSound('light');
    },
    
    match() {
        this.playSound('medium');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Settings.init(), 100);
});

window.Settings = Settings;

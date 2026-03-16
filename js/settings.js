// ============================================
// НАСТРОЙКИ PINGSTER - С ЗВУКАМИ
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
    },
    
    // Обновляем состояние всех переключателей
    updateToggles() {
        // Звук
        const soundToggle = document.querySelector('.settings-row:first-child .toggle-switch');
        if (soundToggle) {
            if (this.state.sound) {
                soundToggle.classList.add('active');
            } else {
                soundToggle.classList.remove('active');
            }
        }
        
        // Тема
        const themeToggle = document.querySelector('.settings-row:nth-child(2) .toggle-switch');
        if (themeToggle) {
            if (this.state.theme === 'light') {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
        }
    },
    
    setupSoundToggle() {
        const soundToggle = document.querySelector('.settings-row:first-child .toggle-switch');
        if (!soundToggle) return;
        
        soundToggle.addEventListener('click', () => {
            soundToggle.classList.toggle('active');
            this.state.sound = soundToggle.classList.contains('active');
            localStorage.setItem('settings_sound', this.state.sound);
            
            // Пробный звук при включении/выключении
            if (this.state.sound) {
                this.playSound('light');
            }
            
            console.log('Звук:', this.state.sound ? 'вкл' : 'выкл');
        });
    },
    
    setupThemeToggle() {
        const themeToggle = document.querySelector('.settings-row:nth-child(2) .toggle-switch');
        if (!themeToggle) return;
        
        themeToggle.addEventListener('click', () => {
            themeToggle.classList.toggle('active');
            
            // Тема: active = светлая, не active = тёмная
            this.state.theme = themeToggle.classList.contains('active') ? 'light' : 'dark';
            localStorage.setItem('settings_theme', this.state.theme);
            this.applyTheme();
            
            // Звук при смене темы (если звук включен)
            if (this.state.sound) {
                this.playSound('medium');
            }
            
            console.log('Тема:', this.state.theme);
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
        if (!this.state.sound) return; // Если звук выключен - ничего не делаем
        
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(type);
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

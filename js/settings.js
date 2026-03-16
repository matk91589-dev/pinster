// ============================================
// НАСТРОЙКИ PINGSTER - С ЗВУКАМИ (УНИВЕРСАЛЬНО)
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
        // Находим ВСЕ переключатели
        const toggles = document.querySelectorAll('.settings-row .toggle-switch');
        
        if (toggles.length >= 2) {
            // Первый переключатель - звук
            if (this.state.sound) {
                toggles[0].classList.add('active');
            } else {
                toggles[0].classList.remove('active');
            }
            
            // Второй переключатель - тема
            if (this.state.theme === 'light') {
                toggles[1].classList.add('active');
            } else {
                toggles[1].classList.remove('active');
            }
        }
    },
    
    setupSoundToggle() {
        // Находим ВСЕ переключатели и берем первый
        const toggles = document.querySelectorAll('.settings-row .toggle-switch');
        
        if (toggles.length === 0) {
            console.log('❌ Переключатели не найдены');
            return;
        }
        
        const soundToggle = toggles[0]; // Первый - звук
        console.log('✅ Переключатель звука найден');
        
        soundToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            soundToggle.classList.toggle('active');
            this.state.sound = soundToggle.classList.contains('active');
            localStorage.setItem('settings_sound', this.state.sound);
            
            console.log('Звук:', this.state.sound ? 'вкл 🔊' : 'выкл 🔇');
            
            // Пробный звук при включении
            if (this.state.sound) {
                setTimeout(() => this.playSound('light'), 50);
            }
        });
    },
    
    setupThemeToggle() {
        // Находим ВСЕ переключатели и берем второй
        const toggles = document.querySelectorAll('.settings-row .toggle-switch');
        
        if (toggles.length < 2) {
            console.log('❌ Переключатель темы не найден');
            return;
        }
        
        const themeToggle = toggles[1]; // Второй - тема
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
            
            // Звук при смене темы
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
            return;
        }
        
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(type);
            console.log(`🔊 Звук: ${type}`);
        }
    },
    
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

// ============================================
// НАСТРОЙКИ PINGSTER - С РАБОЧЕЙ ВИБРАЦИЕЙ
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
        // Звук
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            if (this.state.sound) {
                soundToggle.classList.add('active');
            } else {
                soundToggle.classList.remove('active');
            }
        }
        
        // Тема
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            if (this.state.theme === 'light') {
                themeToggle.classList.add('active');
            } else {
                themeToggle.classList.remove('active');
            }
        }
    },
    
    setupSoundToggle() {
        const soundToggle = document.getElementById('soundToggle');
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
            
            // Пробный звук при включении
            if (this.state.sound) {
                setTimeout(() => this.playSound('light'), 50);
            }
        });
    },
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
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
            // НА ANDROID impactOccurred НЕ РАБОТАЕТ!
            // Используем notificationOccurred - работает везде
            
            if (type === 'light' || type === 'click' || type === 'swipe') {
                tg.HapticFeedback.notificationOccurred('success');
            } 
            else if (type === 'medium' || type === 'success' || type === 'match') {
                tg.HapticFeedback.notificationOccurred('success');
            }
            else if (type === 'heavy' || type === 'error') {
                tg.HapticFeedback.notificationOccurred('error');
            }
            
            console.log(`✅ Вибрация: ${type}`);
        } else {
            // Визуальная обратная связь для браузера
            this.showVisualFeedback(type);
        }
    },
    
    // Визуальная обратная связь для браузера
    showVisualFeedback(type) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #FF5500;
            color: white;
            padding: 15px 25px;
            border-radius: 30px;
            font-size: 20px;
            font-weight: bold;
            z-index: 10000;
            opacity: 0.9;
            animation: soundFade 0.3s ease;
            box-shadow: 0 4px 15px rgba(255,85,0,0.3);
            pointer-events: none;
        `;
        feedback.textContent = `🔊 ${type}`;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 300);
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

// Добавляем CSS анимацию
const style = document.createElement('style');
style.textContent = `
    @keyframes soundFade {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Settings.init(), 100);
});

window.Settings = Settings;

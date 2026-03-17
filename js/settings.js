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
        this.setupSoundButtons();
        console.log('Настройки загружены');
    },
    
    loadSettings() {
        this.state.sound = localStorage.getItem('settings_sound') !== 'false';
        this.state.theme = localStorage.getItem('settings_theme') || 'dark';
        this.applyTheme();
        this.updateSoundButtons();
        console.log('Загружены настройки:', this.state);
    },
    
    // Обновляем состояние кнопок звука
    updateSoundButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) return;
        
        if (this.state.sound) {
            soundOn.classList.add('sound-active');
            soundOff.classList.remove('sound-active');
        } else {
            soundOff.classList.add('sound-active');
            soundOn.classList.remove('sound-active');
        }
    },
    
    // Настройка кнопок звука
    setupSoundButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки звука не найдены');
            return;
        }
        
        console.log('✅ Кнопки звука найдены');
        
        // Убираем старые обработчики если есть
        soundOn.replaceWith(soundOn.cloneNode(true));
        soundOff.replaceWith(soundOff.cloneNode(true));
        
        // Получаем новые ссылки после замены
        const newSoundOn = document.getElementById('soundOn');
        const newSoundOff = document.getElementById('soundOff');
        
        // Добавляем обработчики
        newSoundOn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSound(true);
        });
        
        newSoundOff.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSound(false);
        });
        
        // Устанавливаем начальное состояние
        this.updateSoundButtons();
    },
    
    // Переключение звука
    toggleSound(enable) {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) return;
        
        this.state.sound = enable;
        localStorage.setItem('settings_sound', enable);
        
        if (enable) {
            soundOn.classList.add('sound-active');
            soundOff.classList.remove('sound-active');
            // Пробный звук при включении
            setTimeout(() => this.playSound('light'), 50);
        } else {
            soundOff.classList.add('sound-active');
            soundOn.classList.remove('sound-active');
        }
        
        console.log('Звук:', enable ? 'вкл 🔊' : 'выкл 🔇');
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

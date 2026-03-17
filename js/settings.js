// ============================================
// НАСТРОЙКИ PINGSTER - ПРОСТЫЕ И РАБОЧИЕ
// ============================================

const Settings = {
    // Состояние настроек
    sound: true,
    
    init() {
        this.loadSettings();
        this.setupSoundButtons();
        console.log('Настройки загружены');
    },
    
    loadSettings() {
        // Загружаем настройки
        this.sound = localStorage.getItem('settings_sound') !== 'false';
        console.log('Звук загружен:', this.sound);
    },
    
    setupSoundButtons() {
        // Находим кнопки
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки не найдены');
            return;
        }
        
        console.log('✅ Кнопки найдены');
        
        // Устанавливаем начальное состояние
        this.updateButtons(soundOn, soundOff);
        
        // Вешаем обработчики напрямую
        soundOn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Нажали ВКЛ');
            this.sound = true;
            localStorage.setItem('settings_sound', 'true');
            this.updateButtons(soundOn, soundOff);
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Нажали ВЫКЛ');
            this.sound = false;
            localStorage.setItem('settings_sound', 'false');
            this.updateButtons(soundOn, soundOff);
        };
    },
    
    updateButtons(soundOn, soundOff) {
        if (this.sound) {
            soundOn.style.color = '#FF5500';
            soundOff.style.color = '#8E97A6';
        } else {
            soundOn.style.color = '#8E97A6';
            soundOff.style.color = '#FF5500';
        }
    },
    
    playSound(type = 'light') {
        if (!this.sound) return;
        
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
            console.log('✅ Вибрация');
        }
    },
    
    click() { this.playSound(); },
    success() { this.playSound(); },
    error() { this.playSound(); },
    swipe() { this.playSound(); },
    match() { this.playSound(); }
};

// Запускаем
document.addEventListener('DOMContentLoaded', () => {
    Settings.init();
});

window.Settings = Settings;

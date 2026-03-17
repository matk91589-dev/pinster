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
        // Загружаем настройки из localStorage
        this.sound = localStorage.getItem('settings_sound') !== 'false';
        console.log('Звук загружен:', this.sound ? 'вкл' : 'выкл');
    },
    
    setupSoundButtons() {
        // Находим кнопки
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки не найдены!');
            return;
        }
        
        console.log('✅ Кнопки найдены');
        
        // Устанавливаем начальное состояние
        this.updateButtons();
        
        // Вешаем обработчики напрямую
        soundOn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👉 Нажали ВКЛ');
            this.sound = true;
            localStorage.setItem('settings_sound', 'true');
            this.updateButtons();
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👉 Нажали ВЫКЛ');
            this.sound = false;
            localStorage.setItem('settings_sound', 'false');
            this.updateButtons();
        };
    },
    
    updateButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) return;
        
        if (this.sound) {
            soundOn.classList.add('sound-active');
            soundOff.classList.remove('sound-active');
            console.log('🔊 Звук включен');
        } else {
            soundOff.classList.add('sound-active');
            soundOn.classList.remove('sound-active');
            console.log('🔇 Звук выключен');
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

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Settings.init(), 100);
});

window.Settings = Settings;

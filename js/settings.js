// ============================================
// НАСТРОЙКИ PINGSTER - РАБОЧАЯ ВЕРСИЯ
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
        
        // Убираем старые классы
        soundOn.classList.remove('sound-active');
        soundOff.classList.remove('sound-active');
        
        // Устанавливаем начальное состояние
        if (this.sound) {
            soundOn.classList.add('sound-active');
            soundOff.classList.remove('sound-active');
        } else {
            soundOff.classList.add('sound-active');
            soundOn.classList.remove('sound-active');
        }
        
        // Убираем старые обработчики (если были)
        soundOn.onclick = null;
        soundOff.onclick = null;
        
        // Вешаем новые обработчики
        soundOn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👉 Нажали ВКЛ');
            this.toggleSound(true);
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👉 Нажали ВЫКЛ');
            this.toggleSound(false);
        };
    },
    
    toggleSound(enable) {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) return;
        
        // Меняем состояние
        this.sound = enable;
        localStorage.setItem('settings_sound', enable);
        
        // Меняем классы
        if (enable) {
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

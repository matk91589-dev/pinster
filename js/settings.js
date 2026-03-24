// ============================================
// НАСТРОЙКИ PINGSTER - РАБОЧАЯ ВЕРСИЯ
// ============================================

const Settings = {
    sound: true,
    
    init() {
        this.loadSettings();
        this.setupSoundButtons();
        console.log('Настройки загружены');
    },
    
    loadSettings() {
        this.sound = localStorage.getItem('settings_sound') !== 'false';
        console.log('Звук загружен:', this.sound ? 'вкл' : 'выкл');
    },
    
    setupSoundButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки не найдены!');
            return;
        }
        
        console.log('✅ Кнопки найдены');
        
        // Убираем старые обработчики
        soundOn.onclick = null;
        soundOff.onclick = null;
        
        // Добавляем новые
        soundOn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔊 Звук включен');
            this.sound = true;
            localStorage.setItem('settings_sound', 'true');
            this.updateButtons();
            this.playSound();
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔇 Звук выключен');
            this.sound = false;
            localStorage.setItem('settings_sound', 'false');
            this.updateButtons();
        };
        
        this.updateButtons();
    },
    
    updateButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        if (!soundOn || !soundOff) return;
        
        // Используем тот же класс что в HTML (sound-option)
        if (this.sound) {
            soundOn.classList.add('active');
            soundOff.classList.remove('active');
            soundOn.style.color = '#FF5500';
            soundOff.style.color = '#8E97A6';
        } else {
            soundOff.classList.add('active');
            soundOn.classList.remove('active');
            soundOff.style.color = '#FF5500';
            soundOn.style.color = '#8E97A6';
        }
        
        console.log('✅ Кнопки обновлены:', this.sound ? 'вкл' : 'выкл');
    },
    
    playSound(type = 'light') {
        if (!this.sound) return;
        
        // Вибрация для Telegram WebApp
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
            console.log('✅ Вибрация через Telegram');
        } else if (navigator.vibrate) {
            navigator.vibrate(50);
            console.log('✅ Вибрация через браузер');
        }
    },
    
    click() { this.playSound(); },
    success() { this.playSound(); },
    error() { this.playSound(); },
    swipe() { this.playSound(); },
    match() { this.playSound(); }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Settings.init(), 100);
});

window.Settings = Settings;

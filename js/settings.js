// ============================================
// НАСТРОЙКИ PINGSTER - РАБОЧАЯ ВЕРСИЯ
// ============================================

const Settings = {
    sound: true,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        this.loadSettings();
        console.log('Настройки загружены');
        
        // Слушаем открытие экрана настроек
        this.setupScreenObserver();
    },
    
    setupScreenObserver() {
        // Проверяем сразу
        this.checkAndSetup();
        
        // Слушаем изменения экранов через MutationObserver
        const observer = new MutationObserver(() => {
            this.checkAndSetup();
        });
        
        observer.observe(document.body, { 
            attributes: true, 
            subtree: true,
            attributeFilter: ['class']
        });
    },
    
    checkAndSetup() {
        const settingsScreen = document.getElementById('settingsScreen');
        if (settingsScreen && settingsScreen.classList.contains('active')) {
            console.log('📱 Экран настроек активен, ищем кнопки');
            this.waitForSoundButtons();
        }
    },
    
    waitForSoundButtons() {
        let attempts = 0;
        const maxAttempts = 30;
        
        const check = () => {
            const soundOn = document.getElementById('soundOn');
            const soundOff = document.getElementById('soundOff');
            
            if (soundOn && soundOff) {
                console.log('✅ Кнопки звука найдены');
                this.setupSoundButtons();
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`⏳ Ждем кнопки... (${attempts}/${maxAttempts})`);
                    setTimeout(check, 100);
                } else {
                    console.error('❌ Кнопки звука не найдены');
                    console.log('🔍 #soundOn:', document.getElementById('soundOn'));
                    console.log('🔍 #soundOff:', document.getElementById('soundOff'));
                }
            }
        };
        
        check();
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
        
        console.log('✅ Настраиваем обработчики кнопок');
        
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
    setTimeout(() => Settings.init(), 200);
});

window.Settings = Settings;

// ============================================
// НАСТРОЙКИ PINGSTER - УПРОЩЕННАЯ ВЕРСИЯ
// ============================================

const Settings = {
    sound: true,
    
    init() {
        this.loadSettings();
        this.setupSoundButtons();
        console.log('✅ Settings.init() выполнен');
    },
    
    loadSettings() {
        this.sound = localStorage.getItem('settings_sound') !== 'false';
        console.log('🔊 Звук:', this.sound ? 'ВКЛ' : 'ВЫКЛ');
    },
    
    setupSoundButtons() {
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        console.log('🔍 soundOn:', soundOn);
        console.log('🔍 soundOff:', soundOff);
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки не найдены');
            return;
        }
        
        soundOn.onclick = (e) => {
            e.preventDefault();
            this.sound = true;
            localStorage.setItem('settings_sound', 'true');
            this.updateButtons();
            console.log('🔊 Звук ВКЛ');
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            this.sound = false;
            localStorage.setItem('settings_sound', 'false');
            this.updateButtons();
            console.log('🔇 Звук ВЫКЛ');
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
        } else {
            soundOff.classList.add('active');
            soundOn.classList.remove('active');
        }
        console.log('🎨 Кнопки обновлены');
    },
    
    playSound() {
        if (!this.sound) return;
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    }
};

// Просто вызываем init
setTimeout(() => {
    console.log('🔄 Вызываем Settings.init()');
    Settings.init();
}, 500);

window.Settings = Settings;

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
        console.log('🏁 Settings.init() - настройки загружены');
        
        // Слушаем открытие экрана настроек
        this.setupScreenObserver();
        
        // Принудительная проверка через 2 секунды
        setTimeout(() => {
            console.log('🔄 Принудительная проверка через 2 секунды');
            this.checkAndSetup();
        }, 2000);
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
        
        console.log('👁️ MutationObserver настроен');
    },
    
    checkAndSetup() {
        console.log('🔍 checkAndSetup вызван');
        const settingsScreen = document.getElementById('settingsScreen');
        console.log('📱 settingsScreen найден:', !!settingsScreen);
        console.log('📱 settingsScreen активен:', settingsScreen?.classList.contains('active'));
        
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
                console.log('✅ Кнопки звука найдены!');
                this.setupSoundButtons();
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`⏳ Ждем кнопки... (${attempts}/${maxAttempts})`);
                    setTimeout(check, 100);
                } else {
                    console.error('❌ Кнопки звука НЕ найдены после ожидания');
                    console.log('🔍 #soundOn результат:', document.getElementById('soundOn'));
                    console.log('🔍 #soundOff результат:', document.getElementById('soundOff'));
                    
                    // Проверяем, есть ли вообще экран настроек
                    const settingsScreen = document.getElementById('settingsScreen');
                    if (settingsScreen) {
                        console.log('📱 Экран настроек существует, ищем внутри');
                        const soundElements = settingsScreen.querySelectorAll('.sound-option');
                        console.log('🔍 .sound-option внутри настроек:', soundElements.length);
                        soundElements.forEach((el, i) => {
                            console.log(`  ${i}: id="${el.id}", text="${el.textContent}"`);
                        });
                    } else {
                        console.log('❌ Экран настроек не найден в DOM');
                    }
                }
            }
        };
        
        check();
    },
    
    loadSettings() {
        this.sound = localStorage.getItem('settings_sound') !== 'false';
        console.log('🔊 Звук загружен из localStorage:', this.sound ? 'ВКЛ' : 'ВЫКЛ');
    },
    
    setupSoundButtons() {
        console.log('🔧 setupSoundButtons вызван');
        const soundOn = document.getElementById('soundOn');
        const soundOff = document.getElementById('soundOff');
        
        console.log('🔍 soundOn элемент:', soundOn);
        console.log('🔍 soundOff элемент:', soundOff);
        
        if (!soundOn || !soundOff) {
            console.log('❌ Кнопки не найдены в setupSoundButtons!');
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
            console.log('🔊 Звук включен (клик)');
            this.sound = true;
            localStorage.setItem('settings_sound', 'true');
            this.updateButtons();
            this.playSound();
        };
        
        soundOff.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔇 Звук выключен (клик)');
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
        
        console.log('✅ Кнопки обновлены (UI):', this.sound ? 'ВКЛ' : 'ВЫКЛ');
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
    console.log('📄 DOMContentLoaded, запускаем Settings.init() через 200ms');
    setTimeout(() => Settings.init(), 200);
});

window.Settings = Settings;

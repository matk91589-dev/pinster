// ============================================
// НАСТРОЙКИ PINGSTER - ПОЛНАЯ ВЕРСИЯ
// ============================================

const Settings = {
    // Состояние настроек
    state: {
        sound: true,
        volume: 70,
        notifications: true,
        theme: 'dark',
        language: 'ru',
        showAge: true,
        showSteam: true,
        showFaceit: true
    },
    
    init() {
        this.loadSettings();
        this.setupToggles();
        this.setupSlider();
        this.applyTheme();
        console.log('⚙️ Настройки инициализированы');
    },
    
    loadSettings() {
        // Загружаем из localStorage
        this.state.sound = localStorage.getItem('settings_sound') !== 'false';
        this.state.volume = parseInt(localStorage.getItem('settings_volume')) || 70;
        this.state.notifications = localStorage.getItem('settings_notifications') !== 'false';
        this.state.theme = localStorage.getItem('settings_theme') || 'dark';
        this.state.showAge = localStorage.getItem('settings_showAge') !== 'false';
        this.state.showSteam = localStorage.getItem('settings_showSteam') !== 'false';
        this.state.showFaceit = localStorage.getItem('settings_showFaceit') !== 'false';
        
        // Обновляем UI
        this.updateToggles();
    },
    
    setupToggles() {
        // Находим все квадратные переключатели
        document.querySelectorAll('.square-toggle').forEach(toggle => {
            const setting = toggle.dataset.setting;
            if (!setting) return;
            
            // Устанавливаем начальное состояние
            if (this.state[setting]) {
                toggle.classList.add('active');
            }
            
            // Добавляем обработчик клика
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Переключаем класс
                toggle.classList.toggle('active');
                
                // Обновляем состояние
                const isActive = toggle.classList.contains('active');
                this.state[setting] = isActive;
                
                // Сохраняем в localStorage
                localStorage.setItem(`settings_${setting}`, isActive);
                
                // Применяем изменения
                this.applySetting(setting, isActive);
                
                console.log(`⚙️ ${setting}:`, isActive);
            });
        });
    },
    
    setupSlider() {
        const slider = document.getElementById('volumeSlider');
        if (!slider) return;
        
        // Устанавливаем значение
        slider.value = this.state.volume;
        
        // Добавляем обработчик
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.volume = value;
            localStorage.setItem('settings_volume', value);
            console.log('Громкость:', value);
        });
    },
    
    updateToggles() {
        document.querySelectorAll('.square-toggle').forEach(toggle => {
            const setting = toggle.dataset.setting;
            if (setting && this.state[setting]) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        });
    },
    
    applySetting(setting, value) {
        switch(setting) {
            case 'theme':
                this.applyTheme();
                break;
            case 'sound':
                // Здесь будет логика звуков
                break;
            case 'notifications':
                // Здесь будет логика уведомлений
                break;
            default:
                // Для приватности пока ничего не делаем
                break;
        }
    },
    
    applyTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
    },
    
    // Получить значение настройки
    get(key) {
        return this.state[key];
    },
    
    // Установить значение настройки
    set(key, value) {
        this.state[key] = value;
        localStorage.setItem(`settings_${key}`, value);
        this.applySetting(key, value);
        
        // Обновляем UI если нужно
        if (key === 'theme') {
            this.applyTheme();
        }
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Даем небольшую задержку, чтобы DOM точно загрузился
    setTimeout(() => {
        Settings.init();
    }, 100);
});

window.Settings = Settings;

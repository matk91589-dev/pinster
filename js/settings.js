// ============================================
// НАСТРОЙКИ PINGSTER - МИНИМАЛИЗМ
// ============================================

const Settings = {
    state: {
        sound: true,
        theme: 'dark'
    },
    
    init() {
        this.loadSettings();
        this.setupToggles();
        this.setupThemeSelector();
        console.log('Настройки загружены');
    },
    
    loadSettings() {
        this.state.sound = localStorage.getItem('settings_sound') !== 'false';
        this.state.theme = localStorage.getItem('settings_theme') || 'dark';
        this.applyTheme();
    },
    
    setupToggles() {
        const toggle = document.querySelector('.toggle-switch');
        if (!toggle) return;
        
        if (this.state.sound) {
            toggle.classList.add('active');
        }
        
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            this.state.sound = toggle.classList.contains('active');
            localStorage.setItem('settings_sound', this.state.sound);
        });
    },
    
    setupThemeSelector() {
        const options = document.querySelectorAll('.theme-option');
        
        options.forEach(opt => {
            if (opt.classList.contains('dark') && this.state.theme === 'dark') {
                opt.classList.add('active');
            }
            if (opt.classList.contains('light') && this.state.theme === 'light') {
                opt.classList.add('active');
            }
            
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                this.state.theme = opt.classList.contains('dark') ? 'dark' : 'light';
                localStorage.setItem('settings_theme', this.state.theme);
                this.applyTheme();
            });
        });
    },
    
    applyTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Settings.init(), 100);
});

window.Settings = Settings;

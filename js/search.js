// ============================================
// ПОИСК (Telegram Mini App версия)
// ============================================

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    
    init() {
        this.resetTimer();
    },
    
    setStyle(style, element) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.style-option');
        options.forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        App.hapticFeedback('light');
    },
    
    start(mode, value) {
        this.currentMode = mode;
        App.showScreen('searchScreen', false);
        
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.resetTimer();
        this.startTimer();
        
        App.hapticFeedback('medium');
        console.log(`Поиск в режиме ${mode} с данными: ${value}`);
    },
    
    showScreen(mode) {
        this.currentMode = mode;
        App.showScreen('searchScreen', false);
        
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.resetTimer();
        this.startTimer();
    },
    
    startTimer() {
        this.seconds = 0;
        this.updateDisplay();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    },
    
    updateDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        document.getElementById('searchTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.seconds = 0;
        this.updateDisplay();
    },
    
    cancel() {
        this.resetTimer();
        App.showScreen('mainScreen', true);
        App.hapticFeedback('light');
    }
};

window.Search = Search;

// ============================================
// ФУНКЦИИ ПОИСКА
// ============================================

let searchTimerInterval = null;
let searchSeconds = 0;
let currentSearchMode = '';

function setStyle(style, element) {
    const parent = element.parentElement;
    const options = parent.querySelectorAll('.style-option');
    options.forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

function showSearchScreen(mode) {
    currentSearchMode = mode;
    hideAllScreens();
    
    document.getElementById('searchModeTitle').textContent = mode;
    document.getElementById('searchScreen').style.display = 'flex';
    
    resetTimer();
    startTimer();
}

function startTimer() {
    searchSeconds = 0;
    updateTimerDisplay();
    
    if (searchTimerInterval) clearInterval(searchTimerInterval);
    
    searchTimerInterval = setInterval(() => {
        searchSeconds++;
        updateTimerDisplay();
    }, CONFIG.SEARCH.TIMER_UPDATE_INTERVAL);
}

function updateTimerDisplay() {
    const minutes = Math.floor(searchSeconds / 60);
    const seconds = searchSeconds % 60;
    document.getElementById('searchTimer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
    if (searchTimerInterval) {
        clearInterval(searchTimerInterval);
        searchTimerInterval = null;
    }
    searchSeconds = 0;
    updateTimerDisplay();
}

function cancelSearch() {
    resetTimer();
    hideAllScreens();
    document.getElementById(lastModeScreen).style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

function startSearch(mode, value) {
    showSearchScreen(mode);
    console.log(`Поиск в режиме ${mode} с данными: ${value}`);
}
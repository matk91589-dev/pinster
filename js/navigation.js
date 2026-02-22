// ============================================
// ФУНКЦИИ НАВИГАЦИИ
// ============================================

// Функция для управления видимостью нижней навигации
function showBottomNav(show) {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = show ? 'flex' : 'none';
    }
}

// Функция для обновления активной кнопки в навигации
function setActiveNavButton(activeScreen) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Определяем какая кнопка должна быть активной
    if (activeScreen === 'mainScreen') {
        document.querySelector('.nav-item[onclick="showMainScreen()"]')?.classList.add('active');
    } else if (activeScreen === 'shopScreen') {
        document.querySelector('.nav-item[onclick="showShopScreen()"]')?.classList.add('active');
    } else if (activeScreen === 'profileScreen') {
        document.querySelector('.nav-item[onclick="showProfileScreen()"]')?.classList.add('active');
    }
}

// ============================================
// НОВАЯ hideAllScreens() - через классы
// ============================================
function hideAllScreens() {
    document.querySelectorAll('.screen')
        .forEach(screen => screen.classList.remove('active'));
}

// ============================================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ (ОПЦИОНАЛЬНО)
// ============================================
function showScreen(screenId, showNav = true) {
    hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        showBottomNav(showNav);
        
        // Устанавливаем активную кнопку навигации если нужно
        if (showNav && (screenId === 'mainScreen' || screenId === 'shopScreen' || screenId === 'profileScreen')) {
            setActiveNavButton(screenId);
        } else {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        }
    }
}

// ============================================
// ИСПРАВЛЕННЫЕ ФУНКЦИИ
// ============================================

function startApp() {
    console.log('startApp вызвана');
    showScreen('mainScreen', true);
}

function showMainScreen() {
    showScreen('mainScreen', true);
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showProfileScreen() {
    showScreen('profileScreen', true);
    
    if (typeof isSearchMode !== 'undefined' && isSearchMode) {
        if (typeof exitSearchMode === 'function') exitSearchMode();
    } else {
        if (typeof updateSearchUI === 'function') updateSearchUI();
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showShopScreen() {
    showScreen('shopScreen', true);
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showSettingsScreen() {
    const settingsScreen = document.getElementById('settingsScreen');
    if (!settingsScreen) {
        console.warn('settingsScreen не найден в HTML. Создай его или убери вызов.');
        showMainScreen();
        return;
    }
    
    showScreen('settingsScreen', true);
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.add('active');
    }
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    
    const faceitScreen = document.getElementById('faceitScreen');
    if (!faceitScreen) {
        console.warn('faceitScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    showScreen('faceitScreen', false);
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    // Проверяем существование элементов перед обновлением
    const ageEl = document.getElementById('faceitAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('faceitSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const linkEl = document.getElementById('faceitLinkInput');
    if (linkEl && typeof savedFaceitLink !== 'undefined') linkEl.value = savedFaceitLink;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    
    const premierScreen = document.getElementById('premierScreen');
    if (!premierScreen) {
        console.warn('premierScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    showScreen('premierScreen', false);
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('premierAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('premierSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    
    const primeScreen = document.getElementById('primeScreen');
    if (!primeScreen) {
        console.warn('primeScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    showScreen('primeScreen', false);
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('primeAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('primeSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    
    const publicScreen = document.getElementById('publicScreen');
    if (!publicScreen) {
        console.warn('publicScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    showScreen('publicScreen', false);
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('publicAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('publicSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

// Функция для экрана поиска
function showSearchScreen() {
    const searchScreen = document.getElementById('searchScreen');
    if (!searchScreen) {
        console.warn('searchScreen не найден');
        showMainScreen();
        return;
    }
    
    showScreen('searchScreen', false);
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

// ============================================
// DOM CONTENT LOADED - ИСПРАВЛЕНО
// ============================================
document.addEventListener('DOMContentLoaded', function() {

    // ===== TELEGRAM INIT =====
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.disableVerticalSwipes();
    }

    // Проверяем, виден ли стартовый экран (через классы)
    const startScreen = document.getElementById('startScreen');
    if (startScreen && startScreen.classList.contains('active')) {
        showBottomNav(false);
    }
});

// Для обратной совместимости
window.showScreen = showScreen;

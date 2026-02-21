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

function hideAllScreens() {
    const screens = [
        'startScreen', 'mainScreen', 'profileScreen', 'shopScreen', 'settingsScreen',
        'faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen', 'searchScreen'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function startApp() {
    console.log('startApp вызвана');
    hideAllScreens();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        setActiveNavButton('mainScreen');
        showBottomNav(true); // Показываем навигацию на главном экране
    } else {
        console.error('mainScreen не найден!');
    }
}

function showMainScreen() {
    hideAllScreens();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
        setActiveNavButton('mainScreen');
        showBottomNav(true); // Показываем навигацию
    }
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showProfileScreen() {
    hideAllScreens();
    const profileScreen = document.getElementById('profileScreen');
    if (profileScreen) {
        profileScreen.style.display = 'flex';
        setActiveNavButton('profileScreen');
        showBottomNav(true); // Показываем навигацию
    }
    
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
    hideAllScreens();
    const shopScreen = document.getElementById('shopScreen');
    if (shopScreen) {
        shopScreen.style.display = 'flex';
        setActiveNavButton('shopScreen');
        showBottomNav(true); // Показываем навигацию
    }
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
}

function showSettingsScreen() {
    hideAllScreens();
    const settingsScreen = document.getElementById('settingsScreen');
    if (settingsScreen) {
        settingsScreen.style.display = 'flex';
        showBottomNav(true); // Показываем навигацию на настройках
    } else {
        console.warn('settingsScreen не найден в HTML. Создай его или убери вызов.');
        showMainScreen();
        return;
    }
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.add('active');
    }
    
    // Для экрана настроек убираем активный класс с навигации
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    hideAllScreens();
    const faceitScreen = document.getElementById('faceitScreen');
    if (faceitScreen) {
        faceitScreen.style.display = 'flex';
        showBottomNav(false); // Скрываем навигацию на экране FACEIT
    } else {
        console.warn('faceitScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
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
    
    // Для экранов режимов убираем активный класс с навигации
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    hideAllScreens();
    const premierScreen = document.getElementById('premierScreen');
    if (premierScreen) {
        premierScreen.style.display = 'flex';
        showBottomNav(false); // Скрываем навигацию на экране PREMIER
    } else {
        console.warn('premierScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('premierAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('premierSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    hideAllScreens();
    const primeScreen = document.getElementById('primeScreen');
    if (primeScreen) {
        primeScreen.style.display = 'flex';
        showBottomNav(false); // Скрываем навигацию на экране PRIME
    } else {
        console.warn('primeScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('primeAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('primeSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    hideAllScreens();
    const publicScreen = document.getElementById('publicScreen');
    if (publicScreen) {
        publicScreen.style.display = 'flex';
        showBottomNav(false); // Скрываем навигацию на экране PUBLIC
    } else {
        console.warn('publicScreen не найден в HTML. Создай его или убери кнопку.');
        showMainScreen();
        return;
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const ageEl = document.getElementById('publicAgeValue');
    if (ageEl && typeof savedAge !== 'undefined') ageEl.textContent = savedAge;
    
    const steamEl = document.getElementById('publicSteamInput');
    if (steamEl && typeof savedSteam !== 'undefined') steamEl.value = savedSteam;
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

// Функция для экрана поиска
function showSearchScreen() {
    hideAllScreens();
    const searchScreen = document.getElementById('searchScreen');
    if (searchScreen) {
        searchScreen.style.display = 'flex';
        showBottomNav(false); // Скрываем навигацию на экране поиска
    }
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

// При загрузке страницы скрываем навигацию на стартовом экране
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, виден ли стартовый экран
    const startScreen = document.getElementById('startScreen');
    if (startScreen && startScreen.style.display !== 'none') {
        showBottomNav(false); // Скрываем навигацию
    }
});

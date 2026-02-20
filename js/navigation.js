// ============================================
// ФУНКЦИИ НАВИГАЦИИ
// ============================================

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
    } else {
        console.error('mainScreen не найден!');
    }
}

function showMainScreen() {
    hideAllScreens();
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) {
        mainScreen.style.display = 'flex';
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
    } else {
        console.warn('settingsScreen не найден в HTML. Создай его или убери вызов.');
        // Показываем заглушку или возвращаемся на главную
        showMainScreen();
        return;
    }
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.add('active');
    }
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    hideAllScreens();
    const faceitScreen = document.getElementById('faceitScreen');
    if (faceitScreen) {
        faceitScreen.style.display = 'flex';
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
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    hideAllScreens();
    const premierScreen = document.getElementById('premierScreen');
    if (premierScreen) {
        premierScreen.style.display = 'flex';
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
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    hideAllScreens();
    const primeScreen = document.getElementById('primeScreen');
    if (primeScreen) {
        primeScreen.style.display = 'flex';
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
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    hideAllScreens();
    const publicScreen = document.getElementById('publicScreen');
    if (publicScreen) {
        publicScreen.style.display = 'flex';
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
}

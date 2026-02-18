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
    document.getElementById('mainScreen').style.display = 'flex';
}

function showMainScreen() {
    hideAllScreens();
    document.getElementById('mainScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

function showProfileScreen() {
    hideAllScreens();
    document.getElementById('profileScreen').style.display = 'flex';
    
    if (isSearchMode) {
        exitSearchMode();
    } else {
        updateSearchUI();
    }
    
    loadSavedValues();
    document.getElementById('settingsIcon').classList.remove('active');
}

function showShopScreen() {
    hideAllScreens();
    document.getElementById('shopScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

function showSettingsScreen() {
    hideAllScreens();
    document.getElementById('settingsScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.add('active');
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    hideAllScreens();
    document.getElementById('faceitScreen').style.display = 'flex';
    loadSavedValues();
    
    document.getElementById('faceitAgeValue').textContent = savedAge;
    document.getElementById('faceitSteamInput').value = savedSteam;
    document.getElementById('faceitLinkInput').value = savedFaceitLink;
    document.getElementById('settingsIcon').classList.remove('active');
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    hideAllScreens();
    document.getElementById('premierScreen').style.display = 'flex';
    loadSavedValues();
    
    document.getElementById('premierAgeValue').textContent = savedAge;
    document.getElementById('premierSteamInput').value = savedSteam;
    document.getElementById('settingsIcon').classList.remove('active');
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    hideAllScreens();
    document.getElementById('primeScreen').style.display = 'flex';
    loadSavedValues();
    
    document.getElementById('primeAgeValue').textContent = savedAge;
    document.getElementById('primeSteamInput').value = savedSteam;
    document.getElementById('settingsIcon').classList.remove('active');
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    hideAllScreens();
    document.getElementById('publicScreen').style.display = 'flex';
    loadSavedValues();
    
    document.getElementById('publicAgeValue').textContent = savedAge;
    document.getElementById('publicSteamInput').value = savedSteam;
    document.getElementById('settingsIcon').classList.remove('active');
}
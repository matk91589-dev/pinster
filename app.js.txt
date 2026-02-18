// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let lastModeScreen = 'faceitScreen';
let editMode = false;
let currentUserId = 'pingster_' + Date.now();
let isSearchMode = false;
let searchQuery = '';

let tempName = '-';
let tempAvatar = '👤';
let tempAge = '-';
let tempSteam = '-';
let tempFaceitLink = '-';

let savedName = '-';
let savedAvatar = '👤';
let savedAge = '-';
let savedSteam = '-';
let savedFaceitLink = '-';
let savedCoins = 1000;
let savedOwnedNicks = [];
let savedOwnedFrames = [];

let coins = 1000;
let ownedNicks = [];
let ownedFrames = [];
let friendsData = [];

const nicks = [
    { id: 'red', name: 'Красный', class: 'red', price: 50 },
    { id: 'green', name: 'Зеленый', class: 'green', price: 50 },
    { id: 'blue', name: 'Синий', class: 'blue', price: 50 },
    { id: 'purple', name: 'Фиолетовый', class: 'purple', price: 100 },
    { id: 'orange', name: 'Оранжевый', class: 'orange', price: 100 },
    { id: 'multicolor', name: 'Мультицвет', class: 'multicolor', price: 200 }
];

const frames = [
    { id: 'red', name: 'Красная рамка', class: 'frame-red', price: 100 },
    { id: 'gold', name: 'Золотая рамка', class: 'frame-gold', price: 150 },
    { id: 'blue', name: 'Синяя рамка', class: 'frame-blue', price: 100 },
    { id: 'green', name: 'Зеленая рамка', class: 'frame-green', price: 100 },
    { id: 'purple', name: 'Фиолетовая рамка', class: 'frame-purple', price: 200 },
    { id: 'rainbow', name: 'Радужная рамка', class: 'frame-rainbow', price: 300 }
];

// ============================================
// ФУНКЦИИ ДЛЯ ЛОГОТИПА
// ============================================
function handleLogoClick() {
    const searchScreen = document.getElementById('searchScreen');
    const startScreen = document.getElementById('startScreen');
    
    if (searchScreen && searchScreen.style.display === 'flex') {
        alert('Сначала отмените поиск');
        return;
    }
    if (startScreen && startScreen.style.display === 'flex') return;
    
    hideAllScreens();
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) mainScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
}

// ============================================
// ФУНКЦИИ НАВИГАЦИИ
// ============================================
function startApp() {
    hideAllScreens();
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) mainScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
}

function showMainScreen() {
    hideAllScreens();
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) mainScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
}

function showProfileScreen() {
    hideAllScreens();
    
    const profileScreen = document.getElementById('profileScreen');
    if (profileScreen) profileScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (isSearchMode) {
        if (typeof exitSearchMode === 'function') exitSearchMode();
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
}

function showSettingsScreen() {
    const searchScreen = document.getElementById('searchScreen');
    if (searchScreen && searchScreen.style.display === 'flex') {
        alert('Для просмотра настроек сначала отмените поиск');
        return;
    }
    
    hideAllScreens();
    
    const settingsScreen = document.getElementById('settingsScreen');
    if (settingsScreen) settingsScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.add('active');
}

function showShopScreen() {
    hideAllScreens();
    
    const shopScreen = document.getElementById('shopScreen');
    if (shopScreen) shopScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (typeof renderShop === 'function') renderShop();
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    hideAllScreens();
    
    const faceitScreen = document.getElementById('faceitScreen');
    if (faceitScreen) faceitScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const faceitAgeValue = document.getElementById('faceitAgeValue');
    if (faceitAgeValue) faceitAgeValue.textContent = savedAge;
    
    const faceitSteamInput = document.getElementById('faceitSteamInput');
    if (faceitSteamInput) faceitSteamInput.value = savedSteam;
    
    const faceitLinkInput = document.getElementById('faceitLinkInput');
    if (faceitLinkInput) faceitLinkInput.value = savedFaceitLink;
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    hideAllScreens();
    
    const premierScreen = document.getElementById('premierScreen');
    if (premierScreen) premierScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const premierAgeValue = document.getElementById('premierAgeValue');
    if (premierAgeValue) premierAgeValue.textContent = savedAge;
    
    const premierSteamInput = document.getElementById('premierSteamInput');
    if (premierSteamInput) premierSteamInput.value = savedSteam;
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    hideAllScreens();
    
    const primeScreen = document.getElementById('primeScreen');
    if (primeScreen) primeScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const primeAgeValue = document.getElementById('primeAgeValue');
    if (primeAgeValue) primeAgeValue.textContent = savedAge;
    
    const primeSteamInput = document.getElementById('primeSteamInput');
    if (primeSteamInput) primeSteamInput.value = savedSteam;
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    hideAllScreens();
    
    const publicScreen = document.getElementById('publicScreen');
    if (publicScreen) publicScreen.style.display = 'flex';
    
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) settingsIcon.classList.remove('active');
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    const publicAgeValue = document.getElementById('publicAgeValue');
    if (publicAgeValue) publicAgeValue.textContent = savedAge;
    
    const publicSteamInput = document.getElementById('publicSteamInput');
    if (publicSteamInput) publicSteamInput.value = savedSteam;
}

function hideAllScreens() {
    const screens = [
        'startScreen', 'mainScreen', 'profileScreen', 'settingsScreen', 'shopScreen',
        'faceitScreen', 'premierScreen', 'primeScreen', 'publicScreen', 'searchScreen'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showShopTab(tab) {
    const tabs = document.querySelectorAll('.shop-tab');
    const shopContent = document.getElementById('shopTabContent');
    const tasksContent = document.getElementById('tasksTabContent');
    
    if (tabs.length) {
        tabs.forEach(t => t.classList.remove('active'));
    }
    
    if (tab === 'shop') {
        if (tabs[0]) tabs[0].classList.add('active');
        if (shopContent) shopContent.style.display = 'block';
        if (tasksContent) tasksContent.style.display = 'none';
    } else {
        if (tabs[1]) tabs[1].classList.add('active');
        if (shopContent) shopContent.style.display = 'none';
        if (tasksContent) tasksContent.style.display = 'flex';
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.onload = async function() {
    console.log('Запуск...');

    // Ждем немного чтобы DOM точно загрузился
    setTimeout(async function() {
        // ===== ПОКАЗЫВАЕМ ХЕДЕР =====
        const header = document.querySelector('.header');
        if (header) {
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';
        }

        // Сначала прячем всё
        hideAllScreens();
        
        // Показываем стартовый экран
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
        
        // Скрываем верхний логотип
        const headerLogo = document.querySelector('.header .logo');
        if (headerLogo) headerLogo.style.display = 'none';
        
        const header2 = document.querySelector('.header');
        if (header2) header2.style.borderBottom = 'none';
        
        // Загружаем всё остальное с проверками
        try {
            if (typeof initProfile === 'function') initProfile();
        } catch (e) {
            console.error('Ошибка в initProfile:', e);
        }
        
        try {
            if (typeof setupDragAndDrop === 'function') setupDragAndDrop();
        } catch (e) {
            console.error('Ошибка в setupDragAndDrop:', e);
        }
        
        try {
            if (typeof loadUserFromDB === 'function') await loadUserFromDB();
        } catch (e) {
            console.error('Ошибка в loadUserFromDB:', e);
        }
        
        try {
            if (typeof generateFriends === 'function') generateFriends();
        } catch (e) {
            console.error('Ошибка в generateFriends:', e);
        }
        
        try {
            if (typeof renderShop === 'function') renderShop();
        } catch (e) {
            console.error('Ошибка в renderShop:', e);
        }
        
        console.log('Готово!');
    }, 100); // Небольшая задержка для гарантии
};

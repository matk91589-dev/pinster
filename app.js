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
    if (document.getElementById('searchScreen').style.display === 'flex') {
        alert('Сначала отмените поиск');
        return;
    }
    if (document.getElementById('startScreen').style.display === 'flex') return;
    
    hideAllScreens();
    document.getElementById('mainScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

// ============================================
// ФУНКЦИИ НАВИГАЦИИ
// ============================================
function startApp() {
    hideAllScreens();
    document.getElementById('mainScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

function showMainScreen() {
    hideAllScreens();
    document.getElementById('mainScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
}

function showProfileScreen() {
    hideAllScreens();
    document.getElementById('profileScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    
    if (isSearchMode) {
        if (typeof exitSearchMode === 'function') exitSearchMode();
    }
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
}

function showSettingsScreen() {
    if (document.getElementById('searchScreen').style.display === 'flex') {
        alert('Для просмотра настроек сначала отмените поиск');
        return;
    }
    hideAllScreens();
    document.getElementById('settingsScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.add('active');
}

function showShopScreen() {
    hideAllScreens();
    document.getElementById('shopScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    if (typeof renderShop === 'function') renderShop();
}

function showFaceitScreen() {
    lastModeScreen = 'faceitScreen';
    hideAllScreens();
    document.getElementById('faceitScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    document.getElementById('faceitAgeValue').textContent = savedAge;
    document.getElementById('faceitSteamInput').value = savedSteam;
    document.getElementById('faceitLinkInput').value = savedFaceitLink;
}

function showPremierScreen() {
    lastModeScreen = 'premierScreen';
    hideAllScreens();
    document.getElementById('premierScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    document.getElementById('premierAgeValue').textContent = savedAge;
    document.getElementById('premierSteamInput').value = savedSteam;
}

function showPrimeScreen() {
    lastModeScreen = 'primeScreen';
    hideAllScreens();
    document.getElementById('primeScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    document.getElementById('primeAgeValue').textContent = savedAge;
    document.getElementById('primeSteamInput').value = savedSteam;
}

function showPublicScreen() {
    lastModeScreen = 'publicScreen';
    hideAllScreens();
    document.getElementById('publicScreen').style.display = 'flex';
    document.getElementById('settingsIcon').classList.remove('active');
    if (typeof loadSavedValues === 'function') loadSavedValues();
    
    document.getElementById('publicAgeValue').textContent = savedAge;
    document.getElementById('publicSteamInput').value = savedSteam;
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
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'shop') {
        tabs[0].classList.add('active');
        shopContent.style.display = 'block';
        tasksContent.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        shopContent.style.display = 'none';
        tasksContent.style.display = 'flex';
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.onload = async function() {
    console.log('Запуск...');

    // Сначала прячем всё
    hideAllScreens();
    
    // Показываем стартовый экран
    document.getElementById('startScreen').style.display = 'flex';
    
    // Скрываем верхний логотип
    const headerLogo = document.querySelector('.header .logo');
    if (headerLogo) headerLogo.style.display = 'none';
    
    const header = document.querySelector('.header');
    if (header) header.style.borderBottom = 'none';
    
    // Загружаем всё остальное
    if (typeof initProfile === 'function') initProfile();
    if (typeof setupDragAndDrop === 'function') setupDragAndDrop();
    if (typeof loadUserFromDB === 'function') await loadUserFromDB();
    if (typeof generateFriends === 'function') generateFriends();
    if (typeof renderShop === 'function') renderShop();
    
    console.log('Готово!');
};

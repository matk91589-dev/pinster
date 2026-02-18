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
        exitSearchMode();
    } else {
        updateSearchUI();
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
// ФУНКЦИЯ ГЕНЕРАЦИИ СЛУЧАЙНОГО НИКА
// ============================================
function generateRandomName() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const length = Math.floor(Math.random() * 3) + 5; // 5-7 букв
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
}

// ============================================
// ЗАГРУЗКА ЗНАЧЕНИЙ В ПРОФИЛЬ
// ============================================
function loadSavedValues() {
    document.getElementById('profileName').textContent = savedName;
    document.getElementById('ageValue').textContent = savedAge === '-' ? '' : savedAge;
    document.getElementById('steamDisplay').textContent = savedSteam === '-' ? '' : savedSteam;
    document.getElementById('faceitLinkDisplay').textContent = savedFaceitLink === '-' ? '' : savedFaceitLink;
    document.getElementById('coinsAmount').textContent = coins;
    
    const avatarDiv = document.getElementById('profileAvatar');
    if (savedAvatar && savedAvatar.startsWith('http')) {
        avatarDiv.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        avatarDiv.className = 'profile-avatar';
    } else {
        avatarDiv.innerHTML = savedAvatar;
        avatarDiv.className = 'profile-avatar';
        ownedFrames.forEach(frameId => {
            const frame = frames.find(f => f.id === frameId);
            if (frame) avatarDiv.classList.add(frame.class);
        });
    }
    
    const profileName = document.getElementById('profileName');
    profileName.className = 'profile-name';
    ownedNicks.forEach(nickId => {
        const nick = nicks.find(n => n.id === nickId);
        if (nick) profileName.classList.add(nick.class);
    });
    
    tempName = savedName;
    tempAvatar = savedAvatar;
    tempAge = savedAge;
    tempSteam = savedSteam;
    tempFaceitLink = savedFaceitLink;
}

// ============================================
// РЕЖИМ РЕДАКТИРОВАНИЯ
// ============================================
function toggleEditMode() {
    editMode = !editMode;
    console.log('editMode =', editMode);
    
    const elements = [
        document.getElementById('profileName'),
        document.getElementById('profileAvatar'),
        document.getElementById('ageCard'),
        document.getElementById('steamCard'),
        document.getElementById('faceitLinkCard')
    ];
    
    const editToggle = document.getElementById('editToggle');
    const applyBtn = document.getElementById('applyBtn');
    
    if (editMode) {
        if (editToggle) editToggle.classList.add('active');
        if (applyBtn) applyBtn.classList.add('visible');
        elements.forEach(el => {
            if (el) el.classList.add('editable');
        });
    } else {
        if (editToggle) editToggle.classList.remove('active');
        if (applyBtn) applyBtn.classList.remove('visible');
        elements.forEach(el => {
            if (el) el.classList.remove('editable');
        });
    }
}

// ============================================
// ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ
// ============================================
function applyChanges() {
    savedName = tempName;
    savedAvatar = tempAvatar;
    savedAge = tempAge;
    savedSteam = tempSteam;
    savedFaceitLink = tempFaceitLink;
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    if (typeof saveUserToDB === 'function') saveUserToDB();
    toggleEditMode();
}

// ============================================
// РЕДАКТИРОВАНИЕ ПОЛЕЙ
// ============================================
function editName() {
    if (!editMode) return;
    const newName = prompt('Введите новый никнейм (3-10 символов):', tempName === '-' ? '' : tempName);
    if (newName && newName.length >= 3 && newName.length <= 10) {
        tempName = newName;
        document.getElementById('profileName').textContent = newName;
    }
}

function editAge() {
    if (!editMode) return;
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        tempAge = newAge;
        document.getElementById('ageValue').textContent = newAge;
    }
}

function editSteam() {
    if (!editMode) return;
    const newSteam = prompt('Введите ссылку на Steam:', tempSteam === '-' ? '' : tempSteam);
    if (newSteam) {
        tempSteam = newSteam;
        document.getElementById('steamDisplay').textContent = newSteam;
    }
}

function editFaceitLink() {
    if (!editMode) return;
    const newLink = prompt('Введите ссылку на Faceit:', tempFaceitLink === '-' ? '' : tempFaceitLink);
    if (newLink !== null) {
        tempFaceitLink = newLink || '-';
        document.getElementById('faceitLinkDisplay').textContent = tempFaceitLink;
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
// ============================================
function initProfile() {
    if (savedName === '-') {
        savedName = generateRandomName();
        tempName = savedName;
    }
    if (typeof loadSavedValues === 'function') loadSavedValues();
}

// ============================================
// ФУНКЦИИ ДЛЯ ВОЗРАСТА В РЕЖИМАХ
// ============================================
function editFaceitAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        document.getElementById('faceitAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPremierAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        document.getElementById('premierAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPrimeAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        document.getElementById('primeAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPublicAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        document.getElementById('publicAgeValue').textContent = newAge;
        tempAge = newAge;
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
    
    // Теперь можно скрыть верхний логотип
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

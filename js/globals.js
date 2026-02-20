// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

// Состояние приложения
let lastModeScreen = 'faceitScreen';
let editMode = false;
let currentUserId = 'pingster_' + Date.now();

// Временные данные (редактирование)
let tempName = '-';
let tempAvatar = '👤';
let tempAge = '-';
let tempSteam = '-';
let tempFaceitLink = '-';

// Сохраненные данные
let savedName = '-';
let savedAvatar = '👤';
let savedAge = '-';
let savedSteam = '-';
let savedFaceitLink = '-';
let savedCoins = 99999;  // Стартовое значение для новых пользователей
let savedOwnedNicks = [];
let savedOwnedFrames = [];

// Игровые данные - ИСПРАВЛЕНО
let coins = 99999;  // Теперь совпадает с savedCoins
let ownedNicks = [];
let ownedFrames = [];
let friendsData = [];
let isSearchMode = false;
let searchQuery = '';

// Данные магазина
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

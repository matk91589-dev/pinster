// ============================================
// ГЛОБАЛЬНЫЕ ДАННЫЕ
// ============================================

const GlobalData = {
    // Данные пользователя
    user: {
        id: 'pingster_' + Date.now(),
        name: '-',
        avatar: '👤',
        age: '',
        steam: '',
        faceit: '',
        coins: 99999,
        ownedNicks: [],
        ownedFrames: []
    },
    
    // Временные данные для редактирования
    temp: {
        name: '-',
        avatar: '👤',
        age: '',
        steam: '',
        faceit: ''
    },
    
    // Состояние
    lastModeScreen: 'faceitScreen',
    isSearchMode: false,
    searchQuery: '',
    friends: [],
    
    // Данные магазина
    nicks: [
        { id: 'red', name: 'Красный', class: 'red', price: 50 },
        { id: 'green', name: 'Зеленый', class: 'green', price: 50 },
        { id: 'blue', name: 'Синий', class: 'blue', price: 50 },
        { id: 'purple', name: 'Фиолетовый', class: 'purple', price: 100 },
        { id: 'orange', name: 'Оранжевый', class: 'orange', price: 100 },
        { id: 'multicolor', name: 'Мультицвет', class: 'multicolor', price: 200 }
    ],
    
    frames: [
        { id: 'red', name: 'Красная рамка', class: 'frame-red', price: 100 },
        { id: 'gold', name: 'Золотая рамка', class: 'frame-gold', price: 150 },
        { id: 'blue', name: 'Синяя рамка', class: 'frame-blue', price: 100 },
        { id: 'green', name: 'Зеленая рамка', class: 'frame-green', price: 100 },
        { id: 'purple', name: 'Фиолетовая рамка', class: 'frame-purple', price: 200 },
        { id: 'rainbow', name: 'Радужная рамка', class: 'frame-rainbow', price: 300 }
    ],
    
    // Загрузка из localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('pingster_user');
            if (saved) {
                const data = JSON.parse(saved);
                this.user = { ...this.user, ...data };
                this.temp = { ...this.temp, ...data };
            }
        } catch (e) {
            console.log('Ошибка загрузки из localStorage:', e);
        }
    },
    
    // Сохранение в localStorage
    saveToStorage() {
        try {
            localStorage.setItem('pingster_user', JSON.stringify(this.user));
        } catch (e) {
            console.log('Ошибка сохранения в localStorage:', e);
        }
    }
};

// Инициализация
GlobalData.loadFromStorage();

window.GlobalData = GlobalData;

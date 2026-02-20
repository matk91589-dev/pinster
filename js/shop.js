// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Массив для новых предметов (только что выбитых)
let newItems = [];

// Данные кейсов
const cases = [
    { 
        id: 'common_case', 
        name: 'COMMON CASE', 
        description: '', 
        price: 1000, 
        class: 'common-case',
        icon: `<img src="cases/common_case.png" class="case-image">`,
        items: [
            // Ники
            { type: 'nick', id: 'red', name: 'Красный ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'green', name: 'Зеленый ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'blue', name: 'Синий ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'purple', name: 'Фиолетовый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'orange', name: 'Оранжевый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'multicolor', name: 'Радужный ник', icon: '🌈', rarity: 'epic', rarityName: 'Epic' },
            
            // Рамки
            { type: 'frame', id: 'red', name: 'Красная рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'blue', name: 'Синяя рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'green', name: 'Зеленая рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'gold', name: 'Золотая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'purple', name: 'Фиолетовая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'rainbow', name: 'Радужная рамка', icon: '🖼️', rarity: 'legendary', rarityName: 'Legendary' },
            
            // Скины CS:GO
            { type: 'skin', name: 'AK-47 | Redline', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { type: 'skin', name: 'AWP | Dragon Lore', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: '★ Karambit | Fade', icon: '🔪', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: 'M4A4 | Howl', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: 'Desert Eagle | Blaze', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { type: 'skin', name: '★ Glove Case', icon: '🧤', rarity: 'epic', rarityName: 'Epic' }
        ]
    },
    { 
        id: 'rare_case', 
        name: 'RARE CASE', 
        description: '', 
        price: 2500, 
        class: 'rare-case',
        icon: `<img src="cases/rare_case.png" class="case-image">`,
        items: [
            // Ники (больше редких)
            { type: 'nick', id: 'purple', name: 'Фиолетовый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'orange', name: 'Оранжевый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'multicolor', name: 'Радужный ник', icon: '🌈', rarity: 'epic', rarityName: 'Epic' },
            
            // Рамки (больше редких)
            { type: 'frame', id: 'gold', name: 'Золотая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'purple', name: 'Фиолетовая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'rainbow', name: 'Радужная рамка', icon: '🖼️', rarity: 'legendary', rarityName: 'Legendary' },
            
            // Скины CS:GO (редкие)
            { type: 'skin', name: 'AK-47 | Redline', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { type: 'skin', name: 'AWP | Dragon Lore', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: '★ Karambit | Fade', icon: '🔪', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: 'M4A4 | Howl', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' }
        ]
    },
    { 
        id: 'premium_case', 
        name: 'PREMIUM CASE', 
        description: '', 
        price: 5000, 
        class: 'premium-case',
        icon: `<img src="cases/premium_case.png" class="case-image">`,
        items: [
            // Ники (только эпик и легендарные)
            { type: 'nick', id: 'multicolor', name: 'Радужный ник', icon: '🌈', rarity: 'epic', rarityName: 'Epic' },
            
            // Рамки (только легендарные)
            { type: 'frame', id: 'rainbow', name: 'Радужная рамка', icon: '🖼️', rarity: 'legendary', rarityName: 'Legendary' },
            
            // Скины CS:GO (легендарные)
            { type: 'skin', name: 'AWP | Dragon Lore', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: '★ Karambit | Fade', icon: '🔪', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: 'M4A4 | Howl', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: '★ Glove Case', icon: '🧤', rarity: 'epic', rarityName: 'Epic' },
            { type: 'skin', name: '★ Butterfly Knife', icon: '🔪', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'skin', name: 'AK-47 | Fire Serpent', icon: '🔫', rarity: 'legendary', rarityName: 'Legendary' }
        ]
    }
];

// Состояние открытия кейса
let currentCase = null;
let isOpening = false;
let caseReady = false; // Кейс готов к открытию

// Функция обновления счетчика инвентаря
function updateInventoryCounter() {
    const counter = document.getElementById('inventoryCounter');
    const totalItems = ownedNicks.length + ownedFrames.length;
    
    if (counter) {
        if (totalItems > 0) {
            counter.style.display = 'flex';
            counter.textContent = totalItems;
        } else {
            counter.style.display = 'none';
        }
    }
}

// Добавление предмета в список новых
function addNewItem(item) {
    // Создаем уникальный ключ для предмета
    const itemKey = `${item.type}_${item.id}`;
    
    // Проверяем, нет ли уже такого предмета в новых
    const exists = newItems.some(existing => 
        existing.type === item.type && existing.id === item.id
    );
    
    if (!exists) {
        newItems.push({
            type: item.type,
            id: item.id,
            timestamp: Date.now()
        });
    }
    
    // Очищаем старые новые предметы (через 30 секунд)
    setTimeout(() => {
        newItems = newItems.filter(i => 
            !(i.type === item.type && i.id === item.id)
        );
        if (currentShopTab === 'inventory') {
            renderInventory();
        }
    }, 30000);
}

function showShopTab(tab) {
    currentShopTab = tab;
    
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.shop-tab[onclick="showShopTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'cases') {
        document.querySelector('.cases-section').classList.remove('hidden');
        document.querySelector('.inventory-section').classList.add('hidden');
        renderCasesShop();
    } else {
        document.querySelector('.cases-section').classList.add('hidden');
        document.querySelector('.inventory-section').classList.remove('hidden');
        renderInventory();
    }
}

function renderShop() {
    renderCasesShop();
    renderInventory();
    updateInventoryCounter();
}

function renderCasesShop() {
    const container = document.querySelector('.cases-grid');
    if (!container) return;
    
    container.innerHTML = cases.map(caseItem => {
        const canAfford = coins >= caseItem.price;
        return `
            <div class="case-item ${caseItem.class}" onclick="openCase('${caseItem.id}')">
                <div class="case-icon">
                    ${caseItem.icon}
                </div>
                <div class="case-info">
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-price-row">
                        <span class="price-value">${caseItem.price}</span>
                        <button class="buy-btn-simple ${!canAfford ? 'disabled' : ''}" 
                                onclick="event.stopPropagation(); buyCase('${caseItem.id}')">
                            КУПИТЬ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderInventory() {
    const container = document.querySelector('.inventory-grid');
    if (!container) return;
    
    const ownedItems = [];
    
    ownedNicks.forEach(nickId => {
        const nick = nicks.find(n => n.id === nickId);
        if (nick) {
            const isNew = newItems.some(item => item.type === 'nick' && item.id === nick.id);
            ownedItems.push({
                type: 'nick',
                id: nick.id,
                name: nick.name,
                icon: '🎨',
                class: nick.class,
                isNew: isNew
            });
        }
    });
    
    ownedFrames.forEach(frameId => {
        const frame = frames.find(f => f.id === frameId);
        if (frame) {
            const isNew = newItems.some(item => item.type === 'frame' && item.id === frame.id);
            ownedItems.push({
                type: 'frame',
                id: frame.id,
                name: frame.name,
                icon: '🖼️',
                class: frame.class,
                isNew: isNew
            });
        }
    });
    
    if (ownedItems.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = ownedItems.map(item => `
        <div class="inventory-item ${item.isNew ? 'new-item' : ''}" onclick="useInventoryItem('${item.type}', '${item.id}')">
            ${item.isNew ? '<span class="item-badge">NEW</span>' : ''}
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
            </div>
            <button class="use-btn" onclick="event.stopPropagation(); useInventoryItem('${item.type}', '${item.id}')">
                Использовать
            </button>
        </div>
    `).join('');
}

function useInventoryItem(type, id) {
    if (type === 'nick') {
        if (!ownedNicks.includes(id)) return;
        
        document.getElementById('profileName').className = 'profile-name';
        
        const nick = nicks.find(n => n.id === id);
        if (nick) {
            document.getElementById('profileName').classList.add(nick.class);
            alert(`✅ Ник теперь ${nick.name}`);
        }
    } else if (type === 'frame') {
        if (!ownedFrames.includes(id)) return;
        
        const avatar = document.getElementById('profileAvatar');
        avatar.className = 'profile-avatar';
        
        const frame = frames.find(f => f.id === id);
        if (frame) {
            avatar.classList.add(frame.class);
            alert(`✅ Рамка ${frame.name} применена`);
        }
    }
}

function buyCase(caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;
    
    if (coins < caseItem.price) {
        alert('❌ Недостаточно Pingcoins!');
        return;
    }
    
    if (confirm(`Купить ${caseItem.name} за ${caseItem.price} PC?`)) {
        coins -= caseItem.price;
        document.getElementById('coinsAmount').textContent = coins;
        saveUserToDB();
        
        // Отправляем кейс в инвентарь (добавляем сам кейс как предмет)
        addCaseToInventory(caseItem);
        
        // Обновляем отображение
        if (currentShopTab === 'inventory') {
            renderInventory();
        }
    }
}

// Функция добавления кейса в инвентарь
function addCaseToInventory(caseItem) {
    // Создаем предмет "кейс" для инвентаря
    const caseInventoryItem = {
        type: 'case',
        id: caseItem.id,
        name: caseItem.name,
        icon: '📦', // Иконка кейса
        class: caseItem.class
    };
    
    // Здесь можно добавить логику сохранения кейсов в отдельный массив
    // Пока просто показываем уведомление
    alert(`✅ ${caseItem.name} добавлен в инвентарь!`);
    
    // Обновляем счетчик инвентаря
    updateInventoryCounter();
}

function openCase(caseId) {
    if (isOpening) {
        alert('Кейс уже открывается!');
        return;
    }
    
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;
    
    currentCase = caseItem;
    isOpening = true;
    caseReady = false;
    
    // Определяем путь к картинке в зависимости от типа кейса
    let caseImagePath = '';
    switch(caseId) {
        case 'common_case':
            caseImagePath = 'cases/common_case.png';
            break;
        case 'rare_case':
            caseImagePath = 'cases/rare_case.png';
            break;
        case 'premium_case':
            caseImagePath = 'cases/premium_case.png';
            break;
        default:
            caseImagePath = 'cases/common_case.png';
    }
    
    // Показываем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'case-overlay';
    overlay.id = 'caseOverlay';
    overlay.innerHTML = `
        <div class="case-container" id="caseContainer">
            <div class="explosion-container">
                <img id="explosionFrame" src="${caseImagePath}?t=${Date.now()}" class="explosion-image">
            </div>
            <div class="result-popup" style="display: none;">
                <div class="result-title">ВЫБИТО</div>
                <div class="result-item" id="resultItem"></div>
                <div class="result-rarity" id="resultRarity"></div>
            </div>
            <button class="close-btn" onclick="closeCase()">Закрыть</button>
        </div>
        <div class="flash" id="flash"></div>
    `;
    
    document.body.appendChild(overlay);
    
    // Активируем оверлей
    setTimeout(() => {
        overlay.classList.add('active');
        startCaseFlyIn();
    }, 50);
}

// Анимация вылета кейса
function startCaseFlyIn() {
    const caseContainer = document.getElementById('caseContainer');
    
    console.log('Кейс вылетает...');
    
    // Добавляем класс для анимации вылета
    caseContainer.classList.add('case-fly');
    
    // После окончания анимации кейс готов к клику
    setTimeout(() => {
        caseReady = true;
        console.log('Кейс готов! Нажми на него');
        
        // Добавляем обработчик клика на контейнер
        if (caseContainer) {
            caseContainer.style.cursor = 'pointer';
            caseContainer.onclick = function(e) {
                e.stopPropagation();
                console.log('Клик по кейсу!');
                if (caseReady) {
                    openCaseClick();
                }
            };
        }
        
    }, 500);
}

// Открытие по клику
function openCaseClick() {
    if (!caseReady || !isOpening) return;
    
    console.log('Открываем кейс!');
    
    const explosionImg = document.getElementById('explosionFrame');
    const flash = document.getElementById('flash');
    const resultPopup = document.querySelector('.result-popup');
    const caseContainer = document.getElementById('caseContainer');
    
    // Убираем возможность повторного клика
    caseReady = false;
    if (caseContainer) {
        caseContainer.style.cursor = 'default';
        caseContainer.onclick = null;
    }
    
    // Вспышка
    flash.classList.add('active');
    
    setTimeout(() => {
        flash.classList.remove('active');
        
        // Выбираем случайный предмет
        const winningItem = currentCase.items[Math.floor(Math.random() * currentCase.items.length)];
        
        // Добавляем в инвентарь
        addItemToInventory(winningItem);
        
        // Показываем результат
        explosionImg.style.display = 'none';
        resultPopup.style.display = 'block';
        document.getElementById('resultItem').textContent = winningItem.name;
        document.getElementById('resultRarity').textContent = winningItem.rarityName;
        
    }, 200);
}

function addItemToInventory(item) {
    if (item.type === 'nick') {
        if (!ownedNicks.includes(item.id)) {
            ownedNicks.push(item.id);
            addNewItem(item); // Добавляем в новые
        }
    } else if (item.type === 'frame') {
        if (!ownedFrames.includes(item.id)) {
            ownedFrames.push(item.id);
            addNewItem(item); // Добавляем в новые
        }
    }
    
    saveUserToDB();
    updateInventoryCounter(); // Обновляем счетчик
    
    if (currentShopTab === 'inventory') {
        renderInventory();
    }
}

function closeCase() {
    const overlay = document.getElementById('caseOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    isOpening = false;
    currentCase = null;
    caseReady = false;
}

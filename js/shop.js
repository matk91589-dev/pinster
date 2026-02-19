// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Данные кейсов
const cases = [
    { 
        id: 'common_case', 
        name: 'COMMON CASE', 
        description: '', 
        price: 1000, 
        class: 'common-case',
        // 1 кадр - обычный ящик (для магазина)
        icon: `<img src="cases/common_cadr1.png" class="case-image">`,
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
    }
];

// Состояние открытия кейса
let currentCase = null;
let isOpening = false;

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
}

function renderCasesShop() {
    const container = document.querySelector('.cases-grid');
    if (!container) return;
    
    container.innerHTML = cases.map(caseItem => {
        const canAfford = coins >= caseItem.price;
        return `
            <div class="case-item" onclick="openCase('${caseItem.id}')">
                <div class="case-icon">${caseItem.icon}</div>
                <div class="case-info">
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-price-row">
                        <span class="price-value">${caseItem.price} Pingcoins</span>
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
            ownedItems.push({
                type: 'nick',
                id: nick.id,
                name: nick.name,
                icon: '🎨',
                class: nick.class
            });
        }
    });
    
    ownedFrames.forEach(frameId => {
        const frame = frames.find(f => f.id === frameId);
        if (frame) {
            ownedItems.push({
                type: 'frame',
                id: frame.id,
                name: frame.name,
                icon: '🖼️',
                class: frame.class
            });
        }
    });
    
    if (ownedItems.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = ownedItems.map(item => `
        <div class="inventory-item" onclick="useInventoryItem('${item.type}', '${item.id}')">
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
    
    if (confirm(`Купить ${caseItem.name} за ${caseItem.price} Pingcoins?`)) {
        coins -= caseItem.price;
        document.getElementById('coinsAmount').textContent = coins;
        saveUserToDB();
        
        // Открываем кейс после покупки
        setTimeout(() => openCase(caseId), 500);
    }
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
    
    // Показываем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'case-overlay';
    overlay.id = 'caseOverlay';
    overlay.innerHTML = `
        <div class="case-container">
            <div class="explosion-container">
                <img id="explosionFrame" src="cases/common_cadr1.png?t=${Date.now()}" class="explosion-image">
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
        startCaseOpening();
    }, 50);
}

// Новая простая анимация - вылет + вспышка
function startCaseOpening() {
    const caseContainer = document.querySelector('.case-container');
    const explosionImg = document.getElementById('explosionFrame');
    const flash = document.getElementById('flash');
    const resultPopup = document.querySelector('.result-popup');
    
    if (!explosionImg) return;
    
    console.log('Запуск анимации открытия');
    
    // Добавляем класс для анимации вылета
    caseContainer.classList.add('case-fly');
    
    // Ждем окончания анимации вылета
    setTimeout(() => {
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
            
            isOpening = false;
            
        }, 200); // Вспышка
    }, 600); // 600ms = длительность анимации вылета
}

function addItemToInventory(item) {
    if (item.type === 'nick') {
        if (!ownedNicks.includes(item.id)) {
            ownedNicks.push(item.id);
        }
    } else if (item.type === 'frame') {
        if (!ownedFrames.includes(item.id)) {
            ownedFrames.push(item.id);
        }
    }
    
    saveUserToDB();
    
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
}

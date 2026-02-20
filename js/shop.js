// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Массив для новых предметов (только что купленных)
let newItems = [];

// Массив для кейсов в инвентаре
let ownedCases = [];

// Данные кейсов
const cases = [
    { 
        id: 'common_case', 
        name: 'COMMON CASE', 
        description: '', 
        price: 1000, 
        class: 'common-case',
        icon: `<img src="cases/common_case.png" class="case-image">`,
        imagePath: 'cases/common_case.png',
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
        imagePath: 'cases/rare_case.png',
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
        imagePath: 'cases/premium_case.png',
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

// Состояние открытия кейса (пока не используется)
let currentCase = null;
let isOpening = false;
let caseReady = false;

// Проверка наличия новых предметов
function hasNewItems() {
    return newItems.length > 0;
}

// Обновление бейджа NEW на табе инвентаря
function updateInventoryBadge() {
    const inventoryTab = document.getElementById('inventoryTab');
    if (!inventoryTab) return;
    
    // Удаляем старый бейдж если есть
    const oldBadge = inventoryTab.querySelector('.new-badge');
    if (oldBadge) oldBadge.remove();
    
    // Если есть новые предметы - добавляем бейдж
    if (hasNewItems()) {
        const badge = document.createElement('span');
        badge.className = 'new-badge';
        badge.textContent = 'NEW';
        inventoryTab.appendChild(badge);
    }
}

// Добавление предмета в список новых
function addNewItem(item) {
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
    
    // Обновляем бейдж
    updateInventoryBadge();
    
    // Очищаем старые новые предметы (через 30 секунд)
    setTimeout(() => {
        newItems = newItems.filter(i => 
            !(i.type === item.type && i.id === item.id)
        );
        updateInventoryBadge();
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
}

function renderCasesShop() {
    const container = document.querySelector('.cases-grid');
    if (!container) return;
    
    container.innerHTML = cases.map(caseItem => {
        const canAfford = coins >= caseItem.price;
        return `
            <div class="case-item ${caseItem.class}">
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
    
    // Добавляем кейсы из инвентаря
    ownedCases.forEach(caseId => {
        const caseItem = cases.find(c => c.id === caseId);
        if (caseItem) {
            const isNew = newItems.some(item => item.type === 'case' && item.id === caseItem.id);
            ownedItems.push({
                type: 'case',
                id: caseItem.id,
                name: caseItem.name,
                imagePath: caseItem.imagePath,
                class: caseItem.class,
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
            <div class="item-icon">
                <img src="${item.imagePath}" style="width: 100px; height: 100px; object-fit: contain;">
            </div>
        </div>
    `).join('');
}

function useInventoryItem(type, id) {
    if (type === 'case') {
        alert(`✅ Здесь будет открытие кейса`);
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
        
        // Добавляем кейс в инвентарь
        ownedCases.push(caseItem.id);
        addNewItem({ type: 'case', id: caseItem.id });
        
        saveUserToDB();
        
        // Если открыт инвентарь - обновляем его
        if (currentShopTab === 'inventory') {
            renderInventory();
        }
        
        alert(`✅ ${caseItem.name} добавлен в инвентарь!`);
    }
}

function addItemToInventory(item) {
    // Заглушка для совместимости
}

function closeCase() {
    // Заглушка
}

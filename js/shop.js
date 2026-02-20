// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Массив для новых предметов (теперь хранит уникальные ID экземпляров)
let newItems = [];

// Массив для кейсов в инвентаре - теперь храним объекты с уникальными ID
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
            // ... твои предметы
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
            // ... твои предметы
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
            // ... твои предметы
        ]
    },
    { 
        id: 'secret_case', 
        name: 'SECRET CASE', 
        description: '', 
        price: 0,  // Цена 0, нельзя купить
        class: 'secret-case',
        icon: `<img src="cases/secret_case.png" class="case-image">`,
        imagePath: 'cases/secret_case.png',
        isSecret: true,  // Флаг для секретного кейса
        items: [
            // Можно добавить особые предметы для секретного кейса
            { type: 'nick', id: 'secret_nick', name: 'Секретный ник', icon: '👑', rarity: 'legendary', rarityName: 'Legendary' },
            { type: 'frame', id: 'secret_frame', name: 'Секретная рамка', icon: '👑', rarity: 'legendary', rarityName: 'Legendary' }
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
function addNewItem(caseId, uniqueId) {
    newItems.push(uniqueId);
    
    // Обновляем бейдж
    updateInventoryBadge();
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
        
        // Для секретного кейса показываем специальную надпись
        if (caseItem.isSecret) {
            return `
                <div class="case-item ${caseItem.class} secret-case">
                    <div class="case-icon">
                        ${caseItem.icon}
                    </div>
                    <div class="case-info">
                        <div class="case-name">${caseItem.name}</div>
                        <div class="secret-message">выполняйте задания →</div>
                    </div>
                </div>
            `;
        }
        
        // Для обычных кейсов
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

// Функция для отображения статистики инвентаря
function renderInventoryStats() {
    const inventorySection = document.querySelector('.inventory-section');
    if (!inventorySection) return;
    
    // Удаляем старую статистику если есть
    const oldStats = inventorySection.querySelector('.inventory-stats');
    if (oldStats) oldStats.remove();
    
    // Создаем блок статистики
    const statsDiv = document.createElement('div');
    statsDiv.className = 'inventory-stats';
    statsDiv.innerHTML = `Кол-во предметов: <span>${ownedCases.length}</span>`;
    
    // Вставляем в начало секции инвентаря (перед inventory-grid)
    const grid = inventorySection.querySelector('.inventory-grid');
    if (grid) {
        inventorySection.insertBefore(statsDiv, grid);
    } else {
        inventorySection.appendChild(statsDiv);
    }
}

function renderInventory() {
    const container = document.querySelector('.inventory-grid');
    if (!container) return;
    
    if (ownedCases.length === 0) {
        container.innerHTML = '';
        renderInventoryStats();
        return;
    }
    
    // Разделяем предметы на новые и старые
    const newCases = [];
    const oldCases = [];
    
    ownedCases.forEach(caseItem => {
        const isNew = newItems.includes(caseItem.uniqueId);
        if (isNew) {
            newCases.push(caseItem);
        } else {
            oldCases.push(caseItem);
        }
    });
    
    // Сортируем новые по дате покупки (сначала самые свежие)
    newCases.sort((a, b) => b.purchaseDate - a.purchaseDate);
    
    // Объединяем: сначала новые, потом старые
    const sortedCases = [...newCases, ...oldCases];
    
    container.innerHTML = sortedCases.map(caseItem => {
        const isNew = newItems.includes(caseItem.uniqueId);
        const caseData = cases.find(c => c.id === caseItem.caseId);
        
        return `
            <div class="inventory-item ${isNew ? 'new-item' : ''}" 
                 onclick="useInventoryItem('${caseItem.uniqueId}')">
                ${isNew ? '<span class="item-badge">NEW</span>' : ''}
                <div class="item-icon">
                    <img src="${caseData.imagePath}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
            </div>
        `;
    }).join('');
    
    // Обновляем статистику
    renderInventoryStats();
}

// Функция использования предмета из инвентаря
function useInventoryItem(uniqueId) {
    // Удаляем uniqueId из списка новых
    const newIndex = newItems.indexOf(uniqueId);
    if (newIndex !== -1) {
        newItems.splice(newIndex, 1);
    }
    
    // Обновляем бейдж на табе
    updateInventoryBadge();
    
    // Перерисовываем инвентарь
    renderInventory();
    
    alert(`✅ Здесь будет открытие кейса`);
}

function buyCase(caseId) {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;
    
    // Запрещаем покупку секретного кейса
    if (caseItem.isSecret) {
        alert('❌ Этот кейс нельзя купить! Выполняйте задания чтобы получить его.');
        return;
    }
    
    if (coins < caseItem.price) {
        alert('❌ Недостаточно Pingcoins!');
        return;
    }
    
    if (confirm(`Купить ${caseItem.name} за ${caseItem.price} PC?`)) {
        coins -= caseItem.price;
        document.getElementById('coinsAmount').textContent = coins;
        
        // Создаем уникальный ID для этого экземпляра кейса
        const uniqueId = `${caseId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Добавляем кейс в инвентарь с уникальным ID
        ownedCases.push({
            caseId: caseId,
            uniqueId: uniqueId,
            purchaseDate: Date.now()
        });
        
        // Добавляем уникальный ID в новые предметы
        addNewItem(caseId, uniqueId);
        
        saveUserToDB();
        
        // Обновляем статистику
        renderInventoryStats();
        
        // Если открыт инвентарь - обновляем его
        if (currentShopTab === 'inventory') {
            renderInventory();
        }
        
        alert(`✅ ${caseItem.name} добавлен в инвентарь!`);
    }
}

// Функция для добавления секретного кейса (вызывать из другого места)
function addSecretCase() {
    const caseId = 'secret_case';
    const caseItem = cases.find(c => c.id === caseId);
    
    // Создаем уникальный ID для этого экземпляра кейса
    const uniqueId = `${caseId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Добавляем кейс в инвентарь с уникальным ID
    ownedCases.push({
        caseId: caseId,
        uniqueId: uniqueId,
        purchaseDate: Date.now()
    });
    
    // Добавляем уникальный ID в новые предметы
    addNewItem(caseId, uniqueId);
    
    saveUserToDB();
    
    // Обновляем статистику
    renderInventoryStats();
    
    // Если открыт инвентарь - обновляем его
    if (currentShopTab === 'inventory') {
        renderInventory();
    }
    
    alert(`✅ ${caseItem.name} добавлен в инвентарь!`);
}

function addItemToInventory(item) {
    // Заглушка для совместимости
}

function closeCase() {
    // Заглушка
}

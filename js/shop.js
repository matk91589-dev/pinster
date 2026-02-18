// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Данные кейсов
const cases = [
    { 
        id: 'common_case', 
        name: 'Common Case', 
        description: 'Обычный кейс с базовыми предметами',
        price: 1000, 
        class: 'common-case',
        icon: `<svg viewBox="0 0 200 200" width="80" height="80">
            <!-- Основа кейса -->
            <rect x="20" y="50" width="160" height="100" rx="12" ry="12" fill="#8b7d7d" stroke="#5a4f4f" stroke-width="4"/>
            <!-- Верхняя крышка -->
            <rect x="20" y="40" width="160" height="20" rx="10" ry="10" fill="#a49b9b" stroke="#5a4f4f" stroke-width="3"/>
            <!-- Тень от крышки -->
            <rect x="22" y="42" width="156" height="2" fill="rgba(0,0,0,0.3)"/>
            <!-- Ручки и детали -->
            <circle cx="35" cy="100" r="6" fill="#555"/>
            <circle cx="165" cy="100" r="6" fill="#555"/>
            <!-- Символ Common (звезда) -->
            <polygon points="100,65 106,80 122,80 108,90 114,105 100,95 86,105 92,90 78,80 94,80" fill="#e0c07b" stroke="#cfa850" stroke-width="1"/>
            <!-- Слоты внутри кейса -->
            <g>
                <rect x="40" y="80" width="24" height="24" rx="4" ry="4" fill="#dcdcdc" stroke="#999" stroke-width="2"/>
                <rect x="70" y="80" width="24" height="24" rx="4" ry="4" fill="#dcdcdc" stroke="#999" stroke-width="2"/>
                <rect x="100" y="80" width="24" height="24" rx="4" ry="4" fill="#dcdcdc" stroke="#999" stroke-width="2"/>
                <rect x="130" y="80" width="24" height="24" rx="4" ry="4" fill="#dcdcdc" stroke="#999" stroke-width="2"/>
            </g>
            <!-- Бликующие элементы для эффекта металла -->
            <path d="M25 55 L175 55" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>
            <path d="M25 145 L175 145" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>
        </svg>`,
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
    
    // Обновляем активный таб
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.shop-tab[onclick="showShopTab('${tab}')"]`).classList.add('active');
    
    // Показываем нужную секцию
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
                            Купить
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
    
    // Собираем все предметы из инвентаря
    const ownedItems = [];
    
    // Добавляем ники
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
    
    // Добавляем рамки
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
        container.innerHTML = ''; // ПРОСТО НИЧЕГО НЕ ПОКАЗЫВАЕМ
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
    
    // Добавляем рамки
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
        container.innerHTML = `
            <div class="empty-inventory">
                <div class="empty-text">Инвентарь пуст</div>
                <div class="empty-subtext">Купите кейсы и открывайте их!</div>
            </div>
        `;
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

function getRarityFromPrice(price) {
    if (price <= 50) return 'common';
    if (price <= 100) return 'rare';
    if (price <= 200) return 'epic';
    return 'legendary';
}

function useInventoryItem(type, id) {
    if (type === 'nick') {
        // Применяем цвет ника
        if (!ownedNicks.includes(id)) return;
        
        // Убираем старые классы
        document.getElementById('profileName').className = 'profile-name';
        
        // Добавляем новый класс
        const nick = nicks.find(n => n.id === id);
        if (nick) {
            document.getElementById('profileName').classList.add(nick.class);
            alert(`✅ Ник теперь ${nick.name}`);
        }
    } else if (type === 'frame') {
        // Применяем рамку
        if (!ownedFrames.includes(id)) return;
        
        // Убираем старые классы рамок
        const avatar = document.getElementById('profileAvatar');
        avatar.className = 'profile-avatar';
        
        // Добавляем новую рамку
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
            <div class="case-header">${caseItem.name}</div>
            <div class="roulette-wrapper">
                <div class="marker"></div>
                <div class="roulette-track" id="rouletteTrack"></div>
            </div>
            <div class="result-popup" style="display: none;">
                <div class="result-title">Вам выпало:</div>
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
        generateCaseSlots(caseItem);
        setTimeout(() => startCaseSpin(), 500);
    }, 50);
}

function generateCaseSlots(caseItem) {
    const track = document.getElementById('rouletteTrack');
    if (!track) return;
    
    track.innerHTML = '';
    
    // Создаем много слотов для прокрутки
    for (let i = 0; i < 50; i++) {
        const item = caseItem.items[Math.floor(Math.random() * caseItem.items.length)];
        const slot = document.createElement('div');
        slot.className = 'item-slot';
        slot.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity rarity-${item.rarity}">${item.rarityName}</div>
        `;
        track.appendChild(slot);
    }
}

function startCaseSpin() {
    if (!currentCase) return;
    
    const track = document.getElementById('rouletteTrack');
    const flash = document.getElementById('flash');
    const resultPopup = document.querySelector('.result-popup');
    
    if (!track || !flash || !resultPopup) return;
    
    const slotWidth = 130;
    const totalSlots = track.children.length;
    
    // Выбираем случайный выигрышный предмет
    const winningItem = currentCase.items[Math.floor(Math.random() * currentCase.items.length)];
    
    // Выбираем слот, на котором остановимся
    const winningSlotIndex = Math.floor(totalSlots / 2) + Math.floor(Math.random() * 10) - 5;
    
    // Считаем смещение
    const wrapperWidth = 600;
    const centerOffset = wrapperWidth / 2 - slotWidth / 2;
    const offset = (winningSlotIndex * slotWidth) - centerOffset;
    
    // Анимация открытия
    document.querySelector('.case-container').classList.add('case-opening');
    
    setTimeout(() => {
        document.querySelector('.case-container').classList.remove('case-opening');
        
        // Вспышка
        flash.classList.add('active');
        
        setTimeout(() => {
            flash.classList.remove('active');
            
            // Прокрутка
            track.style.transition = 'none';
            track.style.transform = 'translateX(0px)';
            
            setTimeout(() => {
                track.style.transition = 'transform 4s cubic-bezier(0.08, 0.6, 0.1, 1)';
                track.style.transform = `translateX(-${offset}px)`;
                
                // Подсвечиваем выигрышный слот после остановки
                setTimeout(() => {
                    Array.from(track.children).forEach((slot, index) => {
                        slot.classList.remove('win');
                        if (index === winningSlotIndex) {
                            slot.classList.add('win');
                        }
                    });
                    
                    // Добавляем предмет в инвентарь
                    addItemToInventory(winningItem);
                    
                    // Показываем результат
                    resultPopup.style.display = 'block';
                    document.getElementById('resultItem').textContent = winningItem.name;
                    document.getElementById('resultRarity').textContent = winningItem.rarityName;
                    
                    isOpening = false;
                    
                }, 4000);
                
            }, 50);
            
        }, 100);
        
    }, 500);
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
    
    // Если открыт инвентарь - обновляем его
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


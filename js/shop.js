// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases'; // 'cases' или 'inventory'

// Данные для ников и рамок (если нет в globals.js)
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

const cases = [
    { 
        id: 'common_case', 
        name: 'Common Case', 
        description: '', 
        price: 1000, 
        class: 'common-case',
        icon: `<svg viewBox="0 0 200 200" width="100" height="90">
            <defs>
                <linearGradient id="rustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7a4a3c"/>
                    <stop offset="50%" stop-color="#9e6b52"/>
                    <stop offset="100%" stop-color="#5c3f33"/>
                </linearGradient>
                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4a4a4a"/>
                    <stop offset="50%" stop-color="#2f2f2f"/>
                    <stop offset="100%" stop-color="#1a1a1a"/>
                </linearGradient>
                <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
                    <stop offset="50%" stop-color="rgba(255,255,255,0.05)"/>
                    <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
                </linearGradient>
            </defs>
            <polygon points="30,80 170,80 160,150 40,150" fill="url(#rustGrad)" stroke="#222" stroke-width="3"/>
            <polygon points="30,80 100,40 170,80" fill="url(#metalGrad)" stroke="#111" stroke-width="3"/>
            <path d="M35,85 L165,85" stroke="url(#shine)" stroke-width="3"/>
            <rect x="90" y="100" width="20" height="30" rx="3" ry="3" fill="#222" stroke="#000" stroke-width="2"/>
            <circle cx="100" cy="115" r="4" fill="#555"/>
            <circle cx="40" cy="90" r="4" fill="#666"/>
            <circle cx="160" cy="90" r="4" fill="#666"/>
            <circle cx="35" cy="140" r="3" fill="#555"/>
            <circle cx="165" cy="140" r="3" fill="#555"/>
            <g>
                <rect x="50" y="110" width="24" height="24" rx="4" ry="4" fill="#aaa" stroke="#777" stroke-width="2"/>
                <rect x="80" y="110" width="24" height="24" rx="4" ry="4" fill="#bbb" stroke="#888" stroke-width="2"/>
                <rect x="110" y="110" width="24" height="24" rx="4" ry="4" fill="#ccc" stroke="#999" stroke-width="2"/>
            </g>
        </svg>`,
        items: [
            { type: 'nick', id: 'red', name: 'Красный ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'green', name: 'Зеленый ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'blue', name: 'Синий ник', icon: '🎨', rarity: 'common', rarityName: 'Common' },
            { type: 'nick', id: 'purple', name: 'Фиолетовый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'orange', name: 'Оранжевый ник', icon: '🎨', rarity: 'rare', rarityName: 'Rare' },
            { type: 'nick', id: 'multicolor', name: 'Радужный ник', icon: '🌈', rarity: 'epic', rarityName: 'Epic' },
            { type: 'frame', id: 'red', name: 'Красная рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'blue', name: 'Синяя рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'green', name: 'Зеленая рамка', icon: '🖼️', rarity: 'common', rarityName: 'Common' },
            { type: 'frame', id: 'gold', name: 'Золотая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'purple', name: 'Фиолетовая рамка', icon: '🖼️', rarity: 'rare', rarityName: 'Rare' },
            { type: 'frame', id: 'rainbow', name: 'Радужная рамка', icon: '🖼️', rarity: 'legendary', rarityName: 'Legendary' },
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

function getRarityFromPrice(price) {
    if (price <= 50) return 'common';
    if (price <= 100) return 'rare';
    if (price <= 200) return 'epic';
    return 'legendary';
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
    
    const winningItem = currentCase.items[Math.floor(Math.random() * currentCase.items.length)];
    const winningSlotIndex = Math.floor(totalSlots / 2) + Math.floor(Math.random() * 10) - 5;
    
    const wrapperWidth = 600;
    const centerOffset = wrapperWidth / 2 - slotWidth / 2;
    const offset = (winningSlotIndex * slotWidth) - centerOffset;
    
    document.querySelector('.case-container').classList.add('case-opening');
    
    setTimeout(() => {
        document.querySelector('.case-container').classList.remove('case-opening');
        
        flash.classList.add('active');
        
        setTimeout(() => {
            flash.classList.remove('active');
            
            track.style.transition = 'none';
            track.style.transform = 'translateX(0px)';
            
            setTimeout(() => {
                track.style.transition = 'transform 4s cubic-bezier(0.08, 0.6, 0.1, 1)';
                track.style.transform = `translateX(-${offset}px)`;
                
                setTimeout(() => {
                    Array.from(track.children).forEach((slot, index) => {
                        slot.classList.remove('win');
                        if (index === winningSlotIndex) {
                            slot.classList.add('win');
                        }
                    });
                    
                    addItemToInventory(winningItem);
                    
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

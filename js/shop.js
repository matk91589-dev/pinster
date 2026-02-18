// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'cases';

// Данные кейсов
const cases = [
    { 
        id: 'common_case', 
        name: 'Common Case', 
        description: 'Обычный кейс с базовыми предметами',
        price: 1000, 
        class: 'common-case',
        icon: '📦',
        items: [
            { name: 'P250 | Sand Dune', icon: '🔫', rarity: 'common', rarityName: 'Common' },
            { name: 'Five-SeveN | Forest Night', icon: '🔫', rarity: 'common', rarityName: 'Common' },
            { name: 'MP9 | Storm', icon: '🔫', rarity: 'common', rarityName: 'Common' },
            { name: 'Glock-18 | Night', icon: '🔫', rarity: 'common', rarityName: 'Common' },
            { name: 'USP-S | Forest Leaves', icon: '🔫', rarity: 'common', rarityName: 'Common' },
            { name: 'AWP | Safari Mesh', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { name: 'AK-47 | Elite Build', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { name: 'M4A4 | Faded Zebra', icon: '🔫', rarity: 'rare', rarityName: 'Rare' },
            { name: 'SSG 08 | Abyss', icon: '🔫', rarity: 'epic', rarityName: 'Epic' },
            { name: 'Desert Eagle | Corinthian', icon: '🔫', rarity: 'epic', rarityName: 'Epic' },
            { name: '★ Gut Knife | Scorched', icon: '🔪', rarity: 'legendary', rarityName: 'Legendary' },
            { name: '★ Glove Case', icon: '🧤', rarity: 'legendary', rarityName: 'Legendary' }
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
    document.querySelector('.nicks-section').classList.add('hidden');
    document.querySelector('.frames-section').classList.add('hidden');
    document.querySelector('.cases-section').classList.add('hidden');
    
    document.querySelector(`.${tab}-section`).classList.remove('hidden');
}

function renderShop() {
    renderNicksShop();
    renderFramesShop();
    renderCasesShop();
}

function renderNicksShop() {
    const container = document.querySelector('.nicks-grid');
    if (!container) return;
    
    container.innerHTML = nicks.map(nick => {
        const isOwned = ownedNicks.includes(nick.id);
        return `
            <div class="nick-item" onclick="${isOwned ? '' : `buyItem('nick', '${nick.id}')`}">
                <div class="nick-preview ${nick.class}">Ник</div>
                <div class="item-info">
                    <div class="item-name">${nick.name}</div>
                    <div class="item-price">${nick.price} Pingcoins</div>
                </div>
                ${isOwned ? '<span class="owned-badge">Куплено</span>' : ''}
            </div>
        `;
    }).join('');
}

function renderFramesShop() {
    const container = document.querySelector('.frames-grid');
    if (!container) return;
    
    container.innerHTML = frames.map(frame => {
        const isOwned = ownedFrames.includes(frame.id);
        return `
            <div class="frame-item" onclick="${isOwned ? '' : `buyItem('frame', '${frame.id}')`}">
                <div class="frame-preview ${frame.class}">👤</div>
                <div class="item-info">
                    <div class="item-name">${frame.name}</div>
                    <div class="item-price">${frame.price} Pingcoins</div>
                </div>
                ${isOwned ? '<span class="owned-badge">Куплено</span>' : ''}
            </div>
        `;
    }).join('');
}

function renderCasesShop() {
    const container = document.querySelector('.cases-grid');
    if (!container) return;
    
    container.innerHTML = cases.map(caseItem => {
        const canAfford = coins >= caseItem.price;
        return `
            <div class="case-item ${caseItem.class}" onclick="openCase('${caseItem.id}')">
                <div class="case-icon">${caseItem.icon}</div>
                <div class="case-info">
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-description">${caseItem.description}</div>
                    <div class="case-price">
                        <span class="price-value">${caseItem.price} Pingcoins</span>
                        <button class="buy-btn ${!canAfford ? 'disabled' : ''}" 
                                onclick="event.stopPropagation(); buyCase('${caseItem.id}')">
                            Купить
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
    
    const slotWidth = 130; // 120 + 10 margin
    const totalSlots = track.children.length;
    
    // Выбираем случайный выигрышный предмет
    const winningItem = currentCase.items[Math.floor(Math.random() * currentCase.items.length)];
    
    // Выбираем слот, на котором остановимся (ближе к середине)
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
                    
                    // Показываем результат
                    resultPopup.style.display = 'block';
                    document.getElementById('resultItem').textContent = winningItem.name;
                    document.getElementById('resultRarity').textContent = winningItem.rarityName;
                    
                    // Добавляем предмет в инвентарь (для примера)
                    alert(`🎉 Поздравляем! Вы выиграли: ${winningItem.name} (${winningItem.rarityName})`);
                    
                    isOpening = false;
                    
                }, 4000); // Ждем окончания анимации
                
            }, 50);
            
        }, 100);
        
    }, 500);
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

function buyItem(type, id) {
    const items = type === 'nick' ? nicks : frames;
    const item = items.find(i => i.id === id);
    const owned = type === 'nick' ? ownedNicks : ownedFrames;
    
    if (!item) return;
    
    if (coins < item.price) {
        alert('❌ Недостаточно Pingcoins!');
        return;
    }
    
    if (owned.includes(id)) {
        alert('❌ Этот предмет уже куплен!');
        return;
    }
    
    if (confirm(`Купить ${item.name} за ${item.price} Pingcoins?`)) {
        coins -= item.price;
        
        if (type === 'nick') {
            ownedNicks.push(id);
        } else {
            ownedFrames.push(id);
        }
        
        document.getElementById('coinsAmount').textContent = coins;
        saveUserToDB();
        renderShop();
        loadSavedValues();
        
        alert(`✅ ${item.name} успешно куплен!`);
    }
}

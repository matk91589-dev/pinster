// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================

let currentShopTab = 'nicks';

function showShopTab(tab) {
    currentShopTab = tab;
    
    // Обновляем активный таб
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.shop-tab[onclick="showShopTab('${tab}')"]`).classList.add('active');
    
    // Показываем нужную секцию
    document.querySelector('.nicks-section').classList.toggle('hidden', tab !== 'nicks');
    document.querySelector('.frames-section').classList.toggle('hidden', tab !== 'frames');
}

function renderShop() {
    renderNicksShop();
    renderFramesShop();
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
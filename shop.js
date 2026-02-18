// ============================================
// ФУНКЦИИ МАГАЗИНА
// ============================================
function renderShop() {
    const nicksGrid = document.getElementById('nicksGrid');
    const framesGrid = document.getElementById('framesGrid');
    const coinsSpan = document.getElementById('coinsAmount');
    
    if (nicksGrid) {
        nicksGrid.innerHTML = nicks.map(nick => {
            const owned = ownedNicks.includes(nick.id);
            return `
                <div class="shop-item">
                    <div class="item-info">
                        <div class="color-dot ${nick.class}"></div>
                        <span class="item-name">${nick.name}</span>
                    </div>
                    <div class="item-right">
                        <span class="price-value">${nick.price}</span>
                        <button class="buy-btn ${owned ? 'owned' : ''}" 
                                onclick="buyNick('${nick.id}')"
                                ${owned ? 'disabled' : ''}>
                            ${owned ? 'Куплено' : 'Купить'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (framesGrid) {
        framesGrid.innerHTML = frames.map(frame => {
            const owned = ownedFrames.includes(frame.id);
            return `
                <div class="shop-item">
                    <div class="item-info">
                        <div class="frame-dot ${frame.class}"></div>
                        <span class="item-name">${frame.name}</span>
                    </div>
                    <div class="item-right">
                        <span class="price-value">${frame.price}</span>
                        <button class="buy-btn ${owned ? 'owned' : ''}" 
                                onclick="buyFrame('${frame.id}')"
                                ${owned ? 'disabled' : ''}>
                            ${owned ? 'Куплено' : 'Купить'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (coinsSpan) coinsSpan.textContent = coins;
}

function buyNick(nickId) {
    const nick = nicks.find(n => n.id === nickId);
    if (!nick) return;
    
    if (ownedNicks.includes(nickId)) {
        alert('У вас уже есть этот ник!');
        return;
    }
    
    if (coins >= nick.price) {
        coins -= nick.price;
        ownedNicks.push(nickId);
        
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.className = 'profile-name';
            profileName.classList.add(nick.class);
        }
        
        renderShop();
        if (typeof saveUserToDB === 'function') saveUserToDB();
        alert(`Вы купили ${nick.name} ник!`);
    } else {
        alert('Недостаточно Pingcoins!');
    }
}

function buyFrame(frameId) {
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;
    
    if (ownedFrames.includes(frameId)) {
        alert('У вас уже есть эта рамка!');
        return;
    }
    
    if (coins >= frame.price) {
        coins -= frame.price;
        ownedFrames.push(frameId);
        
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.className = 'profile-avatar';
            profileAvatar.classList.add(frame.class);
        }
        
        renderShop();
        if (typeof saveUserToDB === 'function') saveUserToDB();
        alert(`Вы купили ${frame.name}!`);
    } else {
        alert('Недостаточно Pingcoins!');
    }
}

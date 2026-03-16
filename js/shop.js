// ============================================
// МАГАЗИН (Telegram Mini App версия) - СО ЗВУКАМИ
// ============================================

const Shop = {
    coins: 99999,
    currentTab: 'cases',
    ownedCases: [],
    newItems: [],
    processingIds: new Set(),
    
    cases: [
        { 
            id: 'common_case', 
            name: 'COMMON CASE',
            price: 1000,
            class: 'common-case',
            imagePath: 'cases/common_case.png',
            isSecret: false
        },
        { 
            id: 'rare_case', 
            name: 'RARE CASE',
            price: 2500,
            class: 'rare-case',
            imagePath: 'cases/rare_case.png',
            isSecret: false
        },
        { 
            id: 'premium_case', 
            name: 'PREMIUM CASE',
            price: 5000,
            class: 'premium-case',
            imagePath: 'cases/premium_case.png',
            isSecret: false
        },
        { 
            id: 'secret_case', 
            name: 'SECRET CASE',
            price: 0,
            class: 'secret-case',
            imagePath: 'cases/secret_case.png',
            isSecret: true
        }
    ],
    
    init() {
        this.updateCoinsDisplay();
        this.renderShop();
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
        }
        
        this.clickHandler = (e) => {
            const buyBtn = e.target.closest('.buy-btn-simple');
            if (buyBtn && !buyBtn.classList.contains('disabled')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const caseId = buyBtn.dataset.caseId;
                if (caseId) {
                    this.buyCase(caseId);
                }
                return false;
            }
            
            const inventoryItem = e.target.closest('.inventory-item');
            if (inventoryItem) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const uniqueId = inventoryItem.dataset.uniqueId;
                if (uniqueId) {
                    this.useItem(uniqueId);
                }
                return false;
            }
        };
        
        document.addEventListener('click', this.clickHandler);
    },
    
    updateCoinsDisplay() {
        const coinsEl = document.getElementById('coinsAmount');
        if (coinsEl) coinsEl.textContent = this.coins;
    },
    
    hasNewItems() {
        return this.newItems.length > 0;
    },
    
    updateInventoryBadge() {
        const inventoryTab = document.getElementById('inventoryTab');
        if (!inventoryTab) return;
        
        const oldBadge = inventoryTab.querySelector('.new-badge');
        if (oldBadge) oldBadge.remove();
        
        if (this.hasNewItems()) {
            const badge = document.createElement('span');
            badge.className = 'new-badge';
            badge.textContent = 'NEW';
            inventoryTab.appendChild(badge);
            
            // 👇 ЗВУК ПРИ НОВОМ ПРЕДМЕТЕ
            if (window.Settings) Settings.success();
            App.hapticFeedback('light');
        }
    },
    
    showTab(tab) {
        // 👇 ЗВУК ПРИ ПЕРЕКЛЮЧЕНИИ ВКЛАДОК
        if (window.Settings) Settings.click();
        
        this.currentTab = tab;
        
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.shop-tab[onclick="Shop.showTab('${tab}')"]`);
        if (activeTab) activeTab.classList.add('active');
        
        if (tab === 'cases') {
            document.querySelector('.cases-section')?.classList.remove('hidden');
            document.querySelector('.inventory-section')?.classList.add('hidden');
            this.renderCases();
        } else {
            document.querySelector('.cases-section')?.classList.add('hidden');
            document.querySelector('.inventory-section')?.classList.remove('hidden');
            this.renderInventory();
        }
        
        App.hapticFeedback('light');
    },
    
    renderShop() {
        this.renderCases();
        this.renderInventory();
    },
    
    renderCases() {
        const container = document.querySelector('.cases-grid');
        if (!container) return;
        
        container.innerHTML = this.cases.map(caseItem => {
            const canAfford = this.coins >= caseItem.price;
            
            if (caseItem.isSecret) {
                return `
                    <div class="case-item ${caseItem.class} secret-case">
                        <div class="case-icon"><img src="${caseItem.imagePath}" alt="${caseItem.name}"></div>
                        <div class="case-info">
                            <div class="case-name">${caseItem.name}</div>
                            <div class="secret-message">выполняйте задания →</div>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="case-item ${caseItem.class}">
                    <div class="case-icon"><img src="${caseItem.imagePath}" alt="${caseItem.name}"></div>
                    <div class="case-info">
                        <div class="case-name">${caseItem.name}</div>
                        <div class="case-price-row">
                            <span class="price-value">${caseItem.price}</span>
                            <button class="buy-btn-simple ${!canAfford ? 'disabled' : ''}" 
                                    data-case-id="${caseItem.id}">
                                Купить
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderInventory() {
        const container = document.querySelector('.inventory-grid');
        if (!container) return;
        
        if (this.ownedCases.length === 0) {
            container.innerHTML = '';
            this.renderInventoryStats();
            return;
        }
        
        // СОРТИРУЕМ: сначала новые, потом старые, внутри каждой группы по дате (сначала свежие)
        const sortedCases = [...this.ownedCases].sort((a, b) => {
            const aIsNew = this.newItems.includes(a.uniqueId);
            const bIsNew = this.newItems.includes(b.uniqueId);
            
            if (aIsNew && !bIsNew) return -1;
            if (!aIsNew && bIsNew) return 1;
            
            return b.purchaseDate - a.purchaseDate;
        });
        
        container.innerHTML = sortedCases.map(caseItem => {
            const isNew = this.newItems.includes(caseItem.uniqueId);
            const caseData = this.cases.find(c => c.id === caseItem.caseId);
            
            return `
                <div class="inventory-item ${isNew ? 'new-item' : ''}" 
                     data-unique-id="${caseItem.uniqueId}">
                    ${isNew ? '<span class="item-badge">NEW</span>' : ''}
                    <div class="item-icon">
                        <img src="${caseData?.imagePath || 'cases/common_case.png'}" alt="case">
                    </div>
                </div>
            `;
        }).join('');
        
        this.renderInventoryStats();
    },
    
    renderInventoryStats() {
        const inventorySection = document.querySelector('.inventory-section');
        if (!inventorySection) return;
        
        const oldStats = inventorySection.querySelector('.inventory-stats');
        if (oldStats) oldStats.remove();
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'inventory-stats';
        statsDiv.innerHTML = `Количество предметов: <span>${this.ownedCases.length}</span>`;
        
        const grid = inventorySection.querySelector('.inventory-grid');
        if (grid) {
            inventorySection.insertBefore(statsDiv, grid);
        }
    },
    
    buyCase(caseId) {
        // 👇 ЗВУК ПРИ НАЖАТИИ КУПИТЬ
        if (window.Settings) Settings.click();
        
        if (this.processingIds.has(caseId)) {
            return;
        }
        
        const caseItem = this.cases.find(c => c.id === caseId);
        if (!caseItem) return;
        
        if (caseItem.isSecret) {
            App.showAlert('❌ Этот кейс нельзя купить! Выполняйте задания чтобы получить его.');
            // 👇 ЗВУК ПРИ ОШИБКЕ
            if (window.Settings) Settings.error();
            return;
        }
        
        if (this.coins < caseItem.price) {
            App.showAlert('❌ Недостаточно Pingcoins!');
            // 👇 ЗВУК ПРИ ОШИБКЕ
            if (window.Settings) Settings.error();
            return;
        }
        
        this.processingIds.add(caseId);
        
        this.coins -= caseItem.price;
        this.updateCoinsDisplay();
        
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${caseId}_${timestamp}_${random}`;
        
        this.ownedCases.push({
            caseId: caseId,
            uniqueId: uniqueId,
            purchaseDate: timestamp
        });
        
        this.newItems.push(uniqueId);
        this.updateInventoryBadge();
        
        // 👇 ЗВУК ПРИ УСПЕШНОЙ ПОКУПКЕ
        if (window.Settings) Settings.success();
        App.hapticFeedback('medium');
        
        this.renderCases();
        
        if (this.currentTab === 'inventory') {
            this.renderInventory();
        }
        
        setTimeout(() => {
            this.processingIds.delete(caseId);
        }, 100);
    },
    
    useItem(uniqueId) {
        // 👇 ЗВУК ПРИ КЛИКЕ НА ПРЕДМЕТ
        if (window.Settings) Settings.click();
        
        const newIndex = this.newItems.indexOf(uniqueId);
        if (newIndex !== -1) {
            this.newItems.splice(newIndex, 1);
            this.updateInventoryBadge();
        }
        
        this.renderInventory();
        App.hapticFeedback('light');
        
        // 👇 ЗВУК ПРИ ОТКРЫТИИ КЕЙСА (пока заглушка)
        if (window.Settings) Settings.success();
        
        App.showPopup({
            title: 'Открытие кейса',
            message: 'Здесь будет анимация открытия',
            buttons: [{ id: 'ok', type: 'ok', text: 'ОК' }]
        });
    },
    
    addSecretCase() {
        const caseId = 'secret_case';
        const caseItem = this.cases.find(c => c.id === caseId);
        
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${caseId}_${timestamp}_${random}`;
        
        this.ownedCases.push({
            caseId: caseId,
            uniqueId: uniqueId,
            purchaseDate: timestamp
        });
        
        this.newItems.push(uniqueId);
        this.updateInventoryBadge();
        
        if (this.currentTab === 'inventory') {
            this.renderInventory();
        }
        
        // 👇 ЗВУК ПРИ ПОЛУЧЕНИИ СЕКРЕТНОГО КЕЙСА
        if (window.Settings) Settings.success();
        App.hapticFeedback('medium');
    }
};

// 👇 НОВАЯ ФУНКЦИЯ: показ магазина с классом shop-mode
Shop.show = function() {
    // Добавляем класс к .content
    const content = document.querySelector('.content');
    if (content) {
        content.classList.add('shop-mode');
    }
    
    // Показываем экран магазина
    document.getElementById('shopScreen')?.classList.add('active');
    
    // Инициализируем, если нужно
    this.init();
};

// 👇 НОВАЯ ФУНКЦИЯ: скрытие магазина
Shop.hide = function() {
    // Убираем класс с .content
    const content = document.querySelector('.content');
    if (content) {
        content.classList.remove('shop-mode');
    }
    
    // Скрываем экран магазина
    document.getElementById('shopScreen')?.classList.remove('active');
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    Shop.init();
});

window.Shop = Shop;

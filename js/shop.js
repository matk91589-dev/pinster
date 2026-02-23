// ============================================
// МАГАЗИН (Telegram Mini App версия) - МГНОВЕННАЯ ПОКУПКА
// ============================================

const Shop = {
    coins: 99999,
    currentTab: 'cases',
    ownedCases: [],
    newItems: [],
    
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
        // Единый обработчик на документе
        document.addEventListener('click', (e) => {
            // Для кнопок покупки
            const buyBtn = e.target.closest('.buy-btn-simple');
            if (buyBtn && !buyBtn.classList.contains('disabled')) {
                e.preventDefault();
                e.stopPropagation();
                const caseId = buyBtn.dataset.caseId;
                if (caseId) {
                    this.buyCase(caseId);
                }
                return;
            }
            
            // Для предметов в инвентаре
            const inventoryItem = e.target.closest('.inventory-item');
            if (inventoryItem) {
                e.preventDefault();
                e.stopPropagation();
                const uniqueId = inventoryItem.dataset.uniqueId;
                if (uniqueId) {
                    this.useItem(uniqueId);
                }
                return;
            }
        });
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
            App.hapticFeedback('light');
        }
    },
    
    showTab(tab) {
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
        
        container.innerHTML = this.ownedCases.map(caseItem => {
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
    
    // МГНОВЕННАЯ ПОКУПКА БЕЗ ПОДТВЕРЖДЕНИЯ
    buyCase(caseId) {
        const caseItem = this.cases.find(c => c.id === caseId);
        if (!caseItem) return;
        
        if (caseItem.isSecret) {
            App.showAlert('❌ Этот кейс нельзя купить! Выполняйте задания чтобы получить его.');
            return;
        }
        
        if (this.coins < caseItem.price) {
            App.showAlert('❌ Недостаточно Pingcoins!');
            return;
        }
        
        // МГНОВЕННО СПИСЫВАЕМ МОНЕТЫ
        this.coins -= caseItem.price;
        this.updateCoinsDisplay();
        
        // ГЕНЕРИРУЕМ ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${caseId}_${timestamp}_${random}`;
        
        // ДОБАВЛЯЕМ КЕЙС
        this.ownedCases.push({
            caseId: caseId,
            uniqueId: uniqueId,
            purchaseDate: timestamp
        });
        
        this.newItems.push(uniqueId);
        this.updateInventoryBadge();
        
        App.hapticFeedback('medium');
        
        // ОБНОВЛЯЕМ ВСЁ МГНОВЕННО
        this.renderCases(); // Обновляем кнопки (disabled/active)
        
        if (this.currentTab === 'inventory') {
            this.renderInventory();
        }
    },
    
    useItem(uniqueId) {
        const newIndex = this.newItems.indexOf(uniqueId);
        if (newIndex !== -1) {
            this.newItems.splice(newIndex, 1);
            this.updateInventoryBadge();
        }
        
        this.renderInventory();
        App.hapticFeedback('light');
        
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
        
        App.hapticFeedback('medium');
    }
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    Shop.init();
});

window.Shop = Shop;

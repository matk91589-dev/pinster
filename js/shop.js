// ============================================
// МАГАЗИН (Telegram Mini App версия) - БЕЗ БАГОВ С КЛИКАМИ
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
            price: 100, 
            class: 'common-case',
            imagePath: 'cases/common_case.png',
            isSecret: false
        },
        { 
            id: 'rare_case', 
            name: 'RARE CASE', 
            price: 250, 
            class: 'rare-case',
            imagePath: 'cases/rare_case.png',
            isSecret: false
        },
        { 
            id: 'premium_case', 
            name: 'PREMIUM CASE', 
            price: 500, 
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
        // Вешаем один обработчик на контейнер (делегирование событий)
        const casesGrid = document.querySelector('.cases-grid');
        if (casesGrid) {
            casesGrid.addEventListener('click', (e) => {
                const buyBtn = e.target.closest('.buy-btn-simple');
                if (buyBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Получаем caseId из атрибута data-case-id
                    const caseId = buyBtn.dataset.caseId;
                    if (caseId) {
                        this.buyCase(caseId);
                    }
                }
            });
        }
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
        document.querySelector(`.shop-tab[onclick="Shop.showTab('${tab}')"]`).classList.add('active');
        
        if (tab === 'cases') {
            document.querySelector('.cases-section').classList.remove('hidden');
            document.querySelector('.inventory-section').classList.add('hidden');
            this.renderCases();
        } else {
            document.querySelector('.cases-section').classList.add('hidden');
            document.querySelector('.inventory-section').classList.remove('hidden');
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
                                КУПИТЬ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Перевешиваем обработчики после рендера
        this.setupEventListeners();
    },
    
    renderInventory() {
        const container = document.querySelector('.inventory-grid');
        if (!container) return;
        
        if (this.ownedCases.length === 0) {
            container.innerHTML = '';
            this.renderInventoryStats();
            return;
        }
        
        const newCases = this.ownedCases.filter(c => this.newItems.includes(c.uniqueId));
        const oldCases = this.ownedCases.filter(c => !this.newItems.includes(c.uniqueId));
        
        newCases.sort((a, b) => b.purchaseDate - a.purchaseDate);
        const sortedCases = [...newCases, ...oldCases];
        
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
        
        // Добавляем обработчики для инвентаря
        container.querySelectorAll('.inventory-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const uniqueId = item.dataset.uniqueId;
                if (uniqueId) {
                    this.useItem(uniqueId);
                }
            });
        });
        
        this.renderInventoryStats();
    },
    
    renderInventoryStats() {
        const inventorySection = document.querySelector('.inventory-section');
        if (!inventorySection) return;
        
        const oldStats = inventorySection.querySelector('.inventory-stats');
        if (oldStats) oldStats.remove();
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'inventory-stats';
        statsDiv.innerHTML = `Кол-во предметов: <span>${this.ownedCases.length}</span>`;
        
        const grid = inventorySection.querySelector('.inventory-grid');
        if (grid) {
            inventorySection.insertBefore(statsDiv, grid);
        }
    },
    
    buyCase(caseId) {
        console.log('Покупка кейса:', caseId); // Для отладки
        
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
        
        // Покупаем сразу без confirm для быстроты (можно вернуть если надо)
        this.coins -= caseItem.price;
        this.updateCoinsDisplay();
        
        // Генерируем реально уникальный ID
        const timestamp = Date.now();
        const random1 = Math.random().toString(36).substring(2, 15);
        const random2 = Math.random().toString(36).substring(2, 15);
        const random3 = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${caseId}_${timestamp}_${random1}_${random2}_${random3}`;
        
        this.ownedCases.push({
            caseId: caseId,
            uniqueId: uniqueId,
            purchaseDate: timestamp
        });
        
        this.newItems.push(uniqueId);
        this.updateInventoryBadge();
        
        App.hapticFeedback('medium');
        
        // Если мы на вкладке инвентаря - обновляем
        if (this.currentTab === 'inventory') {
            this.renderInventory();
        }
        
        // Показываем уведомление
        App.showAlert(`✅ ${caseItem.name} добавлен в инвентарь!`);
    },
    
    useItem(uniqueId) {
        console.log('Использование предмета:', uniqueId); // Для отладки
        
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
        const random1 = Math.random().toString(36).substring(2, 15);
        const random2 = Math.random().toString(36).substring(2, 15);
        const random3 = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${caseId}_${timestamp}_${random1}_${random2}_${random3}`;
        
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
        
        App.showAlert(`✅ ${caseItem.name} добавлен в инвентарь!`);
        App.hapticFeedback('medium');
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    Shop.init();
});

window.Shop = Shop;

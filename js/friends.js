// ============================================
// ДРУЗЬЯ - ПОИСК ИГРОКОВ (РАБОЧАЯ ВЕРСИЯ)
// ============================================

const Friends = {
    allPlayers: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        this.telegramId = Profile.getTelegramId();
        this.loadAllPlayers();
        this.setupSearchInput();
    },
    
    // Загрузка всех игроков при открытии
    async loadAllPlayers() {
        console.log('📥 Загрузка всех игроков...');
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/users/all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            const data = await response.json();
            console.log('📦 Загружено игроков:', data.users?.length || 0);
            
            if (data.status === 'ok' && data.users) {
                this.allPlayers = data.users;
                this.renderPlayers(this.allPlayers);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки игроков:', error);
            this.showError('Не удалось загрузить игроков');
        }
    },
    
    // Настройка поля поиска
    setupSearchInput() {
        const searchInput = document.getElementById('friendSearchInput');
        
        if (!searchInput) {
            console.log('❌ Поле поиска не найдено');
            return;
        }
        
        console.log('✅ Поле поиска настроено');
        
        // Убираем readonly и disabled
        searchInput.removeAttribute('readonly');
        searchInput.removeAttribute('disabled');
        
        // Очищаем плейсхолдер
        searchInput.value = '';
        
        // Добавляем обработчик ввода
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('🔍 Поиск:', query);
            
            // Очищаем предыдущий таймер
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Если запрос пустой - показываем всех
            if (query === '') {
                this.renderPlayers(this.allPlayers);
                return;
            }
            
            // Ждем 300мс после последнего ввода
            this.searchTimeout = setTimeout(() => {
                this.searchPlayers(query);
            }, 300);
        });
        
        // Убираем обработчик с кнопки, поиск идет по мере ввода
        const searchBtn = document.querySelector('.friends-search-btn');
        if (searchBtn) {
            searchBtn.style.display = 'none'; // Прячем кнопку
        }
    },
    
    // Поиск игроков
    async searchPlayers(query) {
        if (!query) {
            this.renderPlayers(this.allPlayers);
            return;
        }
        
        console.log('🔍 Ищем:', query);
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/users/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    query: query
                })
            });
            
            const data = await response.json();
            console.log('📦 Результаты поиска:', data.users?.length || 0);
            
            if (data.status === 'ok') {
                this.renderPlayers(data.users || []);
            }
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
        }
    },
    
    // Отрисовка игроков
    renderPlayers(players) {
        const container = document.getElementById('friendsPageList');
        if (!container) return;
        
        if (!players || players.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">игроки не найдены</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = players.map(player => `
            <div class="player-item" onclick="Friends.showPlayerProfile('${player.player_id}')">
                <div class="player-avatar">
                    ${player.avatar 
                        ? `<img src="${player.avatar}" alt="avatar">` 
                        : `<div class="avatar-placeholder">${player.nick?.[0] || '?'}</div>`
                    }
                </div>
                <div class="player-info">
                    <div class="player-nick">${player.nick || 'Без имени'}</div>
                    <div class="player-id">ID: ${player.player_id}</div>
                </div>
                <button class="player-profile-btn" onclick="event.stopPropagation(); Friends.showPlayerProfile('${player.player_id}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="white"/>
                        <circle cx="12" cy="8" r="4" fill="black"/>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="black"/>
                    </svg>
                </button>
            </div>
        `).join('');
    },
    
    // Показать ошибку
    showError(message) {
        const container = document.getElementById('friendsPageList');
        if (container) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">❌ ${message}</div>
                </div>
            `;
        }
    },
    
    // Показать профиль игрока
    showPlayerProfile(playerId) {
        console.log('👤 Профиль игрока:', playerId);
        alert(`Профиль игрока ${playerId} (будет позже)`);
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Friends.init(), 300);
});

window.Friends = Friends;

// ============================================
// ДРУЗЬЯ - ПОИСК ИГРОКОВ (ИЗ БД)
// ============================================

const Friends = {
    players: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        this.telegramId = Profile.getTelegramId();
        this.loadAllPlayers();
        this.setupSearch();
    },
    
    // Загрузка всех игроков из БД
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
            console.log('📦 Игроки:', data);
            
            if (data.status === 'ok' && data.users) {
                this.players = data.users;
                this.renderPlayersList(this.players);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки игроков:', error);
        }
    },
    
    // Настройка поиска
    setupSearch() {
        const searchInput = document.getElementById('friendSearchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Дебаунс чтобы не ддосить сервер
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchPlayers(e.target.value);
                }, 300);
            });
        }
    },
    
    // Поиск игроков через сервер
    async searchPlayers(query) {
        if (!query.trim()) {
            this.loadAllPlayers();
            return;
        }
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/users/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    query: query.trim()
                })
            });
            
            const data = await response.json();
            console.log('📦 Результаты поиска:', data);
            
            if (data.status === 'ok' && data.users) {
                this.renderPlayersList(data.users);
            }
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
        }
    },
    
    // Отрисовка списка игроков
    renderPlayersList(players) {
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
    
    // Показать профиль игрока
    showPlayerProfile(playerId) {
        console.log('👤 Профиль игрока:', playerId);
        // TODO: Открыть карточку игрока (как в свайпе)
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Friends.init(), 300);
});

window.Friends = Friends;

// ============================================
// ДРУЗЬЯ - ИСПРАВЛЕННАЯ ВЕРСИЯ С ДЕБАГОМ
// ============================================

const Friends = {
    allPlayers: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        console.log('🔍 Friends.init() запущен');
        
        // Пробуем получить telegram_id разными способами
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
            console.log('✅ Telegram ID из WebApp:', this.telegramId);
        } else {
            this.telegramId = Profile.getTelegramId();
            console.log('✅ Telegram ID из Profile:', this.telegramId);
        }
        
        if (!this.telegramId) {
            console.error('❌ НЕТ TELEGRAM ID!');
            this.showError('Ошибка авторизации');
            return;
        }
        
        console.log('🚀 Загружаем игроков с ID:', this.telegramId);
        this.loadAllPlayers();
        this.setupSearchInput();
    },
    
    async loadAllPlayers() {
        console.log('📥 Запрос к /api/users/all...');
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/users/all', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId  // 👈 ТЕПЕРЬ ТОЧНО ПРАВИЛЬНЫЙ ID
                })
            });
            
            console.log('📦 Статус ответа:', response.status);
            const data = await response.json();
            console.log('📦 Данные от сервера:', data);
            
            if (data.status === 'ok' && data.users) {
                this.allPlayers = data.users;
                console.log('✅ Загружено игроков:', this.allPlayers.length);
                this.renderPlayers(this.allPlayers);
            } else {
                console.log('❌ Ошибка от сервера:', data.error);
                this.showError(data.error || 'Нет данных');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.showError('Не удалось загрузить игроков');
        }
    },
    
    setupSearchInput() {
        const searchInput = document.getElementById('friendSearchInput');
        if (!searchInput) {
            console.log('❌ Поле поиска не найдено');
            return;
        }
        
        console.log('✅ Поле поиска настроено');
        searchInput.removeAttribute('readonly');
        searchInput.removeAttribute('disabled');
        searchInput.value = '';
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            
            if (query === '') {
                this.renderPlayers(this.allPlayers);
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.searchPlayers(query);
            }, 300);
        });
        
        // Прячем кнопку
        const searchBtn = document.querySelector('.friends-search-btn');
        if (searchBtn) searchBtn.style.display = 'none';
    },
    
    async searchPlayers(query) {
        if (!query) {
            this.renderPlayers(this.allPlayers);
            return;
        }
        
        console.log('🔍 Поиск:', query);
        
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
            console.log('📦 Результаты поиска:', data);
            
            if (data.status === 'ok' && data.users) {
                this.renderPlayers(data.users);
            } else {
                this.renderPlayers([]);
            }
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            this.renderPlayers([]);
        }
    },
    
    renderPlayers(players) {
        console.log('🎨 Отрисовка игроков:', players?.length || 0);
        
        const container = document.getElementById('friendsPageList');
        if (!container) {
            console.log('❌ Контейнер friendsPageList не найден');
            return;
        }
        
        if (!players || players.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">🤷 игроки не найдены</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        players.forEach(player => {
            html += `
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
                    👤
                </button>
            </div>
            `;
        });
        
        container.innerHTML = html;
        console.log('✅ Отрисовка завершена');
    },
    
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
    
    showPlayerProfile(playerId) {
        console.log('👤 Профиль игрока:', playerId);
        alert(`Профиль игрока ${playerId}`);
    }
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Friends.js загружен');
    // Даем время инициализироваться Telegram
    setTimeout(() => Friends.init(), 1000);
});

window.Friends = Friends;

// ============================================
// КОМАНДА - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

const Team = {
    currentTab: 'friends',
    allPlayers: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        console.log('Team.init() запущен');
        
        // Получаем Telegram ID
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
        } else {
            this.telegramId = Profile.getTelegramId();
        }
        
        console.log('Team Telegram ID:', this.telegramId);
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        const teamScreen = document.getElementById('teamScreen');
        if (teamScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            teamScreen.classList.add('active');
            
            // Загружаем игроков при открытии
            this.loadAllPlayers();
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    },
    
    async loadAllPlayers() {
        console.log('📥 Загрузка всех игроков в Team...');
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/users/all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const data = await response.json();
            console.log('📦 Team ответ:', data);
            
            if (data.status === 'ok' && data.users) {
                this.allPlayers = data.users;
                // Если открыт таб поиска, сразу показываем всех
                if (this.currentTab === 'search') {
                    this.renderSearchResults(this.allPlayers);
                } else {
                    this.renderFriendsTab();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
        }
    },
    
    switchTab(tab, element) {
        this.currentTab = tab;
        
        document.querySelectorAll('.team-tab').forEach(t => {
            t.classList.remove('active');
        });
        element.classList.add('active');
        
        if (tab === 'friends') {
            this.renderFriendsTab();
        } else {
            this.renderSearchTab();
        }
    },
    
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        // Заглушка для друзей (потом добавишь)
        content.innerHTML = `
            <div class="team-list">
                <div class="empty-friends">
                    <div class="empty-friends-text">🤷 скоро тут будут друзья</div>
                </div>
            </div>
        `;
    },
    
    renderSearchTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="team-search-container">
                <div class="team-search-box">
                    <input type="text" 
                           id="teamSearchInput" 
                           class="team-search-input" 
                           placeholder="🔍 Введите ник или ID игрока"
                           autocomplete="off">
                </div>
            </div>
            <div class="team-list" id="teamSearchResults">
                <!-- Сюда будут игроки -->
            </div>
        `;
        
        // Показываем всех игроков сразу
        this.renderSearchResults(this.allPlayers);
        this.setupSearchInput();
    },
    
    renderSearchResults(players) {
        const container = document.getElementById('teamSearchResults');
        if (!container) return;
        
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
            <div class="player-item" onclick="Team.showPlayerProfile('${player.player_id}')">
                <div class="player-avatar">
                    ${player.avatar 
                        ? `<img src="${player.avatar}" alt="avatar" style="width:100%; height:100%; object-fit:cover;">` 
                        : `<div class="avatar-placeholder">${player.nick?.[0] || '?'}</div>`
                    }
                </div>
                <div class="player-info">
                    <div class="player-nick">${player.nick || 'Без имени'}</div>
                    <div class="player-id">ID: ${player.player_id}</div>
                </div>
                <button class="player-profile-btn" onclick="event.stopPropagation(); Team.showPlayerProfile('${player.player_id}')">
                    👤
                </button>
            </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    setupSearchInput() {
        const input = document.getElementById('teamSearchInput');
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            
            if (query === '') {
                this.renderSearchResults(this.allPlayers);
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.searchPlayers(query);
            }, 300);
        });
    },
    
    async searchPlayers(query) {
        if (!query) {
            this.renderSearchResults(this.allPlayers);
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
            
            if (data.status === 'ok' && data.users) {
                this.renderSearchResults(data.users);
            } else {
                this.renderSearchResults([]);
            }
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            this.renderSearchResults([]);
        }
    },
    
    showPlayerProfile(playerId) {
        alert(`👤 Профиль игрока ${playerId}`);
    },
    
    showRequests() {
        alert('📨 Запросы в друзья (будет позже)');
    },
    
    goBack() {
        App.showScreen('profileScreen', true);
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Team.init();
});

window.Team = Team;

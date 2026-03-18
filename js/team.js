// ============================================
// КОМАНДА - С ДРУЗЬЯМИ
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
        
        // Проверяем, есть ли Friends и список друзей
        if (window.Friends && window.Friends.friendsList) {
            const friends = window.Friends.friendsList;
            
            if (friends.length === 0) {
                content.innerHTML = `
                    <div class="players-list">
                        <div class="empty-friends">
                            <div class="empty-friends-text">🤷 у вас пока нет друзей</div>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="players-list">';
            friends.forEach(friend => {
                html += `
                <div class="player-row" onclick="Team.showPlayerProfile('${friend.player_id}')">
                    <div class="player-avatar">
                        ${friend.avatar 
                            ? `<img src="${friend.avatar}" alt="avatar">` 
                            : `<div class="avatar-placeholder">${friend.nick?.[0] || '?'}</div>`
                        }
                    </div>
                    <div class="player-info">
                        <span class="player-id">ID: ${friend.player_id}</span>
                        <span class="player-nick">${friend.nick || 'Без имени'}</span>
                    </div>
                    <span class="player-arrow">→</span>
                </div>
                `;
            });
            html += '</div>';
            
            content.innerHTML = html;
        } else {
            // Если Friends еще не загрузился, показываем заглушку
            content.innerHTML = `
                <div class="players-list">
                    <div class="empty-friends">
                        <div class="empty-friends-text">🤷 загрузка...</div>
                    </div>
                </div>
            `;
            
            // Пробуем загрузить через секунду
            setTimeout(() => {
                if (window.Friends && window.Friends.friendsList) {
                    this.renderFriendsTab();
                }
            }, 1000);
        }
    },
    
    renderSearchTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="players-search">
                <input type="search" 
                       id="teamSearchInput" 
                       class="players-search-input" 
                       placeholder="Введите ник или ID игрока"
                       autocomplete="off">
            </div>
            <div class="players-list" id="teamSearchResults">
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
            <div class="player-row" onclick="Team.showPlayerProfile('${player.player_id}')">
                <div class="player-avatar">
                    ${player.avatar 
                        ? `<img src="${player.avatar}" alt="avatar">` 
                        : `<div class="avatar-placeholder">${player.nick?.[0] || '?'}</div>`
                    }
                </div>
                <div class="player-info">
                    <span class="player-id">ID: ${player.player_id}</span>
                    <span class="player-nick">${player.nick || 'Без имени'}</span>
                </div>
                <span class="player-arrow" onclick="event.stopPropagation(); Team.showPlayerProfile('${player.player_id}')">→</span>
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

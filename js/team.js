// ============================================
// КОМАНДА - С ЛИДЕРБОРДОМ И ДРУЗЬЯМИ
// ============================================

const Team = {
    currentTab: 'friends',
    friendsList: [],
    filteredFriends: [],
    telegramId: null,
    searchTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    leaderboard: [],
    currentPlayerId: null,
    isLeaderboardLoaded: false,

    init() {
        console.log('🚀 Team.init() запущен');
        
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
        } else if (window.Profile && Profile.getTelegramId) {
            this.telegramId = Profile.getTelegramId();
        }
        
        this.currentPlayerId = localStorage.getItem('player_id');
        
        console.log('Team Telegram ID:', this.telegramId);
        console.log('Team Player ID:', this.currentPlayerId);
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
        // Сразу грузим данные
        this.loadFriendsList();
        this.loadLeaderboard();
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
        if (!this.telegramId) {
            this.init();
        }
        
        const teamScreen = document.getElementById('teamScreen');
        if (!teamScreen) {
            console.error('❌ teamScreen не найден');
            return;
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        teamScreen.classList.add('active');
        
        if (this.currentTab === 'friends') {
            this.renderFriendsTab();
        } else {
            this.renderLeaderboardTab();
        }
        
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },
    
    async loadFriendsList() {
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки друзей');
            return;
        }
        
        console.log('👥 Загрузка друзей с сервера...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                console.log('✅ Загружено друзей:', this.friendsList.length);
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
            }
            
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
            this.friendsList = [];
            this.filteredFriends = [];
        }
    },
    
    async loadLeaderboard() {
        if (this.isLeaderboardLoaded && this.leaderboard.length > 0) {
            console.log('📦 Лидерборд уже загружен');
            return;
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки лидерборда');
            return;
        }
        
        console.log('📥 Загрузка лидерборда с сервера...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/users/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) {
                console.warn(`⚠️ Сервер ответил ${response.status}`);
                this.leaderboard = [];
                this.isLeaderboardLoaded = true;
                return;
            }
            
            const data = await response.json();
            console.log('📦 Ответ лидерборда:', data);
            
            if (data.status === 'ok' && data.leaderboard && data.leaderboard.length > 0) {
                this.leaderboard = data.leaderboard;
                this.isLeaderboardLoaded = true;
                console.log('✅ Загружено лидеров:', this.leaderboard.length);
            } else {
                this.leaderboard = [];
                this.isLeaderboardLoaded = true;
            }
            
            if (this.currentTab === 'leaderboard') {
                this.renderLeaderboardTab();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лидерборда:', error);
            this.leaderboard = [];
            this.isLeaderboardLoaded = true;
        }
    },
    
    switchTab(tab, element) {
        this.currentTab = tab;
        
        document.querySelectorAll('.team-tab').forEach(t => {
            t.classList.remove('active');
        });
        if (element) element.classList.add('active');
        
        if (tab === 'friends') {
            this.renderFriendsTab();
        } else {
            this.renderLeaderboardTab();
        }
    },
    
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        let html = `
            <div class="friends-search">
                <input type="search" 
                       id="friendsSearchInput" 
                       class="friends-search-input" 
                       placeholder="поиск: введите id или ник друга"
                       autocomplete="off">
            </div>
            <div class="friends-list-container" id="friendsTabList">
        `;
        
        if (this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">у вас пока нет друзей</div></div>`;
        } else {
            this.filteredFriends.forEach(friend => {
                html += `
                <div class="friend-row" onclick="Team.showFriendProfile('${friend.player_id}')">
                    <div class="friend-avatar">
                        ${friend.avatar 
                            ? `<img src="${friend.avatar}" alt="avatar">` 
                            : `<span>${friend.nick?.[0] || '?'}</span>`
                        }
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${friend.player_id}</span>
                        <span class="friend-name">${friend.nick || 'Без имени'}</span>
                    </div>
                    <span class="friend-arrow">→</span>
                </div>`;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        setTimeout(() => this.setupFriendsSearch(), 50);
    },
    
    setupFriendsSearch() {
        const searchInput = document.getElementById('friendsSearchInput');
        if (!searchInput) return;
        
        searchInput.removeAttribute('readonly');
        searchInput.removeAttribute('disabled');
        
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        
        searchInput.oninput = null;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.searchFriends(query), 300);
        });
    },
    
    searchFriends(query) {
        if (!query) {
            this.filteredFriends = [...this.friendsList];
        } else {
            this.filteredFriends = this.friendsList.filter(friend => {
                const nickMatch = friend.nick?.toLowerCase().includes(query);
                const idMatch = friend.player_id?.toLowerCase().includes(query);
                return nickMatch || idMatch;
            });
        }
        this.updateFriendsTabList();
    },
    
    updateFriendsTabList() {
        const container = document.getElementById('friendsTabList');
        if (!container) return;
        
        if (!this.filteredFriends || this.filteredFriends.length === 0) {
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">друзья не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredFriends.forEach(friend => {
            html += `
            <div class="friend-row" onclick="Team.showFriendProfile('${friend.player_id}')">
                <div class="friend-avatar">
                    ${friend.avatar 
                        ? `<img src="${friend.avatar}" alt="avatar">` 
                        : `<span>${friend.nick?.[0] || '?'}</span>`
                    }
                </div>
                <div class="friend-info">
                    <span class="friend-id">ID: ${friend.player_id}</span>
                    <span class="friend-name">${friend.nick || 'Без имени'}</span>
                </div>
                <span class="friend-arrow">→</span>
            </div>`;
        });
        container.innerHTML = html;
    },
    
    renderLeaderboardTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        const listDiv = document.createElement('div');
        listDiv.className = 'leaderboard-list';
        listDiv.id = 'leaderboardList';
        
        if (!this.isLeaderboardLoaded && this.leaderboard.length === 0) {
            listDiv.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">загрузка лидерборда...</div></div>`;
        } else if (this.leaderboard.length === 0) {
            listDiv.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">пока нет игроков</div></div>`;
        } else {
            this.renderLeaderboardList(listDiv);
        }
        
        content.innerHTML = '';
        content.appendChild(listDiv);
        this.injectLeaderboardStyles();
    },
    
    renderLeaderboardList(container) {
        if (!container) return;
        
        let html = '';
        this.leaderboard.forEach((player, index) => {
            const place = index + 1;
            const isCurrent = player.player_id === this.currentPlayerId;
            const placeText = place === 1 ? '#1' : place === 2 ? '#2' : place === 3 ? '#3' : `#${place}`;
            
            html += `
                <div class="friend-row ${isCurrent ? 'current-player' : ''}" 
                     onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="friend-avatar">
                        ${player.avatar 
                            ? `<img src="${player.avatar}" alt="avatar">` 
                            : `<span>${player.nick?.[0] || '?'}</span>`
                        }
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">${placeText}</span>
                        <span class="friend-name">${player.nick || 'Без имени'}</span>
                    </div>
                    ${isCurrent ? '<span class="leaderboard-badge">ВЫ</span>' : '<span class="friend-arrow">→</span>'}
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    injectLeaderboardStyles() {
        if (document.getElementById('leaderboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'leaderboard-styles';
        style.textContent = `
            .leaderboard-list {
                padding: 8px 16px;
                flex: 1;
                overflow-y: auto;
            }
            .friend-row.current-player {
                background: rgba(255, 85, 0, 0.1);
                border-left: 3px solid #FF5500;
                margin-left: -3px;
                padding-left: 19px;
            }
            .friend-row.current-player .friend-name {
                color: #FF5500;
            }
            .leaderboard-badge {
                background: #FF5500;
                color: #fff;
                font-size: 10px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 12px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    },
    
    showFriendProfile(playerId) {
        console.log('👤 Профиль друга:', playerId);
        if (window.App) {
            App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
        } else {
            alert(`Профиль друга ${playerId}\n(функция в разработке)`);
        }
    },
    
    showPlayerProfile(playerId) {
        console.log('👤 Профиль игрока:', playerId);
        if (window.App) {
            App.showAlert(`Профиль игрока ${playerId}\n(функция в разработке)`);
        } else {
            alert(`Профиль игрока ${playerId}\n(функция в разработке)`);
        }
    },
    
    deleteFriend(playerId) {
        console.log('🗑️ Удалить друга:', playerId);
        if (confirm('Удалить пользователя из друзей?')) {
            this.friendsList = this.friendsList.filter(f => f.player_id !== playerId);
            this.filteredFriends = this.filteredFriends.filter(f => f.player_id !== playerId);
            
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            }
            
            if (window.App) {
                App.showAlert('Друг удален');
            } else {
                alert('Друг удален');
            }
        }
    },
    
    goBack() {
        if (window.App && App.showScreen) {
            App.showScreen('profileScreen', true);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Team.js загружен');
    setTimeout(() => Team.init(), 100);
});

window.Team = Team;

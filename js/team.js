// ============================================
// КОМАНДА - СТИЛЬНАЯ ВЕРСИЯ
// ============================================

const Team = {
    currentTab: 'friends',
    friendsList: [],
    filteredFriends: [],
    leaderboard: [],
    filteredLeaderboard: [],
    telegramId: null,
    searchTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    currentPlayerId: null,
    isFriendsLoaded: false,
    isLeaderboardLoaded: false,
    isLoadingFriends: false,
    isLoadingLeaderboard: false,

    init() {
        console.log('🚀 Team.init()');
        
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
        
        // Предзагрузка данных в фоне
        this.preloadData();
    },
    
    preloadData() {
        // Тихо загружаем в фоне, не дожидаясь открытия экрана
        setTimeout(() => {
            if (this.telegramId && !this.isFriendsLoaded && !this.isLoadingFriends) {
                this.loadFriendsList();
            }
            if (this.telegramId && !this.isLeaderboardLoaded && !this.isLoadingLeaderboard) {
                this.loadLeaderboard();
            }
        }, 500);
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
        const teamScreen = document.getElementById('teamScreen');
        if (!teamScreen) {
            console.error('❌ teamScreen не найден');
            return;
        }
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        teamScreen.classList.add('active');
        
        // Если данные уже есть — показываем мгновенно
        if (this.currentTab === 'friends') {
            this.renderFriendsTab();
            if (!this.isFriendsLoaded && !this.isLoadingFriends && this.telegramId) {
                this.loadFriendsList();
            }
        } else {
            this.renderLeaderboardTab();
            if (!this.isLeaderboardLoaded && !this.isLoadingLeaderboard && this.telegramId) {
                this.loadLeaderboard();
            }
        }
    },
    
    async loadFriendsList() {
        if (!this.telegramId) return;
        if (this.isLoadingFriends) return;
        
        this.isLoadingFriends = true;
        console.log('👥 Загрузка друзей...');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                console.log('✅ Друзья загружены:', this.friendsList.length);
                
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
            this.friendsList = [];
            this.filteredFriends = [];
            this.isFriendsLoaded = true;
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            }
        } finally {
            this.isLoadingFriends = false;
        }
    },
    
    async loadLeaderboard() {
        if (!this.telegramId) return;
        if (this.isLoadingLeaderboard) return;
        
        this.isLoadingLeaderboard = true;
        console.log('📥 Загрузка лидерборда...');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/users/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Ответ лидерборда:', data);
            
            if (data.status === 'ok' && data.leaderboard) {
                this.leaderboard = data.leaderboard;
                this.filteredLeaderboard = [...this.leaderboard];
                this.isLeaderboardLoaded = true;
                console.log('✅ Лидерборд загружен:', this.leaderboard.length);
                
                if (this.currentTab === 'leaderboard') {
                    this.renderLeaderboardTab();
                }
            } else {
                this.leaderboard = [];
                this.filteredLeaderboard = [];
                this.isLeaderboardLoaded = true;
                if (this.currentTab === 'leaderboard') {
                    this.renderLeaderboardTab();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лидерборда:', error);
            this.leaderboard = [];
            this.filteredLeaderboard = [];
            this.isLeaderboardLoaded = true;
            if (this.currentTab === 'leaderboard') {
                this.renderLeaderboardTab();
            }
        } finally {
            this.isLoadingLeaderboard = false;
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
            if (!this.isFriendsLoaded && !this.isLoadingFriends && this.telegramId) {
                this.loadFriendsList();
            }
        } else {
            this.renderLeaderboardTab();
            if (!this.isLeaderboardLoaded && !this.isLoadingLeaderboard && this.telegramId) {
                this.loadLeaderboard();
            }
        }
    },
    
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        let html = `
            <div class="team-search-container">
                <div class="team-search-box">
                    <input type="search" id="friendsSearchInput" class="team-search-input" 
                           placeholder="Поиск по нику или ID" autocomplete="off">
                    <button class="team-search-btn" onclick="Team.searchFriends()">🔍</button>
                </div>
            </div>
            <div class="team-list" id="friendsTabList">
        `;
        
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `<div class="empty-state"><div class="empty-state-text">Загрузка друзей...</div></div>`;
        } else if (this.friendsList.length === 0) {
            html += `<div class="empty-state"><div class="empty-state-text">У вас пока нет друзей</div></div>`;
        } else {
            this.filteredFriends.forEach(friend => {
                const firstChar = friend.nick && friend.nick.length > 0 ? friend.nick[0].toUpperCase() : '?';
                html += `
                <div class="team-friend-item" onclick="Team.showFriendProfile('${friend.player_id}')">
                    <div class="team-friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="team-friend-info">
                        <div class="team-friend-id">ID: ${friend.player_id}</div>
                        <div class="team-friend-name">${friend.nick || 'Без имени'}</div>
                    </div>
                    <div class="team-friend-arrow">→</div>
                </div>`;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        this.setupFriendsSearch();
        this.injectTeamStyles();
    },
    
    searchFriends() {
        const input = document.getElementById('friendsSearchInput');
        if (!input) return;
        
        const query = input.value.trim().toLowerCase();
        if (!query) {
            this.filteredFriends = [...this.friendsList];
        } else {
            this.filteredFriends = this.friendsList.filter(f => 
                f.nick?.toLowerCase().includes(query) || 
                f.player_id?.toLowerCase().includes(query)
            );
        }
        this.updateFriendsTabList();
    },
    
    setupFriendsSearch() {
        const searchInput = document.getElementById('friendsSearchInput');
        if (!searchInput) return;
        
        searchInput.oninput = () => {
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.searchFriends(), 300);
        };
    },
    
    updateFriendsTabList() {
        const container = document.getElementById('friendsTabList');
        if (!container) return;
        
        if (!this.filteredFriends.length) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-text">Друзья не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredFriends.forEach(friend => {
            const firstChar = friend.nick && friend.nick.length > 0 ? friend.nick[0].toUpperCase() : '?';
            html += `
            <div class="team-friend-item" onclick="Team.showFriendProfile('${friend.player_id}')">
                <div class="team-friend-avatar">
                    ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}
                </div>
                <div class="team-friend-info">
                    <div class="team-friend-id">ID: ${friend.player_id}</div>
                    <div class="team-friend-name">${friend.nick || 'Без имени'}</div>
                </div>
                <div class="team-friend-arrow">→</div>
            </div>`;
        });
        container.innerHTML = html;
    },
    
    renderLeaderboardTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        let html = `
            <div class="team-search-container">
                <div class="team-search-box">
                    <input type="search" id="leaderboardSearchInput" class="team-search-input" 
                           placeholder="Поиск по нику или ID" autocomplete="off">
                    <button class="team-search-btn" onclick="Team.searchLeaderboard()">🔍</button>
                </div>
            </div>
            <div class="team-list" id="leaderboardTabList">
        `;
        
        if (!this.isLeaderboardLoaded && this.leaderboard.length === 0) {
            html += `<div class="empty-state"><div class="empty-state-text">Загрузка лидерборда...</div></div>`;
        } else if (this.leaderboard.length === 0) {
            html += `<div class="empty-state"><div class="empty-state-text">Пока нет игроков</div></div>`;
        } else {
            this.filteredLeaderboard.forEach((player) => {
                const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
                const place = originalIndex + 1;
                const isCurrent = player.player_id === this.currentPlayerId;
                const firstChar = player.nick && player.nick.length > 0 ? player.nick[0].toUpperCase() : '?';
                
                html += `
                    <div class="team-leaderboard-item ${isCurrent ? 'current-player' : ''}" onclick="Team.showPlayerProfile('${player.player_id}')">
                        <div class="team-leaderboard-place">${place}</div>
                        <div class="team-leaderboard-avatar">
                            ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
                        </div>
                        <div class="team-leaderboard-info">
                            <div class="team-leaderboard-name">${player.nick || 'Без имени'}</div>
                            <div class="team-leaderboard-id">ID: ${player.player_id}</div>
                        </div>
                        <div class="team-leaderboard-coins">${player.pingcoins || 0} ⭐</div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        this.setupLeaderboardSearch();
        this.injectTeamStyles();
    },
    
    searchLeaderboard() {
        const input = document.getElementById('leaderboardSearchInput');
        if (!input) return;
        
        const query = input.value.trim().toLowerCase();
        if (!query) {
            this.filteredLeaderboard = [...this.leaderboard];
        } else {
            this.filteredLeaderboard = this.leaderboard.filter(p => 
                p.nick?.toLowerCase().includes(query) || 
                p.player_id?.toLowerCase().includes(query)
            );
        }
        this.updateLeaderboardTabList();
    },
    
    setupLeaderboardSearch() {
        const searchInput = document.getElementById('leaderboardSearchInput');
        if (!searchInput) return;
        
        searchInput.oninput = () => {
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.searchLeaderboard(), 300);
        };
    },
    
    updateLeaderboardTabList() {
        const container = document.getElementById('leaderboardTabList');
        if (!container) return;
        
        if (!this.filteredLeaderboard.length) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-text">Игроки не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredLeaderboard.forEach((player) => {
            const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
            const place = originalIndex + 1;
            const isCurrent = player.player_id === this.currentPlayerId;
            const firstChar = player.nick && player.nick.length > 0 ? player.nick[0].toUpperCase() : '?';
            
            html += `
                <div class="team-leaderboard-item ${isCurrent ? 'current-player' : ''}" onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="team-leaderboard-place">${place}</div>
                    <div class="team-leaderboard-avatar">
                        ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="team-leaderboard-info">
                        <div class="team-leaderboard-name">${player.nick || 'Без имени'}</div>
                        <div class="team-leaderboard-id">ID: ${player.player_id}</div>
                    </div>
                    <div class="team-leaderboard-coins">${player.pingcoins || 0} ⭐</div>
                </div>
            `;
        });
        container.innerHTML = html;
    },
    
    injectTeamStyles() {
        if (document.getElementById('team-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'team-styles';
        style.textContent = `
            /* Скрываем скроллбары но оставляем возможность скролла */
            .team-list {
                flex: 1;
                overflow-y: auto;
                padding: 0 16px;
                scrollbar-width: thin;
                scrollbar-color: #FF5500 #2A2F3A;
            }
            
            .team-list::-webkit-scrollbar {
                width: 3px;
            }
            
            .team-list::-webkit-scrollbar-track {
                background: #2A2F3A;
                border-radius: 10px;
            }
            
            .team-list::-webkit-scrollbar-thumb {
                background: #FF5500;
                border-radius: 10px;
            }
            
            .team-search-container {
                padding: 0 16px 16px 16px;
            }
            
            .team-search-box {
                display: flex;
                gap: 10px;
            }
            
            .team-search-input {
                flex: 1;
                background: #1A1D24;
                border: 1px solid #2A2F3A;
                border-radius: 12px;
                padding: 12px 16px;
                color: #F5F5F5;
                font-size: 14px;
                font-family: 'Montserrat', sans-serif;
                outline: none;
            }
            
            .team-search-input:focus {
                border-color: #FF5500;
            }
            
            .team-search-input::placeholder {
                color: #5D6472;
            }
            
            .team-search-btn {
                background: #FF5500;
                border: none;
                border-radius: 12px;
                padding: 0 20px;
                color: white;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .team-search-btn:hover {
                background: #FF6A33;
            }
            
            /* Элемент друга */
            .team-friend-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .team-friend-item:hover {
                background: rgba(255, 85, 0, 0.05);
                margin: 0 -16px;
                padding: 12px 16px;
            }
            
            .team-friend-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                overflow: hidden;
                background: #2A2F3A;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 600;
                color: #F5F5F5;
                flex-shrink: 0;
            }
            
            .team-friend-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .team-friend-info {
                flex: 1;
                min-width: 0;
            }
            
            .team-friend-id {
                font-size: 10px;
                color: #FF5500;
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .team-friend-name {
                font-size: 15px;
                font-weight: 600;
                color: #F5F5F5;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .team-friend-arrow {
                color: #FF5500;
                font-size: 20px;
                font-weight: 300;
                flex-shrink: 0;
            }
            
            /* Лидерборд */
            .team-leaderboard-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .team-leaderboard-item:hover {
                background: rgba(255, 85, 0, 0.05);
                margin: 0 -16px;
                padding: 12px 16px;
            }
            
            .team-leaderboard-item.current-player {
                background: rgba(255, 85, 0, 0.1);
                margin: 0 -16px;
                padding: 12px 16px;
                border-left: 3px solid #FF5500;
            }
            
            .team-leaderboard-place {
                width: 36px;
                font-size: 14px;
                font-weight: 700;
                color: #FF5500;
                text-align: center;
                flex-shrink: 0;
            }
            
            .team-leaderboard-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                overflow: hidden;
                background: #2A2F3A;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 600;
                color: #F5F5F5;
                flex-shrink: 0;
            }
            
            .team-leaderboard-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .team-leaderboard-info {
                flex: 1;
                min-width: 0;
            }
            
            .team-leaderboard-name {
                font-size: 15px;
                font-weight: 600;
                color: #F5F5F5;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .team-leaderboard-id {
                font-size: 10px;
                color: #8E97A6;
                margin-top: 2px;
            }
            
            .team-leaderboard-coins {
                font-size: 14px;
                font-weight: 600;
                color: #FF5500;
                flex-shrink: 0;
            }
            
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #8E97A6;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    },
    
    showFriendProfile(playerId) {
        if (window.App) App.showAlert(`Профиль друга\nID: ${playerId}`);
    },
    
    showPlayerProfile(playerId) {
        if (window.App) App.showAlert(`Профиль игрока\nID: ${playerId}`);
    },
    
    goBack() {
        if (window.App) App.showScreen('profileScreen', true);
    }
};

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Team.init());
} else {
    Team.init();
}

window.Team = Team;

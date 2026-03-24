// ============================================
// КОМАНДА - МАКСИМАЛЬНО ПРОСТАЯ ВЕРСИЯ
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
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
        // ❌ НЕ ГРУЗИМ ДАННЫЕ ПРИ СТАРТЕ
        // this.loadFriendsList();
        // this.loadLeaderboard();
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
        const teamScreen = document.getElementById('teamScreen');
        if (!teamScreen) return;
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        teamScreen.classList.add('active');
        
        // Грузим данные только при открытии экрана
        if (this.currentTab === 'friends') {
            this.renderFriendsTab();
            if (!this.isFriendsLoaded && !this.isLoadingFriends) {
                this.loadFriendsList();
            }
        } else {
            this.renderLeaderboardTab();
            if (!this.isLeaderboardLoaded && !this.isLoadingLeaderboard) {
                this.loadLeaderboard();
            }
        }
    },
    
    async loadFriendsList() {
        if (!this.telegramId) return;
        
        if (this.isLoadingFriends) {
            console.log('⏳ Уже загружаем друзей');
            return;
        }
        
        this.isLoadingFriends = true;
        console.log('👥 Загрузка друзей...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                console.log('✅ Друзья загружены:', this.friendsList.length);
                
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
            } else {
                console.log('❌ Нет друзей');
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка друзей:', error);
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
        
        if (this.isLoadingLeaderboard) {
            console.log('⏳ Уже загружаем лидерборд');
            return;
        }
        
        this.isLoadingLeaderboard = true;
        console.log('📥 Загрузка лидерборда...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/users/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.leaderboard) {
                this.leaderboard = data.leaderboard;
                this.isLeaderboardLoaded = true;
                console.log('✅ Лидерборд загружен:', this.leaderboard.length);
                
                if (this.currentTab === 'leaderboard') {
                    this.renderLeaderboardTab();
                }
            } else {
                console.log('❌ Нет данных лидерборда');
                this.leaderboard = [];
                this.isLeaderboardLoaded = true;
                if (this.currentTab === 'leaderboard') {
                    this.renderLeaderboardTab();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка лидерборда:', error);
            this.leaderboard = [];
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
            if (!this.isFriendsLoaded && !this.isLoadingFriends) {
                this.loadFriendsList();
            }
        } else {
            this.renderLeaderboardTab();
            if (!this.isLeaderboardLoaded && !this.isLoadingLeaderboard) {
                this.loadLeaderboard();
            }
        }
    },
    
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        let html = `
            <div class="friends-search">
                <input type="search" id="friendsSearchInput" class="friends-search-input" 
                       placeholder="поиск: введите id или ник друга" autocomplete="off">
            </div>
            <div class="friends-list-container" id="friendsTabList">
        `;
        
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">загрузка друзей...</div></div>`;
        } else if (this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">у вас пока нет друзей</div></div>`;
        } else {
            this.filteredFriends.forEach(friend => {
                html += `
                <div class="friend-row" onclick="Team.showFriendProfile('${friend.player_id}')">
                    <div class="friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${friend.nick?.[0] || '?'}</span>`}
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
        
        searchInput.oninput = (e) => {
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const query = e.target.value.trim().toLowerCase();
                if (!query) {
                    this.filteredFriends = [...this.friendsList];
                } else {
                    this.filteredFriends = this.friendsList.filter(f => 
                        f.nick?.toLowerCase().includes(query) || 
                        f.player_id?.toLowerCase().includes(query)
                    );
                }
                this.updateFriendsTabList();
            }, 300);
        };
    },
    
    updateFriendsTabList() {
        const container = document.getElementById('friendsTabList');
        if (!container) return;
        
        if (!this.filteredFriends.length) {
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">друзья не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredFriends.forEach(friend => {
            html += `
            <div class="friend-row" onclick="Team.showFriendProfile('${friend.player_id}')">
                <div class="friend-avatar">${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${friend.nick?.[0] || '?'}</span>`}</div>
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
        
        if (!this.isLeaderboardLoaded && this.leaderboard.length === 0) {
            content.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">загрузка лидерборда...</div></div>`;
            return;
        }
        
        if (this.leaderboard.length === 0) {
            content.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">пока нет игроков</div></div>`;
            return;
        }
        
        let html = '';
        this.leaderboard.forEach((player, index) => {
            const place = index + 1;
            const isCurrent = player.player_id === this.currentPlayerId;
            const placeText = place === 1 ? '#1' : place === 2 ? '#2' : place === 3 ? '#3' : `#${place}`;
            
            html += `
                <div class="friend-row ${isCurrent ? 'current-player' : ''}" 
                     onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="friend-avatar">
                        ${player.avatar ? `<img src="${player.avatar}">` : `<span>${player.nick?.[0] || '?'}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">${placeText}</span>
                        <span class="friend-name">${player.nick || 'Без имени'}</span>
                    </div>
                    ${isCurrent ? '<span class="leaderboard-badge">ВЫ</span>' : '<span class="friend-arrow">→</span>'}
                </div>
            `;
        });
        
        content.innerHTML = html;
        this.injectLeaderboardStyles();
    },
    
    injectLeaderboardStyles() {
        if (document.getElementById('leaderboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'leaderboard-styles';
        style.textContent = `
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
        if (window.App) App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
    },
    
    showPlayerProfile(playerId) {
        if (window.App) App.showAlert(`Профиль игрока ${playerId}\n(функция в разработке)`);
    },
    
    goBack() {
        if (window.App) App.showScreen('profileScreen', true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Team.js загружен');
    setTimeout(() => Team.init(), 50);
});

window.Team = Team;

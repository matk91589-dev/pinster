// ============================================
// КОМАНДА - С ЛИДЕРБОРДОМ И ДРУЗЬЯМИ
// ============================================

const Team = {
    currentTab: 'friends',
    allPlayers: [],
    friendsList: [],
    filteredFriends: [],
    telegramId: null,
    searchTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isInitialized: false,
    isFriendsLoaded: false,
    isPlayersLoaded: false,
    leaderboard: [],
    currentPlayerId: null,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
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
        
        this.loadFromCache();
        
        setTimeout(() => {
            this.loadFriendsList();
            this.loadLeaderboard();
        }, 500);
    },
    
    loadFromCache() {
        const cachedFriends = localStorage.getItem(`team_friends_${this.telegramId}`);
        const cachedLeaderboard = localStorage.getItem(`team_leaderboard_${this.telegramId}`);
        
        if (cachedFriends) {
            try {
                const friends = JSON.parse(cachedFriends);
                if (friends && friends.length > 0) {
                    this.friendsList = friends;
                    this.filteredFriends = [...friends];
                    this.isFriendsLoaded = true;
                    console.log('✅ Друзья из кэша Team:', friends.length);
                }
            } catch (e) {
                console.error('Ошибка парсинга кэша друзей:', e);
            }
        }
        
        if (cachedLeaderboard) {
            try {
                const leaderboard = JSON.parse(cachedLeaderboard);
                if (leaderboard && leaderboard.length > 0) {
                    this.leaderboard = leaderboard;
                    this.isPlayersLoaded = true;
                    console.log('✅ Лидерборд из кэша Team:', leaderboard.length);
                }
            } catch (e) {
                console.error('Ошибка парсинга кэша лидерборда:', e);
            }
        }
        
        if (document.getElementById('teamScreen')?.classList.contains('active')) {
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            } else {
                this.renderLeaderboardTab();
            }
        }
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
        if (!this.telegramId) {
            console.warn('⚠️ Нет telegram_id, пробуем получить снова');
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
            if (this.friendsList.length > 0 || this.isFriendsLoaded) {
                this.renderFriendsTab();
            } else {
                this.renderFriendsTab();
                this.loadFriendsList();
            }
        } else {
            if (this.leaderboard.length > 0 || this.isPlayersLoaded) {
                this.renderLeaderboardTab();
            } else {
                this.renderLeaderboardTab();
                this.loadLeaderboard();
            }
        }
        
        setTimeout(() => {
            this.loadFriendsList();
            this.loadLeaderboard();
        }, 100);
        
        if (window.Telegram?.WebApp?.HapticFeedback) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    },
    
    async loadFriendsList() {
        if (this.isFriendsLoaded && this.friendsList.length > 0) {
            console.log('📦 Друзья уже загружены');
            return;
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки друзей');
            return;
        }
        
        console.log('👥 Загрузка друзей с сервера...');
        
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                
                localStorage.setItem(`team_friends_${this.telegramId}`, JSON.stringify(this.friendsList));
                console.log('✅ Загружено друзей:', this.friendsList.length);
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
            }
            
            if (this.currentTab === 'friends' && document.getElementById('teamScreen')?.classList.contains('active')) {
                this.renderFriendsTab();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
        }
    },
    
    async loadLeaderboard() {
        if (this.isPlayersLoaded && this.leaderboard.length > 0) {
            console.log('📦 Лидерборд уже загружен');
            return;
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки лидерборда');
            return;
        }
        
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
            
            if (!response.ok) {
                console.warn(`⚠️ Сервер ответил ${response.status}, используем кэш`);
                if (this.leaderboard.length === 0) {
                    this.setMockLeaderboard();
                }
                return;
            }
            
            const data = await response.json();
            console.log('📦 Ответ лидерборда:', data);
            
            if (data.status === 'ok' && data.leaderboard && data.leaderboard.length > 0) {
                this.leaderboard = data.leaderboard;
                this.isPlayersLoaded = true;
                localStorage.setItem(`team_leaderboard_${this.telegramId}`, JSON.stringify(this.leaderboard));
                console.log('✅ Загружено лидеров:', this.leaderboard.length);
            } else {
                console.warn('⚠️ Нет данных лидерборда, используем кэш или заглушку');
                if (this.leaderboard.length === 0) {
                    this.setMockLeaderboard();
                }
            }
            
            if (this.currentTab === 'leaderboard' && document.getElementById('teamScreen')?.classList.contains('active')) {
                this.renderLeaderboardTab();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лидерборда:', error);
            if (this.leaderboard.length === 0) {
                this.setMockLeaderboard();
            }
        }
    },
    
    setMockLeaderboard() {
        console.log('📊 Устанавливаем тестовый лидерборд');
        this.leaderboard = [
            { player_id: '34035931', nick: 'wwwwwwwwww', avatar: null, pingcoins: 60999 },
            { player_id: '12345678', nick: 'АНГЕЛ', avatar: null, pingcoins: 45000 },
            { player_id: '87654321', nick: 'ГРОМ', avatar: null, pingcoins: 32000 },
            { player_id: '11111111', nick: 'КАЙФОЛОВ', avatar: null, pingcoins: 28000 },
            { player_id: '22222222', nick: 'СНАЙПЕР', avatar: null, pingcoins: 25000 },
            { player_id: '33333333', nick: 'ТАНК', avatar: null, pingcoins: 22000 },
        ];
        this.isPlayersLoaded = true;
        localStorage.setItem(`team_leaderboard_${this.telegramId}`, JSON.stringify(this.leaderboard));
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
        
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">загрузка друзей...</div></div>`;
        } else if (!this.filteredFriends || this.filteredFriends.length === 0) {
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
        
        if (!this.isPlayersLoaded && this.leaderboard.length === 0) {
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
                <div class="leaderboard-row ${isCurrent ? 'current-player' : ''}" 
                     onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="leaderboard-place">${placeText}</div>
                    <div class="leaderboard-avatar">
                        ${player.avatar 
                            ? `<img src="${player.avatar}" alt="avatar">` 
                            : `<div class="avatar-placeholder">${player.nick?.[0] || '?'}</div>`
                        }
                    </div>
                    <div class="leaderboard-info">
                        <span class="leaderboard-nick">${player.nick || 'Без имени'}</span>
                        <span class="leaderboard-id">ID: ${player.player_id}</span>
                    </div>
                    ${isCurrent ? '<span class="leaderboard-badge">ВЫ</span>' : ''}
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
            .leaderboard-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(26, 29, 36, 0.5);
                border-radius: 12px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 3px solid transparent;
            }
            .leaderboard-row:hover {
                background: rgba(255, 85, 0, 0.1);
                transform: translateX(2px);
            }
            .leaderboard-row.current-player {
                background: rgba(255, 85, 0, 0.15);
                border-left-color: #FF5500;
            }
            .leaderboard-place {
                width: 36px;
                font-size: 14px;
                font-weight: 700;
                color: #FF5500;
                text-align: center;
            }
            .leaderboard-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                overflow: hidden;
                background: #1A1D24;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .leaderboard-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .leaderboard-avatar .avatar-placeholder {
                font-size: 18px;
                font-weight: 600;
                color: #fff;
            }
            .leaderboard-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .leaderboard-nick {
                font-size: 16px;
                font-weight: 600;
                color: #fff;
            }
            .leaderboard-row.current-player .leaderboard-nick {
                color: #FF5500;
            }
            .leaderboard-id {
                font-size: 11px;
                color: #8E97A6;
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
            localStorage.setItem(`team_friends_${this.telegramId}`, JSON.stringify(this.friendsList));
            
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

// ============================================
// КОМАНДА - БЫСТРАЯ ЗАГРУЗКА + СТИЛЬНЫЙ СКРОЛЛ
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
    dataLoaded: false,

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
        
        // Добавляем стили скроллбара сразу
        this.injectScrollbarStyles();
        
        // Загружаем всё параллельно и сразу
        this.loadAllData();
    },
    
    injectScrollbarStyles() {
        if (document.getElementById('team-scroll-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'team-scroll-styles';
        style.textContent = `
            .friends-list-container::-webkit-scrollbar,
            .team-list::-webkit-scrollbar {
                width: 3px;
            }
            .friends-list-container::-webkit-scrollbar-track,
            .team-list::-webkit-scrollbar-track {
                background: #2A2F3A;
                border-radius: 10px;
            }
            .friends-list-container::-webkit-scrollbar-thumb,
            .team-list::-webkit-scrollbar-thumb {
                background: #FF5500;
                border-radius: 10px;
            }
            .friends-list-container,
            .team-list {
                scrollbar-width: thin;
                scrollbar-color: #FF5500 #2A2F3A;
            }
            
            /* Центрирование пустых состояний */
            .empty-friends {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
                text-align: center;
                padding: 40px 20px;
            }
            .empty-friends-text {
                color: #8E97A6;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    },
    
    async loadAllData() {
        if (this.dataLoaded) return;
        
        console.log('🔥 Параллельная загрузка всех данных...');
        
        // Загружаем друзей и лидерборд параллельно
        const promises = [];
        
        if (!this.isFriendsLoaded && !this.isLoadingFriends) {
            promises.push(this.loadFriendsList());
        }
        if (!this.isLeaderboardLoaded && !this.isLoadingLeaderboard) {
            promises.push(this.loadLeaderboard());
        }
        
        await Promise.all(promises);
        this.dataLoaded = true;
        console.log('✅ Все данные загружены');
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
        
        if (!this.telegramId) {
            if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
            } else if (window.Profile && Profile.getTelegramId) {
                this.telegramId = Profile.getTelegramId();
            }
            this.currentPlayerId = localStorage.getItem('player_id');
        }
        
        // Показываем мгновенно то, что уже загружено
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
        
        // Сначала показываем кэш если есть
        const cached = localStorage.getItem('team_friends_cache');
        if (cached && !this.isFriendsLoaded) {
            try {
                const cachedData = JSON.parse(cached);
                if (cachedData && cachedData.length) {
                    this.friendsList = cachedData;
                    this.filteredFriends = [...this.friendsList];
                    this.isFriendsLoaded = true;
                    if (this.currentTab === 'friends') {
                        this.renderFriendsTab();
                    }
                    console.log('✅ Друзья из кэша:', this.friendsList.length);
                }
            } catch(e) {}
        }
        
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
                localStorage.setItem('team_friends_cache', JSON.stringify(this.friendsList));
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
            if (!this.isFriendsLoaded) {
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
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
        
        // Сначала показываем кэш если есть
        const cached = localStorage.getItem('team_leaderboard_cache');
        if (cached && !this.isLeaderboardLoaded) {
            try {
                const cachedData = JSON.parse(cached);
                if (cachedData && cachedData.length) {
                    this.leaderboard = cachedData;
                    this.filteredLeaderboard = [...this.leaderboard];
                    this.isLeaderboardLoaded = true;
                    if (this.currentTab === 'leaderboard') {
                        this.renderLeaderboardTab();
                    }
                    console.log('✅ Лидерборд из кэша:', this.leaderboard.length);
                }
            } catch(e) {}
        }
        
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
                localStorage.setItem('team_leaderboard_cache', JSON.stringify(this.leaderboard));
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
            if (!this.isLeaderboardLoaded) {
                this.leaderboard = [];
                this.filteredLeaderboard = [];
                this.isLeaderboardLoaded = true;
                if (this.currentTab === 'leaderboard') {
                    this.renderLeaderboardTab();
                }
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
        
        let html = `
            <div class="friends-search">
                <input type="search" id="leaderboardSearchInput" class="friends-search-input" 
                       placeholder="поиск: введите id или ник игрока" autocomplete="off">
            </div>
            <div class="friends-list-container" id="leaderboardTabList">
        `;
        
        if (!this.isLeaderboardLoaded && this.leaderboard.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">загрузка лидерборда...</div></div>`;
        } else if (this.leaderboard.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">пока нет игроков</div></div>`;
        } else {
            this.filteredLeaderboard.forEach((player) => {
                const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
                const place = originalIndex + 1;
                const isCurrent = player.player_id === this.currentPlayerId;
                
                html += `
                    <div class="friend-row ${isCurrent ? 'current-player-row' : ''}" onclick="Team.showPlayerProfile('${player.player_id}')">
                        <div class="friend-avatar">
                            ${player.avatar ? `<img src="${player.avatar}">` : `<span>${player.nick?.[0] || '?'}</span>`}
                        </div>
                        <div class="friend-info">
                            <span class="friend-id">ID: ${player.player_id}</span>
                            <span class="friend-name">${player.nick || 'Без имени'}</span>
                        </div>
                        <div class="leaderboard-right">
                            <span class="leaderboard-place">#${place}</span>
                            ${isCurrent ? '<span class="leaderboard-current-badge">вы</span>' : '<span class="friend-arrow leaderboard-arrow">→</span>'}
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        setTimeout(() => this.setupLeaderboardSearch(), 50);
        this.injectLeaderboardStyles();
    },
    
    setupLeaderboardSearch() {
        const searchInput = document.getElementById('leaderboardSearchInput');
        if (!searchInput) return;
        
        searchInput.oninput = (e) => {
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                const query = e.target.value.trim().toLowerCase();
                if (!query) {
                    this.filteredLeaderboard = [...this.leaderboard];
                } else {
                    this.filteredLeaderboard = this.leaderboard.filter(p => 
                        p.nick?.toLowerCase().includes(query) || 
                        p.player_id?.toLowerCase().includes(query)
                    );
                }
                this.updateLeaderboardTabList();
            }, 300);
        };
    },
    
    updateLeaderboardTabList() {
        const container = document.getElementById('leaderboardTabList');
        if (!container) return;
        
        if (!this.filteredLeaderboard.length) {
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">игроки не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredLeaderboard.forEach((player) => {
            const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
            const place = originalIndex + 1;
            const isCurrent = player.player_id === this.currentPlayerId;
            
            html += `
                <div class="friend-row ${isCurrent ? 'current-player-row' : ''}" onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="friend-avatar">
                        ${player.avatar ? `<img src="${player.avatar}">` : `<span>${player.nick?.[0] || '?'}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${player.player_id}</span>
                        <span class="friend-name">${player.nick || 'Без имени'}</span>
                    </div>
                    <div class="leaderboard-right">
                        <span class="leaderboard-place">#${place}</span>
                        ${isCurrent ? '<span class="leaderboard-current-badge">вы</span>' : '<span class="friend-arrow leaderboard-arrow">→</span>'}
                    </div>
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
            .leaderboard-right {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-left: auto;
                flex-shrink: 0;
                min-width: 60px;
                justify-content: flex-end;
            }
            .leaderboard-place {
                font-size: 13px;
                font-weight: 500;
                color: #8E97A6;
                min-width: 28px;
                text-align: right;
            }
            .leaderboard-current-badge {
                color: #FF5500;
                font-size: 12px;
                font-weight: 500;
                opacity: 0.9;
                min-width: 28px;
                text-align: right;
            }
            .friend-arrow {
                font-size: 18px;
                color: #8E97A6;
                font-weight: 300;
                min-width: 28px;
                text-align: right;
            }
            .leaderboard-arrow {
                color: #FF5500 !important;
            }
            .current-player-row {
                background: rgba(255, 85, 0, 0.08);
                margin: 0 -16px;
                padding: 0 16px;
                border-left: 3px solid #FF5500;
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
    Team.init();
});

window.Team = Team;

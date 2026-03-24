// ============================================
// КОМАНДА - С КЭШИРОВАНИЕМ И МГНОВЕННОЙ ЗАГРУЗКОЙ
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

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Team.init() запущен');
        
        // Получаем Telegram ID
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
        } else if (window.Profile && Profile.getTelegramId) {
            this.telegramId = Profile.getTelegramId();
        }
        
        console.log('Team Telegram ID:', this.telegramId);
        
        if (!this.telegramId) return;
        
        // Сначала грузим из кэша
        this.loadFromCache();
        
        // Фоново обновляем с сервера
        setTimeout(() => {
            this.loadFriendsList();
            this.loadAllPlayers();
        }, 500);
    },
    
    // ✅ ЗАГРУЗКА ИЗ КЭША (мгновенно)
    loadFromCache() {
        const cachedFriends = localStorage.getItem(`team_friends_${this.telegramId}`);
        const cachedPlayers = localStorage.getItem(`team_players_${this.telegramId}`);
        
        let updated = false;
        
        if (cachedFriends) {
            try {
                const friends = JSON.parse(cachedFriends);
                if (friends && friends.length > 0) {
                    this.friendsList = friends;
                    this.filteredFriends = [...friends];
                    this.isFriendsLoaded = true;
                    console.log('✅ Друзья из кэша Team:', friends.length);
                    updated = true;
                }
            } catch (e) {
                console.error('Ошибка парсинга кэша друзей Team:', e);
            }
        }
        
        if (cachedPlayers) {
            try {
                const players = JSON.parse(cachedPlayers);
                if (players && players.length > 0) {
                    this.allPlayers = players;
                    this.isPlayersLoaded = true;
                    console.log('✅ Игроки из кэша Team:', players.length);
                    updated = true;
                }
            } catch (e) {
                console.error('Ошибка парсинга кэша игроков Team:', e);
            }
        }
        
        // Если открыт экран, отрисовываем
        if (updated && document.getElementById('teamScreen')?.classList.contains('active')) {
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            } else {
                this.renderSearchTab();
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
        if (teamScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            teamScreen.classList.add('active');
            
            // Если данные уже есть - сразу показываем
            if (this.currentTab === 'friends') {
                if (this.friendsList.length > 0 || this.isFriendsLoaded) {
                    this.renderFriendsTab();
                } else {
                    this.renderFriendsTab(); // покажет загрузку
                    this.loadFriendsList();
                }
            } else {
                if (this.allPlayers.length > 0 || this.isPlayersLoaded) {
                    this.renderSearchTab();
                } else {
                    this.renderSearchTab(); // покажет загрузку
                    this.loadAllPlayers();
                }
            }
            
            // Фоново обновляем
            setTimeout(() => {
                this.loadFriendsList();
                this.loadAllPlayers();
            }, 100);
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
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
        
        console.log('👥 Team: загрузка друзей с сервера...');
        
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
            console.log('📦 Team: ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                
                // Сохраняем в кэш
                localStorage.setItem(`team_friends_${this.telegramId}`, JSON.stringify(this.friendsList));
                console.log('✅ Team: загружено друзей:', this.friendsList.length);
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
            }
            
            if (this.currentTab === 'friends' && document.getElementById('teamScreen')?.classList.contains('active')) {
                this.renderFriendsTab();
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Таймаут загрузки друзей Team (3 сек)');
            } else {
                console.error('❌ Ошибка загрузки друзей Team:', error);
            }
        }
    },
    
    async loadAllPlayers() {
        if (this.isPlayersLoaded && this.allPlayers.length > 0) {
            console.log('📦 Игроки уже загружены');
            return;
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки игроков');
            return;
        }
        
        console.log('📥 Team: загрузка всех игроков...');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/users/all`, {
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
            console.log('📦 Team ответ (игроки):', data);
            
            if (data.status === 'ok' && data.users) {
                this.allPlayers = data.users;
                this.isPlayersLoaded = true;
                
                // Сохраняем в кэш
                localStorage.setItem(`team_players_${this.telegramId}`, JSON.stringify(this.allPlayers));
                console.log('✅ Team: загружено игроков:', this.allPlayers.length);
            }
            
            if (this.currentTab === 'search' && document.getElementById('teamScreen')?.classList.contains('active')) {
                this.renderSearchTab();
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Таймаут загрузки игроков Team (3 сек)');
            } else {
                console.error('❌ Ошибка загрузки игроков Team:', error);
            }
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
    
    // ============================================
    // ВКЛАДКА ДРУЗЕЙ
    // ============================================
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
        
        // Показываем загрузку если нет данных
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `
                <div class="empty-friends">
                    <div class="empty-friends-text">⏳ загрузка друзей...</div>
                </div>
            `;
        } else if (!this.filteredFriends || this.filteredFriends.length === 0) {
            html += `
                <div class="empty-friends">
                    <div class="empty-friends-text">у вас пока нет друзей</div>
                </div>
            `;
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
                </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        setTimeout(() => this.setupFriendsSearch(), 50);
    },
    
    setupFriendsSearch() {
        const searchInput = document.getElementById('friendsSearchInput');
        if (!searchInput) return;
        
        console.log('✅ Поле поиска друзей в Team настроено');
        searchInput.removeAttribute('readonly');
        searchInput.removeAttribute('disabled');
        
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        
        searchInput.oninput = null;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            
            this.searchTimeout = setTimeout(() => {
                this.searchFriends(query);
            }, 300);
        });
    },
    
    searchFriends(query) {
        console.log('🔍 Team: поиск по друзьям:', query);
        
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
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">друзья не найдены</div>
                </div>
            `;
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
            </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // ============================================
    // ВКЛАДКА ПОИСКА
    // ============================================
    renderSearchTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        const searchDiv = document.createElement('div');
        searchDiv.className = 'players-search';
        searchDiv.innerHTML = `
            <input type="search" 
                   id="teamSearchInput" 
                   class="players-search-input" 
                   placeholder="поиск: введите id или ник игрока"
                   autocomplete="off">
        `;
        
        const listDiv = document.createElement('div');
        listDiv.className = 'players-list';
        listDiv.id = 'teamSearchResults';
        
        // Показываем загрузку или данные из кэша
        if (!this.isPlayersLoaded && this.allPlayers.length === 0) {
            listDiv.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">⏳ загрузка игроков...</div>
                </div>
            `;
        } else if (this.allPlayers.length > 0) {
            this.renderSearchResults(this.allPlayers, listDiv);
        } else {
            listDiv.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">игроки не найдены</div>
                </div>
            `;
        }
        
        content.innerHTML = '';
        content.appendChild(searchDiv);
        content.appendChild(listDiv);
        
        this.injectForcedStyles();
        
        const input = document.getElementById('teamSearchInput');
        if (input) {
            this.attachSearchHandler(input);
        }
        
        // Если еще нет данных, грузим
        if (this.allPlayers.length === 0 && !this.isPlayersLoaded) {
            this.loadAllPlayers();
        }
    },
    
    injectForcedStyles() {
        if (document.getElementById('forced-search-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'forced-search-styles';
        style.textContent = `
            .players-list .player-row {
                min-height: 58px !important;
                padding: 8px 0 !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                background: transparent !important;
                cursor: pointer !important;
            }
            .players-list .player-avatar {
                width: 38px !important;
                height: 38px !important;
                border-radius: 50% !important;
                background: #1A1D24 !important;
                flex-shrink: 0 !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .players-list .player-id {
                font-size: 10px !important;
                color: #FF5500 !important;
                font-weight: 600 !important;
                letter-spacing: 0.3px !important;
                margin-bottom: 2px !important;
                font-family: 'Montserrat', sans-serif !important;
                line-height: normal !important;
            }
            .players-list .player-nick {
                font-size: 15px !important;
                font-weight: 600 !important;
                color: #ffffff !important;
                font-family: 'Montserrat', sans-serif !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            .players-list .player-arrow {
                color: #FF5500 !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                margin-left: auto !important;
                padding-right: 4px !important;
                cursor: pointer !important;
            }
            .players-search-input {
                font-family: 'Montserrat', sans-serif !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                line-height: 28px !important;
            }
            .players-search-input::placeholder {
                font-family: 'Montserrat', sans-serif !important;
                font-size: 13px !important;
                font-weight: 400 !important;
                color: #9BA1B0 !important;
                opacity: 0.8 !important;
            }
        `;
        document.head.appendChild(style);
    },
    
    attachSearchHandler(input) {
        console.log('✅ Инпут поиска активирован');
        
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
        
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        
        input.oninput = (e) => {
            const query = e.target.value.trim();
            
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            
            if (query === '') {
                this.renderSearchResults(this.allPlayers);
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.searchPlayers(query);
            }, 300);
        };
    },
    
    renderSearchResults(players, container = null) {
        const targetContainer = container || document.getElementById('teamSearchResults');
        if (!targetContainer) return;
        
        if (!players || players.length === 0) {
            targetContainer.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">игроки не найдены</div>
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
        
        targetContainer.innerHTML = html;
    },
    
    async searchPlayers(query) {
        if (!query) {
            this.renderSearchResults(this.allPlayers);
            return;
        }
        
        console.log('🔍 Поиск игроков:', query);
        
        // Сначала ищем в кэше
        const cachedResults = this.allPlayers.filter(player => {
            const nickMatch = player.nick?.toLowerCase().includes(query.toLowerCase());
            const idMatch = player.player_id?.toLowerCase().includes(query.toLowerCase());
            return nickMatch || idMatch;
        });
        
        if (cachedResults.length > 0) {
            this.renderSearchResults(cachedResults);
        } else {
            const container = document.getElementById('teamSearchResults');
            if (container) {
                container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">⏳ поиск...</div></div>`;
            }
        }
        
        // Запрос на сервер
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/users/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    query: query
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Результаты поиска:', data);
            
            if (data.status === 'ok' && data.users) {
                this.renderSearchResults(data.users);
            } else {
                if (cachedResults.length === 0) {
                    this.renderSearchResults([]);
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Таймаут поиска игроков (3 сек)');
            } else {
                console.error('❌ Ошибка поиска:', error);
            }
            if (cachedResults.length === 0) {
                this.renderSearchResults([]);
            }
        }
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
    
    openTelegramChat(playerId) {
        console.log('📨 Открыть чат с игроком:', playerId);
        if (window.App) {
            App.showAlert(`Чат с игроком ${playerId}\n(функция в разработке)`);
        } else {
            alert(`Чат с игроком ${playerId}\n(функция в разработке)`);
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
                App.showAlert(`Друг удален`);
            } else {
                alert(`Друг удален`);
            }
        }
    },
    
    showRequests() {
        if (window.App) {
            App.showAlert('📨 Запросы в друзья\n(функция в разработке)');
        } else {
            alert('📨 Запросы в друзья (функция в разработке)');
        }
    },
    
    goBack() {
        if (window.App && App.showScreen) {
            App.showScreen('profileScreen', true);
        }
    },
    
    // ✅ Добавить друга (из поиска)
    addFriend(friend) {
        if (this.friendsList.some(f => f.player_id === friend.player_id)) {
            return false;
        }
        
        this.friendsList.unshift(friend);
        this.filteredFriends = [...this.friendsList];
        localStorage.setItem(`team_friends_${this.telegramId}`, JSON.stringify(this.friendsList));
        
        if (this.currentTab === 'friends') {
            this.renderFriendsTab();
        }
        return true;
    }
};

// ✅ ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('Team.js загружен');
    setTimeout(() => Team.init(), 100);
});

window.Team = Team;

// ============================================
// КОМАНДА - С ДРУЗЬЯМИ И ПОИСКОМ
// ============================================

const Team = {
    currentTab: 'friends',
    allPlayers: [],
    friendsList: [],
    filteredFriends: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        console.log('Team.init() запущен');
        
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
            
            this.loadAllPlayers();
            this.syncFriendsList();
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    },

    syncFriendsList() {
        if (window.Friends && window.Friends.friendsList) {
            this.friendsList = window.Friends.friendsList;
            this.filteredFriends = [...this.friendsList];
            console.log('✅ Team: друзья синхронизированы, количество:', this.friendsList.length);
            
            if (this.currentTab === 'friends') {
                this.renderFriendsTab();
            }
        } else {
            console.log('⏳ Team: Friends еще не загружен, пробуем через секунду...');
            setTimeout(() => this.syncFriendsList(), 500);
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
                if (this.currentTab === 'search') {
                    this.renderSearchResults(this.allPlayers);
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
    
    // ============================================
    // ОБНОВЛЕННАЯ ВКЛАДКА ДРУЗЕЙ
    // ============================================
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        if (window.Friends && window.Friends.friendsList) {
            this.friendsList = window.Friends.friendsList;
            this.filteredFriends = [...this.friendsList];
        }
        
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
        
        if (!this.filteredFriends || this.filteredFriends.length === 0) {
            html += `
                <div class="empty-friends">
                    <div class="empty-friends-text">🤷 у вас пока нет друзей</div>
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
                    <div class="friend-actions">
                        <!-- Кнопка профиля - НЕЗАЛИТАЯ -->
                        <button class="friend-profile-btn" onclick="event.stopPropagation(); Team.showFriendProfile('${friend.player_id}')">
                            <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#000000"/>
                                <circle cx="12" cy="8" r="3.5" stroke="#ffffff" stroke-width="1.8" fill="none"/>
                                <path d="M5.5 16 C5.5 13.8, 8.5 12.5, 12 12.5 C15.5 12.5, 18.5 13.8, 18.5 16 C18.5 17.8, 16.5 19, 12 19 C7.5 19, 5.5 17.8, 5.5 16" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <!-- Кнопка Telegram -->
                        <button class="friend-tg-btn" onclick="event.stopPropagation(); Team.openTelegramChat('${friend.player_id}')">
                            <svg width="26" height="26" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="120" cy="120" r="120" fill="#000000"/>
                                <path fill="#FFFFFF" d="M180.2 63.8L48.5 113.5C42.6 115.8 42.7 119.1 47.5 120.6L81.3 131.2L155.6 86.3C158.9 84.4 161.9 85.4 159.4 87.6L99.5 140.9L97.3 173.2C100.6 173.2 102.1 171.6 103.9 169.7L120.2 153.6L154.1 178.4C160.4 181.9 164.9 180.1 166.5 172.5L188.8 75.5C191.2 66.1 185.1 61.9 180.2 63.8Z"/>
                            </svg>
                        </button>
                        <!-- Кнопка удаления -->
                        <button class="friend-delete-btn" onclick="event.stopPropagation(); Team.deleteFriend('${friend.player_id}')">
                            <svg width="26" height="26" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#000000"/>
                                <g stroke="white" stroke-width="2" stroke-linecap="round" fill="none">
                                    <path d="M14 18H34"/>
                                    <path d="M20 18V15C20 14.4477 20.4477 14 21 14H27C27.5523 14 28 14.4477 28 15V18"/>
                                    <path d="M18 18L19 32C19.0523 32.5523 19.4477 33 20 33H28C28.5523 33 28.9477 32.5523 29 32L30 18"/>
                                    <path d="M22 22V29"/>
                                    <path d="M26 22V29"/>
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        this.setupFriendsSearch();
    },
    
    setupFriendsSearch() {
        setTimeout(() => {
            const searchInput = document.getElementById('friendsSearchInput');
            if (!searchInput) {
                console.log('❌ Поле поиска друзей в Team не найдено');
                return;
            }
            
            console.log('✅ Поле поиска друзей в Team настроено');
            searchInput.removeAttribute('readonly');
            searchInput.removeAttribute('disabled');
            
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                
                this.searchTimeout = setTimeout(() => {
                    this.searchFriends(query);
                }, 300);
            });
        }, 100);
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
        if (!container) {
            console.log('❌ Контейнер friendsTabList не найден');
            return;
        }
        
        if (!this.filteredFriends || this.filteredFriends.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">🤷 друзья не найдены</div>
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
                <div class="friend-actions">
                    <!-- Кнопка профиля - НЕЗАЛИТАЯ -->
                    <button class="friend-profile-btn" onclick="event.stopPropagation(); Team.showFriendProfile('${friend.player_id}')">
                        <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#000000"/>
                            <circle cx="12" cy="8" r="3.5" stroke="#ffffff" stroke-width="1.8" fill="none"/>
                            <path d="M5.5 16 C5.5 13.8, 8.5 12.5, 12 12.5 C15.5 12.5, 18.5 13.8, 18.5 16 C18.5 17.8, 16.5 19, 12 19 C7.5 19, 5.5 17.8, 5.5 16" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <!-- Кнопка Telegram -->
                    <button class="friend-tg-btn" onclick="event.stopPropagation(); Team.openTelegramChat('${friend.player_id}')">
                        <svg width="26" height="26" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="120" cy="120" r="120" fill="#000000"/>
                            <path fill="#FFFFFF" d="M180.2 63.8L48.5 113.5C42.6 115.8 42.7 119.1 47.5 120.6L81.3 131.2L155.6 86.3C158.9 84.4 161.9 85.4 159.4 87.6L99.5 140.9L97.3 173.2C100.6 173.2 102.1 171.6 103.9 169.7L120.2 153.6L154.1 178.4C160.4 181.9 164.9 180.1 166.5 172.5L188.8 75.5C191.2 66.1 185.1 61.9 180.2 63.8Z"/>
                        </svg>
                    </button>
                    <!-- Кнопка удаления -->
                    <button class="friend-delete-btn" onclick="event.stopPropagation(); Team.deleteFriend('${friend.player_id}')">
                        <svg width="26" height="26" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="24" fill="#000000"/>
                            <g stroke="white" stroke-width="2" stroke-linecap="round" fill="none">
                                <path d="M14 18H34"/>
                                <path d="M20 18V15C20 14.4477 20.4477 14 21 14H27C27.5523 14 28 14.4477 28 15V18"/>
                                <path d="M18 18L19 32C19.0523 32.5523 19.4477 33 20 33H28C28.5523 33 28.9477 32.5523 29 32L30 18"/>
                                <path d="M22 22V29"/>
                                <path d="M26 22V29"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = html;
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
    
    // ============================================
    // МЕТОДЫ ДЛЯ РАБОТЫ С ДРУЗЬЯМИ
    // ============================================
    showFriendProfile(playerId) {
        console.log('👤 Профиль друга:', playerId);
        alert(`Профиль друга ${playerId} (будет позже)`);
    },
    
    showPlayerProfile(playerId) {
        console.log('👤 Профиль игрока:', playerId);
        alert(`Профиль игрока ${playerId} (будет позже)`);
    },
    
    openTelegramChat(playerId) {
        console.log('📨 Открыть чат с другом:', playerId);
        alert(`Чат с игроком ${playerId} (будет позже)`);
    },
    
    deleteFriend(playerId) {
        console.log('🗑️ Удалить друга:', playerId);
        if (confirm('Удалить пользователя из друзей?')) {
            alert(`Удаление друга ${playerId} (будет позже)`);
        }
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

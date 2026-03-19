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
            
            // Загружаем всё параллельно
            Promise.all([
                this.loadAllPlayers(),
                this.syncFriendsList()
            ]).then(() => {
                console.log('✅ Team: все данные загружены');
            });
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }
    },

    syncFriendsList() {
        return new Promise((resolve) => {
            if (window.Friends && window.Friends.friendsList) {
                this.friendsList = window.Friends.friendsList;
                this.filteredFriends = [...this.friendsList];
                console.log('✅ Team: друзья синхронизированы, количество:', this.friendsList.length);
                
                if (this.currentTab === 'friends') {
                    this.renderFriendsTab();
                }
                resolve();
            } else {
                console.log('⏳ Team: Friends еще не загружен, пробуем...');
                // Пробуем несколько раз с интервалом
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (window.Friends && window.Friends.friendsList) {
                        this.friendsList = window.Friends.friendsList;
                        this.filteredFriends = [...this.friendsList];
                        console.log('✅ Team: друзья синхронизированы после проверки');
                        
                        if (this.currentTab === 'friends') {
                            this.renderFriendsTab();
                        }
                        clearInterval(checkInterval);
                        resolve();
                    } else if (attempts > 10) {
                        console.log('⚠️ Team: не удалось загрузить друзей');
                        this.friendsList = [];
                        this.filteredFriends = [];
                        if (this.currentTab === 'friends') {
                            this.renderFriendsTab();
                        }
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
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
                    this.renderSearchTab();
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
    // ВКЛАДКА ДРУЗЕЙ
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
        
        // Сразу настраиваем поиск
        setTimeout(() => this.setupFriendsSearch(), 0);
    },
    
    setupFriendsSearch() {
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
    // ВКЛАДКА ПОИСКА - МАКСИМАЛЬНО БЫСТРЫЙ ОТКЛИК
    // ============================================
    renderSearchTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        // Создаем DOM сразу
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
        listDiv.innerHTML = `
            <div class="empty-friends">
                <div class="empty-friends-text">ожидание загрузки ...</div>
            </div>
        `;
        
        // Очищаем и добавляем
        content.innerHTML = '';
        content.appendChild(searchDiv);
        content.appendChild(listDiv);
        
        // Добавляем принудительные стили прямо в head
        this.injectForcedStyles();
        
        // Сразу настраиваем инпут (без setTimeout)
        const input = document.getElementById('teamSearchInput');
        if (input) {
            this.attachSearchHandler(input);
        }
        
        // Если игроки уже загружены, показываем их
        if (this.allPlayers && this.allPlayers.length > 0) {
            this.renderSearchResults(this.allPlayers);
        } else {
            // Если нет, загружаем
            this.loadAllPlayers().then(() => {
                if (this.allPlayers && this.allPlayers.length > 0) {
                    this.renderSearchResults(this.allPlayers);
                }
            });
        }
    },
    
    // Метод для принудительных стилей
    injectForcedStyles() {
        // Проверяем, не добавляли ли уже
        if (document.getElementById('forced-search-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'forced-search-styles';
        style.textContent = `
            /* ПРИНУДИТЕЛЬНЫЕ СТИЛИ - перебивают всё */
            .players-list .player-row {
                min-height: 58px !important;
                padding: 8px 0 !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                background: transparent !important;
            }
            .players-list .player-avatar {
                width: 38px !important;
                height: 38px !important;
                border-radius: 50% !important;
                background: #1A1D24 !important;
                flex-shrink: 0 !important;
                overflow: hidden !important;
            }
            /* ТОЧНО КАК В ДРУЗЬЯХ */
            .players-list .player-id {
                font-size: 10px !important;
                color: #FF5500 !important;
                font-weight: 600 !important;
                letter-spacing: 0.3px !important;
                margin-bottom: 2px !important;
                font-family: 'Montserrat', sans-serif !important;
                line-height: normal !important;
                text-transform: none !important;
                font-style: normal !important;
            }
            .players-list .player-nick {
                font-size: 15px !important;
                font-weight: 600 !important;
                color: #ffffff !important;
                font-family: 'Montserrat', sans-serif !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                line-height: normal !important;
            }
            .players-list .player-arrow {
                color: #FF5500 !important;
                font-size: 20px !important;
                font-weight: 600 !important;
                margin-left: auto !important;
                padding-right: 4px !important;
            }
            
            /* ФИКС ДЛЯ ПОЛЯ ПОИСКА */
            .players-search-input {
                font-family: 'Montserrat', sans-serif !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                letter-spacing: normal !important;
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
        console.log('✅ Принудительные стили для поиска добавлены');
    },
    
    attachSearchHandler(input) {
        console.log('✅ Инпут поиска активирован');
        
        // Убираем все атрибуты которые могут блокировать
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
        
        // Убираем старый обработчик
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Вешаем новый обработчик напрямую
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
    
    renderSearchResults(players) {
        const container = document.getElementById('teamSearchResults');
        if (!container) return;
        
        if (!players || players.length === 0) {
            container.innerHTML = `
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
        
        container.innerHTML = html;
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

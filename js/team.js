// ============================================
// КОМАНДА - С ПОИСКОМ В ЛИДЕРБОРДЕ
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
        setTimeout(() => {
            if (this.telegramId && !this.isFriendsLoaded && !this.isLoadingFriends) {
                this.loadFriendsList();
            }
            if (this.telegramId && !this.isLeaderboardLoaded && !this.isLoadingLeaderboard) {
                this.loadLeaderboard();
            }
        }, 300);
        
        // Добавляем стили
        this.injectStyles();
    },
    
    injectStyles() {
        if (document.getElementById('team-friend-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'team-friend-styles';
        style.textContent = `
            /* ===== ТРОЕТОЧИЕ/СТРЕЛОЧКА ===== */
            .friend-more {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 50%;
                font-size: 20px;
                color: var(--text-secondary);
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .friend-more:hover {
                background: rgba(255, 85, 0, 0.15);
                color: #FF5500;
            }
            
            /* ===== МЕНЮ ДЕЙСТВИЙ (как в Telegram) ===== */
            .friend-actions-menu {
                position: relative;
                z-index: 1000;
            }
            
            .friend-actions-popup {
                position: fixed;
                background: var(--surface);
                border-radius: 14px;
                width: 220px;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
                border: 1px solid var(--border-color);
                animation: menuFadeIn 0.15s ease;
            }
            
            @keyframes menuFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .friend-action-item {
                padding: 12px 16px;
                font-size: 15px;
                cursor: pointer;
                transition: background 0.2s;
                color: var(--text-primary);
            }
            
            .friend-action-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .friend-action-item.delete-btn {
                color: #FF3B30;
                border-top: 1px solid var(--border-color);
            }
            
            /* ===== ДИАЛОГ ПОДТВЕРЖДЕНИЯ (как в Telegram) ===== */
            .friend-delete-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .friend-delete-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .friend-delete-popup {
                position: relative;
                background: var(--surface);
                border-radius: 16px;
                width: 280px;
                padding: 20px;
                text-align: center;
                animation: dialogFadeIn 0.2s ease;
            }
            
            @keyframes dialogFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .friend-delete-title {
                font-size: 17px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 8px;
            }
            
            .friend-delete-message {
                font-size: 14px;
                color: var(--text-secondary);
                margin-bottom: 20px;
                line-height: 1.4;
            }
            
            .friend-delete-buttons {
                display: flex;
                gap: 12px;
            }
            
            .friend-delete-cancel,
            .friend-delete-confirm {
                flex: 1;
                padding: 10px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
            }
            
            .friend-delete-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
            }
            
            .friend-delete-confirm {
                background: #FF3B30;
                color: white;
            }
            
            .friend-delete-cancel:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .friend-delete-confirm:hover {
                background: #E3352A;
            }
            
            /* Стили для лидерборда */
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
        `;
        document.head.appendChild(style);
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
        // Всегда сбрасываем на вкладку "ДРУЗЬЯ"
        this.currentTab = 'friends';
        
        document.querySelectorAll('.team-tab').forEach(t => {
            t.classList.remove('active');
        });
        const friendsTab = document.querySelector('.team-tab:first-child');
        if (friendsTab) friendsTab.classList.add('active');
        
        if (window.App && App.showScreen) {
            App.showScreen('teamScreen', true);
        } else {
            const teamScreen = document.getElementById('teamScreen');
            if (teamScreen) {
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active');
                });
                teamScreen.classList.add('active');
            }
        }
        
        if (!this.telegramId) {
            if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
            } else if (window.Profile && Profile.getTelegramId) {
                this.telegramId = Profile.getTelegramId();
            }
            this.currentPlayerId = localStorage.getItem('player_id');
        }
        
        // Всегда показываем друзей
        this.renderFriendsTab();
        if (!this.isFriendsLoaded && !this.isLoadingFriends && this.telegramId) {
            this.loadFriendsList();
        }
    },
    
    async loadFriendsList() {
        if (!this.telegramId) return;
        if (this.isLoadingFriends) return;
        
        this.isLoadingFriends = true;
        console.log('👥 Загрузка тиммейтов...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Ответ тиммейтов:', data);
            
            if (data.status === 'ok' && data.friends && data.friends.length > 0) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                console.log('✅ Тиммейты загружены:', this.friendsList.length);
                this.renderFriendsTab();
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                this.renderFriendsTab();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки тиммейтов:', error);
            this.friendsList = [];
            this.filteredFriends = [];
            this.isFriendsLoaded = true;
            this.renderFriendsTab();
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
            const response = await fetch(`${this.BACKEND_URL}/api/users/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Ответ лидерборда:', data);
            
            if (data.status === 'ok' && data.leaderboard && data.leaderboard.length > 0) {
                this.leaderboard = data.leaderboard;
                this.filteredLeaderboard = [...this.leaderboard];
                this.isLeaderboardLoaded = true;
                console.log('✅ Лидерборд загружен:', this.leaderboard.length);
            } else {
                this.leaderboard = [];
                this.filteredLeaderboard = [];
                this.isLeaderboardLoaded = true;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки лидерборда:', error);
            this.leaderboard = [];
            this.filteredLeaderboard = [];
            this.isLeaderboardLoaded = true;
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
                       placeholder="поиск: введите id или ник тиммейта" autocomplete="off">
            </div>
            <div class="friends-list-container" id="friendsTabList">
        `;
        
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">загрузка тиммейтов...</div></div>`;
        } else if (this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">у вас пока нет тиммейтов</div></div>`;
        } else {
            this.filteredFriends.forEach(friend => {
                const firstChar = friend.nick && friend.nick.length > 0 ? friend.nick[0].toUpperCase() : '?';
                html += `
                <div class="friend-row" data-player-id="${friend.player_id}" data-username="${friend.username || ''}" data-nick="${friend.nick || 'Без имени'}">
                    <div class="friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${friend.player_id}</span>
                        <span class="friend-name">${friend.nick || 'Без имени'}</span>
                    </div>
                    <div class="friend-more" data-action="menu">⋯</div>
                </div>`;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        // Навешиваем обработчики
        document.querySelectorAll('#friendsTabList .friend-more').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const row = btn.closest('.friend-row');
                const playerId = row.dataset.playerId;
                const username = row.dataset.username;
                const nick = row.dataset.nick;
                this.showFriendActions(playerId, username, nick, btn);
            };
        });
        
        setTimeout(() => this.setupFriendsSearch(), 50);
    },
    
    showFriendActions(playerId, username, nick, btn) {
        const oldMenu = document.querySelector('.friend-actions-menu');
        if (oldMenu) oldMenu.remove();
        
        const rect = btn.getBoundingClientRect();
        const menuHeight = 110;
        const spaceBelow = window.innerHeight - rect.bottom;
        
        let top;
        if (spaceBelow < menuHeight) {
            top = rect.top - menuHeight - 5;
        } else {
            top = rect.bottom + 5;
        }
        
        const menu = document.createElement('div');
        menu.className = 'friend-actions-menu';
        menu.innerHTML = `
            <div class="friend-actions-popup" style="top: ${top}px; left: ${rect.right - 200}px;">
                <div class="friend-action-item write-btn">📩 Написать в Telegram</div>
                <div class="friend-action-item delete-btn">🗑️ Удалить из тиммейтов</div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
        
        menu.querySelector('.write-btn').onclick = () => {
            menu.remove();
            if (username) {
                window.open(`https://t.me/${username}`, '_blank');
            } else {
                if (window.App) App.showAlert('У пользователя нет username в Telegram');
            }
        };
        
        menu.querySelector('.delete-btn').onclick = () => {
            menu.remove();
            this.confirmDeleteFriend(playerId, nick);
        };
    },
    
    confirmDeleteFriend(playerId, nick) {
        const dialog = document.createElement('div');
        dialog.className = 'friend-delete-dialog';
        dialog.innerHTML = `
            <div class="friend-delete-overlay"></div>
            <div class="friend-delete-popup">
                <div class="friend-delete-title">Удалить тиммейта?</div>
                <div class="friend-delete-message">Вы уверены, что хотите удалить ${nick || 'этого игрока'} из списка тиммейтов?</div>
                <div class="friend-delete-buttons">
                    <button class="friend-delete-cancel">Отмена</button>
                    <button class="friend-delete-confirm">Удалить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('.friend-delete-overlay').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-cancel').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-confirm').onclick = () => {
            dialog.remove();
            this.removeFriend(playerId, nick);
        };
    },
    
    async removeFriend(friendId, nick) {
        if (!this.telegramId) return;
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    friend_player_id: friendId
                })
            });
            const data = await response.json();
            if (data.status === 'ok') {
                this.friendsList = this.friendsList.filter(f => f.player_id !== friendId);
                this.filteredFriends = [...this.friendsList];
                this.renderFriendsTab();
                if (window.App) App.showAlert('Тиммейт удалён');
            }
        } catch(e) {
            console.error('Ошибка удаления:', e);
            if (window.App) App.showAlert('Ошибка при удалении');
        }
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
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">тиммейты не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredFriends.forEach(friend => {
            const firstChar = friend.nick && friend.nick.length > 0 ? friend.nick[0].toUpperCase() : '?';
            html += `
            <div class="friend-row" data-player-id="${friend.player_id}" data-username="${friend.username || ''}" data-nick="${friend.nick || 'Без имени'}">
                <div class="friend-avatar">${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}</div>
                <div class="friend-info">
                    <span class="friend-id">ID: ${friend.player_id}</span>
                    <span class="friend-name">${friend.nick || 'Без имени'}</span>
                </div>
                <div class="friend-more" data-action="menu">⋯</div>
            </div>`;
        });
        container.innerHTML = html;
        
        document.querySelectorAll('#friendsTabList .friend-more').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const row = btn.closest('.friend-row');
                const playerId = row.dataset.playerId;
                const username = row.dataset.username;
                const nick = row.dataset.nick;
                this.showFriendActions(playerId, username, nick, btn);
            };
        });
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
                const firstChar = player.nick && player.nick.length > 0 ? player.nick[0].toUpperCase() : '?';
                
                html += `
                    <div class="friend-row" onclick="Team.showPlayerProfile('${player.player_id}')">
                        <div class="friend-avatar">
                            ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
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
            const firstChar = player.nick && player.nick.length > 0 ? player.nick[0].toUpperCase() : '?';
            
            html += `
                <div class="friend-row" onclick="Team.showPlayerProfile('${player.player_id}')">
                    <div class="friend-avatar">
                        ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
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
    
    showFriendProfile(playerId) {
        if (window.App) App.showAlert(`Профиль тиммейта ${playerId}\n(функция в разработке)`);
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

// ============================================
// КОМАНДА - ТИММЕЙТЫ НАЖИМАЮТСЯ, ЛИДЕРБОРД - НЕТ
// БЕЗ ДИАЛОГА ПОДТВЕРЖДЕНИЯ, С ТОСТОМ
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
        
        this.loadFriendsList();
        this.loadLeaderboard();
    },
    
    showTeamPage() {
        console.log('showTeamPage called');
        
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
                // 🔥 СИНХРОНИЗИРУЕМ С PROFILE
                this.syncWithProfile();
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                this.renderFriendsTab();
                this.syncWithProfile();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки тиммейтов:', error);
            this.friendsList = [];
            this.filteredFriends = [];
            this.isFriendsLoaded = true;
            this.renderFriendsTab();
            this.syncWithProfile();
        } finally {
            this.isLoadingFriends = false;
        }
    },
    
    // 🔥 СИНХРОНИЗАЦИЯ С PROFILE
    syncWithProfile() {
        if (window.Profile) {
            Profile.friendsList = [...this.friendsList];
            Profile.isFriendsLoaded = true;
            if (typeof Profile.updateFriendsDisplay === 'function') {
                Profile.updateFriendsDisplay();
            }
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
                    <div class="friend-arrow-menu">→</div>
                </div>`;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        // 🔥 ТИММЕЙТЫ НАЖИМАЮТСЯ — ВЕШАЕМ ОБРАБОТЧИКИ
        document.querySelectorAll('#friendsTabList .friend-arrow-menu').forEach(btn => {
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
            <div class="friend-actions-popup" style="top: ${top}px; left: ${rect.right - 170}px;">
                <div class="friend-action-item write-btn">Написать в Telegram</div>
                <div class="friend-action-item delete-btn">Удалить из тиммейтов</div>
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
            
            if (username && username !== 'null' && username !== '') {
                const url = `https://t.me/${username}`;
                if (window.Telegram?.WebApp?.openLink) {
                    window.Telegram.WebApp.openLink(url);
                } else if (window.Telegram?.WebApp?.openTelegramLink) {
                    window.Telegram.WebApp.openTelegramLink(url);
                } else {
                    window.open(url, '_blank');
                }
            } else {
                this.showToast('У пользователя нет username в Telegram', true);
            }
        };
        
        menu.querySelector('.delete-btn').onclick = () => {
            menu.remove();
            // 🔥 УДАЛЯЕМ БЕЗ ДИАЛОГА, СРАЗУ
            this.removeFriend(playerId, nick);
        };
    },
    
    // 🔥 ТОСТ ВМЕСТО ALERT
    showToast(message, isError = false) {
        if (window.Profile && Profile.showToast) {
            Profile.showToast(message, isError);
        } else if (window.App && App.showAlert) {
            App.showAlert(message);
        } else {
            alert(message);
        }
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
                // 🔥 УДАЛЯЕМ ИЗ ЛОКАЛЬНЫХ СПИСКОВ
                this.friendsList = this.friendsList.filter(f => f.player_id !== friendId);
                this.filteredFriends = this.filteredFriends.filter(f => f.player_id !== friendId);
                
                // 🔥 ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ
                this.renderFriendsTab();
                
                // 🔥 СИНХРОНИЗИРУЕМ С PROFILE
                if (window.Profile) {
                    Profile.friendsList = Profile.friendsList.filter(f => f.player_id !== friendId);
                    if (typeof Profile.updateFriendsDisplay === 'function') {
                        Profile.updateFriendsDisplay();
                    }
                }
                
                // 🔥 ПОКАЗЫВАЕМ ТОСТ
                this.showToast('Тиммейт удалён');
            } else {
                this.showToast('Ошибка при удалении', true);
            }
        } catch(e) {
            console.error('Ошибка удаления:', e);
            this.showToast('Ошибка при удалении', true);
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
                <div class="friend-arrow-menu">→</div>
            </div>`;
        });
        container.innerHTML = html;
        
        // 🔥 ТИММЕЙТЫ НАЖИМАЮТСЯ — ВЕШАЕМ ОБРАБОТЧИКИ
        document.querySelectorAll('#friendsTabList .friend-arrow-menu').forEach(btn => {
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
                
                // 🔥 ЛИДЕРБОРД — СТРЕЛОЧКИ УБРАНЫ, НАЖАТЬ НЕЛЬЗЯ
                html += `
                    <div class="friend-row" style="pointer-events: none;">
                        <div class="friend-avatar">
                            ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
                        </div>
                        <div class="friend-info">
                            <span class="friend-id">ID: ${player.player_id}</span>
                            <span class="friend-name">${player.nick || 'Без имени'}</span>
                        </div>
                        <div class="leaderboard-right">
                            <span class="leaderboard-place">#${place}</span>
                            ${isCurrent ? '<span class="leaderboard-current-badge">вы</span>' : ''}
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
            
            // 🔥 ЛИДЕРБОРД — СТРЕЛОЧКИ УБРАНЫ, НАЖАТЬ НЕЛЬЗЯ
            html += `
                <div class="friend-row" style="pointer-events: none;">
                    <div class="friend-avatar">
                        ${player.avatar ? `<img src="${player.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${player.player_id}</span>
                        <span class="friend-name">${player.nick || 'Без имени'}</span>
                    </div>
                    <div class="leaderboard-right">
                        <span class="leaderboard-place">#${place}</span>
                        ${isCurrent ? '<span class="leaderboard-current-badge">вы</span>' : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
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

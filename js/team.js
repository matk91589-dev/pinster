// ============================================
// КОМАНДА - ТИММЕЙТЫ + ЛИДЕРБОРД v5.0 SVG NATIVE
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

    // 🔥 SVG SPRITE REFERENCES
    ICONS: {
        chat: '<svg viewBox="0 0 24 24" width="16" height="16"><use href="#icon-chat"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
        search: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        crown: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 4l3 12h14l3-12-6 5-4-9-4 9z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
        arrow: '<svg viewBox="0 0 24 24" width="18" height="18"><use href="#icon-arrow"/></svg>',
        profile: '<svg viewBox="0 0 24 24" width="16" height="16"><use href="#icon-profile"/></svg>'
    },

    init() {
        console.log('🚀 Team.init() v5.0');
        
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
        } else if (window.Profile && Profile.getTelegramId) {
            this.telegramId = Profile.getTelegramId();
        }
        
        this.currentPlayerId = localStorage.getItem('player_id');
        
        console.log('Team TG ID:', this.telegramId);
        console.log('Team Player ID:', this.currentPlayerId);
        
        if (!this.telegramId) {
            console.error('❌ No telegram_id');
            return;
        }
        
        this.loadFriendsList();
        this.loadLeaderboard();
        this.injectStyles();
    },
    
    injectStyles() {
        if (document.getElementById('team-v5-styles')) return;
        const style = document.createElement('style');
        style.id = 'team-v5-styles';
        style.textContent = `
            .team-content {
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }
            
            .friends-search {
                padding: 12px 16px;
                flex-shrink: 0;
            }
            
            .friends-search-input {
                width: 100%;
                height: 40px;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.04);
                color: #fff;
                font-size: 13px;
                padding: 0 12px 0 36px;
                outline: none;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }
            .friends-search-input:focus {
                border-color: rgba(255,85,0,0.4);
            }
            .friends-search-input::placeholder {
                color: rgba(255,255,255,0.25);
            }
            
            .friends-list-container {
                flex: 1;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                padding: 0 8px 16px;
            }
            
            .friend-row {
                display: flex;
                align-items: center;
                padding: 12px;
                gap: 12px;
                border-radius: 12px;
                margin: 2px 0;
                transition: background 0.15s ease;
                cursor: default;
            }
            
            .friend-avatar {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(255,255,255,0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 16px;
                color: #fff;
                overflow: hidden;
                flex-shrink: 0;
            }
            .friend-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .friend-info {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .friend-id {
                font-size: 11px;
                color: rgba(255,255,255,0.35);
                font-weight: 500;
            }
            .friend-name {
                font-size: 14px;
                font-weight: 600;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            /* 🔥 КНОПКА ДЕЙСТВИЙ */
            .friend-action-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.06);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: background 0.15s ease, transform 0.15s ease;
                color: rgba(255,255,255,0.5);
            }
            .friend-action-btn:active {
                background: rgba(255,85,0,0.2);
                transform: scale(0.9);
                color: #FF5500;
            }
            .friend-action-btn svg {
                width: 18px;
                height: 18px;
            }
            
            /* 🔥 МЕНЮ ДЕЙСТВИЙ */
            .friend-actions-menu {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }
            
            .friend-actions-popup {
                position: fixed;
                background: linear-gradient(145deg, #1e1e26, #18181e);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 4px;
                box-shadow: 0 12px 30px rgba(0,0,0,0.5);
                min-width: 200px;
                z-index: 10001;
                animation: menuIn 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
            }
            
            @keyframes menuIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .friend-action-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 14px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: background 0.15s ease;
                color: #fff;
            }
            .friend-action-item:active {
                background: rgba(255,255,255,0.06);
            }
            .friend-action-item svg {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
            }
            
            .friend-action-item.write-btn {
                color: #fff;
            }
            .friend-action-item.write-btn svg {
                color: #FF5500;
            }
            
            .friend-action-item.delete-btn {
                color: rgba(255,100,100,0.8);
            }
            .friend-action-item.delete-btn svg {
                color: rgba(255,100,100,0.8);
            }
            
            /* 🔥 ЛИДЕРБОРД */
            .leaderboard-right {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .leaderboard-place {
                font-size: 14px;
                font-weight: 700;
                color: #FF5500;
                min-width: 32px;
                text-align: right;
            }
            .leaderboard-place.top1 { color: #FFD700; }
            .leaderboard-place.top2 { color: #C0C0C0; }
            .leaderboard-place.top3 { color: #CD7F32; }
            
            .leaderboard-current-badge {
                font-size: 10px;
                font-weight: 700;
                color: #FF5500;
                background: rgba(255,85,0,0.12);
                padding: 3px 8px;
                border-radius: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .leaderboard-coins {
                font-size: 12px;
                font-weight: 600;
                color: rgba(255,255,255,0.4);
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            /* 🔥 ДИАЛОГ ПОДТВЕРЖДЕНИЯ */
            .friend-delete-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 100000;
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
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(6px);
            }
            
            .friend-delete-popup {
                position: relative;
                background: linear-gradient(145deg, #1c1c24, #16161c);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 24px 20px;
                width: 85%;
                max-width: 320px;
                text-align: center;
                z-index: 1;
                animation: popupIn 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
            }
            
            @keyframes popupIn {
                from { opacity: 0; transform: scale(0.9) translateY(10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .friend-delete-title {
                font-size: 17px;
                font-weight: 700;
                color: #fff;
                margin-bottom: 8px;
            }
            
            .friend-delete-message {
                font-size: 13px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 24px;
                line-height: 1.5;
            }
            
            .friend-delete-buttons {
                display: flex;
                gap: 8px;
            }
            
            .friend-delete-buttons button {
                flex: 1;
                padding: 12px;
                border-radius: 10px;
                border: none;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.15s ease;
            }
            .friend-delete-buttons button:active {
                transform: scale(0.96);
            }
            
            .friend-delete-cancel {
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            
            .friend-delete-confirm {
                background: #FF3B30;
                color: #fff;
            }
            
            /* 🔥 ПУСТО */
            .empty-friends {
                text-align: center;
                padding: 40px 20px;
            }
            .empty-friends-text {
                color: rgba(255,255,255,0.3);
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
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
        console.log('👥 Loading teammates...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Friends:', data);
            
            if (data.status === 'ok' && data.friends && data.friends.length > 0) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                this.isFriendsLoaded = true;
                console.log('✅ Friends loaded:', this.friendsList.length);
                this.renderFriendsTab();
                this.syncWithProfile();
            } else {
                this.friendsList = [];
                this.filteredFriends = [];
                this.isFriendsLoaded = true;
                this.renderFriendsTab();
                this.syncWithProfile();
            }
        } catch (error) {
            console.error('❌ Friends load error:', error);
            this.friendsList = [];
            this.filteredFriends = [];
            this.isFriendsLoaded = true;
            this.renderFriendsTab();
            this.syncWithProfile();
        } finally {
            this.isLoadingFriends = false;
        }
    },
    
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
        console.log('📥 Loading leaderboard...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/users/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Leaderboard:', data);
            
            if (data.status === 'ok' && data.leaderboard && data.leaderboard.length > 0) {
                this.leaderboard = data.leaderboard;
                this.filteredLeaderboard = [...this.leaderboard];
                this.isLeaderboardLoaded = true;
                console.log('✅ Leaderboard loaded:', this.leaderboard.length);
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
            console.error('❌ Leaderboard load error:', error);
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
                <div style="position:relative;">
                    <input type="search" id="friendsSearchInput" class="friends-search-input" 
                           placeholder="Поиск по нику или ID" autocomplete="off">
                </div>
            </div>
            <div class="friends-list-container" id="friendsTabList">
        `;
        
        if (!this.isFriendsLoaded && this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">Загрузка тиммейтов...</div></div>`;
        } else if (this.friendsList.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">У вас пока нет тиммейтов</div></div>`;
        } else {
            this.filteredFriends.forEach(friend => {
                const firstChar = friend.nick?.[0]?.toUpperCase() || '?';
                html += `
                <div class="friend-row" data-player-id="${friend.player_id}" data-username="${friend.username || ''}" data-nick="${friend.nick || 'Без имени'}">
                    <div class="friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}" alt="">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID ${friend.player_id}</span>
                        <span class="friend-name">${friend.nick || 'Без имени'}</span>
                    </div>
                    <button class="friend-action-btn" onclick="event.stopPropagation(); Team.showFriendActions('${friend.player_id}', '${friend.username || ''}', '${(friend.nick || 'Без имени').replace(/'/g, "\\'")}', this)">
                        ${this.ICONS.arrow}
                    </button>
                </div>`;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        setTimeout(() => this.setupFriendsSearch(), 50);
    },
    
    showFriendActions(playerId, username, nick, btn) {
        const oldMenu = document.querySelector('.friend-actions-menu');
        if (oldMenu) oldMenu.remove();
        
        const rect = btn.getBoundingClientRect();
        const menuWidth = 210;
        const menuHeight = 90;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceRight = window.innerWidth - rect.right;
    
        let top;
        if (spaceBelow < menuHeight) {
            top = rect.top - menuHeight - 5;
        } else {
            top = rect.bottom + 5;
        }
    
        let left;
        if (spaceRight < menuWidth) {
            left = window.innerWidth - menuWidth - 10;
        } else {
            left = rect.right - menuWidth + 10;
        }
        
        // 🔥 Проверяем границы
        if (top < 10) top = 10;
        if (left < 10) left = 10;
    
        const menu = document.createElement('div');
        menu.className = 'friend-actions-menu';
        menu.innerHTML = `
            <div class="friend-actions-popup" style="top: ${top}px; left: ${left}px;">
                <div class="friend-action-item write-btn">
                    ${this.ICONS.chat}
                    Написать в Telegram
                </div>
                <div class="friend-action-item delete-btn">
                    ${this.ICONS.trash}
                    Удалить из тиммейтов
                </div>
            </div>
        `;
    
        document.body.appendChild(menu);
    
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('touchstart', closeMenu);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('touchstart', closeMenu);
        }, 10);
    
        // 🔥 КНОПКА "НАПИСАТЬ" — НАТИВНЫЙ ЧАТ
        menu.querySelector('.write-btn').onclick = () => {
            menu.remove();
            if (username && username !== 'null' && username !== '') {
                // 🔥 ИСПОЛЬЗУЕМ НАТИВНЫЙ ЧАТ
                if (window.App && window.App.openNativeChat) {
                    window.App.openNativeChat(username, nick);
                } else if (window.openNativeChat) {
                    window.openNativeChat(username, nick);
                } else {
                    // Фолбек
                    const url = `https://t.me/${username}`;
                    (window.Telegram?.WebApp?.openLink || window.open)(url, '_blank');
                }
            } else {
                this.showToast('У пользователя нет username', true);
            }
        };
    
        menu.querySelector('.delete-btn').onclick = () => {
            menu.remove();
            this.confirmDeleteFriend(playerId, nick);
        };
    },
    
    // 🔥 ДИАЛОГ ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ
    confirmDeleteFriend(playerId, nick) {
        const dialog = document.createElement('div');
        dialog.className = 'friend-delete-dialog';
        dialog.innerHTML = `
            <div class="friend-delete-overlay"></div>
            <div class="friend-delete-popup">
                <div class="friend-delete-title">Удалить тиммейта?</div>
                <div class="friend-delete-message">
                    Вы уверены, что хотите удалить <b>${nick || 'этого игрока'}</b> из списка тиммейтов?
                </div>
                <div class="friend-delete-buttons">
                    <button class="friend-delete-cancel">Отмена</button>
                    <button class="friend-delete-confirm">Удалить</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        dialog.querySelector('.friend-delete-overlay').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-cancel').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-confirm').onclick = async () => {
            dialog.remove();
            await this.removeFriend(playerId, nick);
        };
    },
    
    showToast(message, isError = false) {
        if (window.Profile && Profile.showToast) {
            Profile.showToast(message, isError);
        } else if (window.App && window.App.showAlert) {
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
                this.friendsList = this.friendsList.filter(f => f.player_id !== friendId);
                this.filteredFriends = this.filteredFriends.filter(f => f.player_id !== friendId);
                this.renderFriendsTab();
                
                if (window.Profile) {
                    Profile.friendsList = Profile.friendsList.filter(f => f.player_id !== friendId);
                    if (typeof Profile.updateFriendsDisplay === 'function') {
                        Profile.updateFriendsDisplay();
                    }
                }
                
                this.showToast('Тиммейт удалён');
            } else {
                this.showToast('Ошибка при удалении', true);
            }
        } catch(e) {
            console.error('Remove error:', e);
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
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">Тиммейты не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredFriends.forEach(friend => {
            const firstChar = friend.nick?.[0]?.toUpperCase() || '?';
            html += `
            <div class="friend-row" data-player-id="${friend.player_id}" data-username="${friend.username || ''}" data-nick="${friend.nick || 'Без имени'}">
                <div class="friend-avatar">${friend.avatar ? `<img src="${friend.avatar}" alt="">` : `<span>${firstChar}</span>`}</div>
                <div class="friend-info">
                    <span class="friend-id">ID ${friend.player_id}</span>
                    <span class="friend-name">${friend.nick || 'Без имени'}</span>
                </div>
                <button class="friend-action-btn" onclick="event.stopPropagation(); Team.showFriendActions('${friend.player_id}', '${friend.username || ''}', '${(friend.nick || 'Без имени').replace(/'/g, "\\'")}', this)">
                    ${this.ICONS.arrow}
                </button>
            </div>`;
        });
        container.innerHTML = html;
    },
    
    // 🔥 РЕНДЕР ЛИДЕРБОРДА
    renderLeaderboardTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        let html = `
            <div class="friends-search">
                <div style="position:relative;">
                    <input type="search" id="leaderboardSearchInput" class="friends-search-input" 
                           placeholder="Поиск по нику или ID" autocomplete="off">
                </div>
            </div>
            <div class="friends-list-container" id="leaderboardTabList">
        `;
        
        if (!this.isLeaderboardLoaded && this.leaderboard.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">Загрузка лидерборда...</div></div>`;
        } else if (this.leaderboard.length === 0) {
            html += `<div class="empty-friends"><div class="empty-friends-text">Пока нет игроков</div></div>`;
        } else {
            this.filteredLeaderboard.forEach((player) => {
                const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
                const place = originalIndex + 1;
                const isCurrent = player.player_id === this.currentPlayerId;
                const firstChar = player.nick?.[0]?.toUpperCase() || '?';
                
                // 🔥 Топ-3 с особыми цветами
                let placeClass = '';
                if (place === 1) placeClass = ' top1';
                else if (place === 2) placeClass = ' top2';
                else if (place === 3) placeClass = ' top3';
                
                html += `
                    <div class="friend-row" style="pointer-events: none;">
                        <div class="friend-avatar">
                            ${player.avatar ? `<img src="${player.avatar}" alt="">` : `<span>${firstChar}</span>`}
                        </div>
                        <div class="friend-info">
                            <span class="friend-id">ID ${player.player_id}</span>
                            <span class="friend-name">${player.nick || 'Без имени'}</span>
                        </div>
                        <div class="leaderboard-right">
                            <span class="leaderboard-place${placeClass}">#${place}</span>
                            ${player.coins ? `<span class="leaderboard-coins">${player.coins} 🪙</span>` : ''}
                            ${isCurrent ? '<span class="leaderboard-current-badge">Вы</span>' : ''}
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
            container.innerHTML = `<div class="empty-friends"><div class="empty-friends-text">Игроки не найдены</div></div>`;
            return;
        }
        
        let html = '';
        this.filteredLeaderboard.forEach((player) => {
            const originalIndex = this.leaderboard.findIndex(p => p.player_id === player.player_id);
            const place = originalIndex + 1;
            const isCurrent = player.player_id === this.currentPlayerId;
            const firstChar = player.nick?.[0]?.toUpperCase() || '?';
            
            let placeClass = '';
            if (place === 1) placeClass = ' top1';
            else if (place === 2) placeClass = ' top2';
            else if (place === 3) placeClass = ' top3';
            
            html += `
                <div class="friend-row" style="pointer-events: none;">
                    <div class="friend-avatar">
                        ${player.avatar ? `<img src="${player.avatar}" alt="">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID ${player.player_id}</span>
                        <span class="friend-name">${player.nick || 'Без имени'}</span>
                    </div>
                    <div class="leaderboard-right">
                        <span class="leaderboard-place${placeClass}">#${place}</span>
                        ${player.coins ? `<span class="leaderboard-coins">${player.coins} 🪙</span>` : ''}
                        ${isCurrent ? '<span class="leaderboard-current-badge">Вы</span>' : ''}
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
    console.log('Team.js v5.0 loaded');
    setTimeout(() => Team.init(), 50);
});

window.Team = Team;

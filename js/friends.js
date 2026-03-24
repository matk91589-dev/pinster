// ============================================
// ДРУЗЬЯ - С КЭШИРОВАНИЕМ И МГНОВЕННОЙ ЗАГРУЗКОЙ
// ============================================

const Friends = {
    friendsList: [],
    filteredFriends: [],
    telegramId: null,
    searchTimeout: null,
    friendsListLoaded: false,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Friends.init()');
        
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
        } else {
            this.telegramId = Profile.getTelegramId();
        }
        
        if (!this.telegramId) {
            console.error('❌ НЕТ TELEGRAM ID!');
            return;
        }
        
        // Сначала грузим из кэша
        this.loadFromCache();
        
        // Настраиваем поиск
        this.setupSearchInput();
        
        // Фоново обновляем с сервера
        setTimeout(() => {
            this.loadFriendsList();
        }, 500);
    },
    
    // ✅ ЗАГРУЗКА ИЗ КЭША (мгновенно)
    loadFromCache() {
        const cachedFriends = localStorage.getItem(`friends_${this.telegramId}`);
        
        if (cachedFriends) {
            try {
                const friends = JSON.parse(cachedFriends);
                if (friends && friends.length > 0) {
                    this.friendsList = friends;
                    this.filteredFriends = [...friends];
                    this.updateFriendsCounter();
                    this.renderFriendsList();
                    this.renderFriendsPage();
                    console.log('✅ Друзья загружены из кэша:', friends.length);
                    return true;
                }
            } catch (e) {
                console.error('Ошибка парсинга кэша друзей:', e);
            }
        }
        
        // Если кэш пуст, показываем пустой список
        this.renderFriendsList();
        this.renderFriendsPage();
        return false;
    },
    
    getTelegramId() {
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            return Telegram.WebApp.initDataUnsafe.user.id;
        }
        return Profile.getTelegramId();
    },
    
    async loadFriendsList() {
        if (this.friendsListLoaded) {
            console.log('📦 Друзья уже загружены');
            return;
        }
        
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ telegram_id: this.telegramId }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Данные друзей с сервера:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                
                // Сохраняем в кэш
                localStorage.setItem(`friends_${this.telegramId}`, JSON.stringify(this.friendsList));
                
                this.updateFriendsCounter();
                this.renderFriendsList();
                this.renderFriendsPage();
                this.friendsListLoaded = true;
                console.log('✅ Друзья загружены с сервера:', this.friendsList.length);
            } else {
                console.log('❌ Ошибка от сервера:', data.error);
                this.showError(data.error || 'Нет данных');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Таймаут загрузки друзей (3 сек)');
            } else {
                console.error('❌ Ошибка загрузки друзей:', error);
            }
        }
    },
    
    setupSearchInput() {
        setTimeout(() => {
            const searchInput = document.getElementById('friendsSearchInput');
            if (!searchInput) {
                console.log('❌ Поле поиска друзей не найдено');
                return;
            }
            
            console.log('✅ Поле поиска друзей настроено');
            searchInput.removeAttribute('readonly');
            searchInput.removeAttribute('disabled');
            
            searchInput.oninput = null;
            
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
        console.log('🔍 Поиск по друзьям:', query);
        
        if (!query) {
            this.filteredFriends = [...this.friendsList];
        } else {
            this.filteredFriends = this.friendsList.filter(friend => {
                const nickMatch = friend.nick?.toLowerCase().includes(query);
                const idMatch = friend.player_id?.toLowerCase().includes(query);
                return nickMatch || idMatch;
            });
        }
        
        this.renderFriendsPage(this.filteredFriends);
    },
    
    renderFriends(friends) {
        console.log('🎨 Отрисовка друзей:', friends?.length || 0);
        this.renderFriendsList();
        this.renderFriendsPage(friends);
    },
    
    renderFriendsList() {
        const container = document.getElementById('friendsList');
        if (!container) {
            console.log('❌ Контейнер friendsList не найден');
            return;
        }
        
        if (!this.friendsList || this.friendsList.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">здесь пока что никого нет</div>
                </div>
            `;
            return;
        }
        
        const previewFriends = this.friendsList.slice(0, 3);
        
        let html = '';
        previewFriends.forEach(friend => {
            html += `
            <div class="friend-row" onclick="Friends.showFriendProfile('${friend.player_id}')">
                <div class="friend-avatar">
                    ${friend.avatar 
                        ? `<img src="${friend.avatar}" style="width:100%; height:100%; object-fit:cover;">` 
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
        console.log('✅ Превью друзей отрисовано');
    },
    
    renderFriendsPage(friends = null) {
        const container = document.getElementById('friendsPageList');
        if (!container) {
            console.log('❌ Контейнер friendsPageList не найден');
            return;
        }
        
        // Если нет данных и еще не загружали с сервера
        if ((!friends || friends.length === 0) && this.friendsList.length === 0 && !this.friendsListLoaded) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">⏳ загрузка...</div>
                </div>
            `;
            return;
        }
        
        const friendsToRender = friends || this.filteredFriends;
        
        if (!friendsToRender || friendsToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">пока что пусто</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        friendsToRender.forEach(friend => {
            html += `
            <div class="friend-row" onclick="Friends.showFriendProfile('${friend.player_id}')">
                <div class="friend-avatar">
                    ${friend.avatar 
                        ? `<img src="${friend.avatar}" alt="avatar">` 
                        : `<div class="avatar-placeholder">${friend.nick?.[0] || '?'}</div>`
                    }
                </div>
                <div class="friend-info">
                    <span class="friend-id">ID: ${friend.player_id}</span>
                    <span class="friend-name">${friend.nick || 'Без имени'}</span>
                </div>
                <div class="friend-actions">
                    <button class="friend-profile-btn" onclick="event.stopPropagation(); Friends.showFriendProfile('${friend.player_id}')">
                        <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#000000"/>
                            <circle cx="12" cy="8" r="3.5" stroke="#ffffff" stroke-width="1.8" fill="none"/>
                            <path d="M5.5 16 C5.5 13.8, 8.5 12.5, 12 12.5 C15.5 12.5, 18.5 13.8, 18.5 16 C18.5 17.8, 16.5 19, 12 19 C7.5 19, 5.5 17.8, 5.5 16" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="friend-tg-btn" onclick="event.stopPropagation(); Friends.openTelegramChat('${friend.player_id}')">
                        <svg width="26" height="26" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="120" cy="120" r="120" fill="#000000"/>
                            <path fill="#FFFFFF" d="M180.2 63.8L48.5 113.5C42.6 115.8 42.7 119.1 47.5 120.6L81.3 131.2L155.6 86.3C158.9 84.4 161.9 85.4 159.4 87.6L99.5 140.9L97.3 173.2C100.6 173.2 102.1 171.6 103.9 169.7L120.2 153.6L154.1 178.4C160.4 181.9 164.9 180.1 166.5 172.5L188.8 75.5C191.2 66.1 185.1 61.9 180.2 63.8Z"/>
                        </svg>
                    </button>
                    <button class="friend-delete-btn" onclick="event.stopPropagation(); Friends.deleteFriend('${friend.player_id}')">
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
        console.log('✅ Страница друзей отрисована');
    },
    
    updateFriendsCounter() {
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши друзья: ${this.friendsList.length}`;
        }
        
        const friendsTitleTeam = document.querySelector('.team-title');
        if (friendsTitleTeam && friendsTitleTeam.textContent === 'ДРУЗЬЯ') {
            const counterSpan = document.querySelector('.friends-count');
            if (!counterSpan) {
                const newSpan = document.createElement('span');
                newSpan.className = 'friends-count';
                newSpan.style.marginLeft = '8px';
                newSpan.style.fontSize = '14px';
                newSpan.style.color = '#FF5500';
                newSpan.textContent = `(${this.friendsList.length})`;
                friendsTitleTeam.appendChild(newSpan);
            } else {
                counterSpan.textContent = `(${this.friendsList.length})`;
            }
        }
    },
    
    showError(message) {
        const containers = ['friendsList', 'friendsPageList'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="empty-friends">
                        <div class="empty-friends-text">❌ ${message}</div>
                    </div>
                `;
            }
        });
    },
    
    showFriendProfile(playerId) {
        console.log('👤 Профиль друга:', playerId);
        if (window.App) {
            App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
        } else {
            alert(`Профиль друга ${playerId}\n(функция в разработке)`);
        }
    },
    
    openTelegramChat(playerId) {
        console.log('📨 Открыть чат с другом:', playerId);
        if (window.App) {
            App.showAlert(`Чат с игроком ${playerId}\n(функция в разработке)`);
        } else {
            alert(`Чат с игроком ${playerId}\n(функция в разработке)`);
        }
    },
    
    deleteFriend(playerId) {
        console.log('🗑️ Удалить друга:', playerId);
        if (confirm('Удалить пользователя из друзей?')) {
            // Удаляем из списка и обновляем кэш
            this.friendsList = this.friendsList.filter(f => f.player_id !== playerId);
            this.filteredFriends = this.filteredFriends.filter(f => f.player_id !== playerId);
            localStorage.setItem(`friends_${this.telegramId}`, JSON.stringify(this.friendsList));
            this.updateFriendsCounter();
            this.renderFriendsList();
            this.renderFriendsPage();
            
            if (window.App) {
                App.showAlert(`Друг удален`);
            } else {
                alert(`Друг удален`);
            }
        }
    },
    
    // ✅ Добавить друга (для поиска)
    addFriend(friend) {
        // Проверяем, нет ли уже
        if (this.friendsList.some(f => f.player_id === friend.player_id)) {
            return false;
        }
        
        this.friendsList.unshift(friend);
        this.filteredFriends = [...this.friendsList];
        localStorage.setItem(`friends_${this.telegramId}`, JSON.stringify(this.friendsList));
        this.updateFriendsCounter();
        this.renderFriendsList();
        this.renderFriendsPage();
        return true;
    }
};

// ✅ ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('Friends.js загружен');
    setTimeout(() => Friends.init(), 100);
});

window.Friends = Friends;

// ============================================
// ДРУЗЬЯ - С ПОИСКОМ ПО ДРУЗЬЯМ
// ============================================

const Friends = {
    friendsList: [],
    filteredFriends: [],
    telegramId: null,
    searchTimeout: null,
    
    init() {
        console.log('🔍 Friends.init() запущен');
        
        // Получаем Telegram ID
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            this.telegramId = Telegram.WebApp.initDataUnsafe.user.id;
            console.log('✅ Telegram ID из WebApp:', this.telegramId);
        } else {
            this.telegramId = Profile.getTelegramId();
            console.log('✅ Telegram ID из Profile:', this.telegramId);
        }
        
        if (!this.telegramId) {
            console.error('❌ НЕТ TELEGRAM ID!');
            this.showError('Ошибка авторизации');
            return;
        }
        
        console.log('🚀 Загружаем список друзей...');
        this.loadFriendsList();
        this.setupSearchInput();
    },
    
    async loadFriendsList() {
        console.log('📥 Запрос к /api/friends/list...');
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/friends/list', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            console.log('📦 Статус ответа:', response.status);
            const data = await response.json();
            console.log('📦 Данные от сервера:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.filteredFriends = [...this.friendsList];
                console.log('✅ Загружено друзей:', this.friendsList.length);
                this.renderFriends(this.filteredFriends);
                this.updateFriendsCounter();
            } else {
                console.log('❌ Ошибка от сервера:', data.error);
                this.showError(data.error || 'Нет данных');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            this.showError('Не удалось загрузить друзей');
        }
    },
    
    setupSearchInput() {
        // Ждем немного, чтобы DOM точно загрузился
        setTimeout(() => {
            const searchInput = document.getElementById('friendsSearchInput');
            if (!searchInput) {
                console.log('❌ Поле поиска друзей не найдено');
                return;
            }
            
            console.log('✅ Поле поиска друзей настроено');
            searchInput.removeAttribute('readonly');
            searchInput.removeAttribute('disabled');
            
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                
                this.searchTimeout = setTimeout(() => {
                    this.searchFriends(query);
                }, 300);
            });
        }, 500);
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
        
        // Обновляем список на главном экране профиля
        this.renderFriendsList();
        
        // Обновляем список на отдельном экране друзей
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
                    <div class="empty-friends-text">🤷 у вас пока нет друзей</div>
                </div>
            `;
            return;
        }
        
        // Показываем только первых 3 друзей в превью
        const previewFriends = this.friendsList.slice(0, 3);
        
        let html = '';
        previewFriends.forEach(friend => {
            html += `
            <div class="friend-item" onclick="Friends.showFriendProfile('${friend.player_id}')">
                <div class="friend-avatar">
                    ${friend.avatar 
                        ? `<img src="${friend.avatar}" style="width:100%; height:100%; object-fit:cover;">` 
                        : `<span>${friend.nick?.[0] || '?'}</span>`
                    }
                </div>
                <div class="friend-details">
                    <div class="friend-name">${friend.nick || 'Без имени'}</div>
                    <div class="friend-id">ID: ${friend.player_id}</div>
                </div>
                <div class="friend-status">online</div>
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
        
        const friendsToRender = friends || this.filteredFriends;
        
        if (!friendsToRender || friendsToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">🤷 друзья не найдены</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        friendsToRender.forEach(friend => {
            html += `
            <div class="player-item" onclick="Friends.showFriendProfile('${friend.player_id}')">
                <div class="player-avatar">
                    ${friend.avatar 
                        ? `<img src="${friend.avatar}" alt="avatar">` 
                        : `<div class="avatar-placeholder">${friend.nick?.[0] || '?'}</div>`
                    }
                </div>
                <div class="player-info">
                    <div class="player-nick">${friend.nick || 'Без имени'}</div>
                    <div class="player-id">ID: ${friend.player_id}</div>
                </div>
                <button class="player-profile-btn" onclick="event.stopPropagation(); Friends.showFriendProfile('${friend.player_id}')">
                    👤
                </button>
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
        alert(`Профиль друга ${playerId} (будет позже)`);
    }
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Friends.js загружен');
    setTimeout(() => Friends.init(), 1000);
});

window.Friends = Friends;

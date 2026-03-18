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
    
    // ============================================
    // ОБНОВЛЕННЫЙ ПРЕВЬЮ ДРУЗЕЙ В ПРОФИЛЕ
    // ============================================
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
        
        // Показываем только первых 3 друзей в превью
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
                <div class="friend-actions">
                    <!-- Кнопка профиля (слева) - уменьшенная -->
                    <button class="friend-profile-btn" onclick="event.stopPropagation(); Friends.showFriendProfile('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="19" cy="19" r="19" fill="#000000"/>
                            <circle cx="19" cy="16" r="5.5" fill="#FFFFFF"/>
                            <path d="M11 27 C11 23 15 20 19 20 C23 20 27 23 27 27 C27 28.5 26 30 24.5 30 H13.5 C12 30 11 28.5 11 27Z" fill="#FFFFFF"/>
                        </svg>
                    </button>
                    <!-- Кнопка Telegram - уменьшенная -->
                    <button class="friend-tg-btn" onclick="event.stopPropagation(); Friends.openTelegramChat('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="80" cy="80" r="80" fill="#000000"/>
                            <path fill="#FFFFFF" d="M120.1 42.5L32.3 75.7C28.4 77.2 28.5 79.4 31.7 80.4L54.2 87.5L103.7 57.5C105.9 56.3 108 56.9 106.3 58.4L67.3 93.9L65.8 115.5C68.1 115.5 69.1 114.4 70.3 113.1L81.2 102.1L104.1 118.9C108.3 121.3 111.4 120.1 112.5 115L125.2 50.3C126.8 44.1 123.4 41.3 120.1 42.5Z"/>
                        </svg>
                    </button>
                    <!-- Кнопка удаления - уменьшенная -->
                    <button class="friend-delete-btn" onclick="event.stopPropagation(); Friends.deleteFriend('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="16" fill="#000000"/>
                            <g stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none">
                                <path d="M9 12H23"/>
                                <path d="M13 12V10C13 9.5 13.5 9 14 9H18C18.5 9 19 9.5 19 10V12"/>
                                <path d="M12 12L12.5 21C12.5 21.5 13 22 13.5 22H18.5C19 22 19.5 21.5 19.5 21L20 12"/>
                                <path d="M15 15V19"/>
                                <path d="M17 15V19"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = html;
        console.log('✅ Превью друзей отрисовано');
    },
    
    // ============================================
    // ОБНОВЛЕННАЯ СТРАНИЦА ДРУЗЕЙ
    // ============================================
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
                    <!-- Кнопка профиля (слева) - уменьшенная -->
                    <button class="friend-profile-btn" onclick="event.stopPropagation(); Friends.showFriendProfile('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="19" cy="19" r="19" fill="#000000"/>
                            <circle cx="19" cy="16" r="5.5" fill="#FFFFFF"/>
                            <path d="M11 27 C11 23 15 20 19 20 C23 20 27 23 27 27 C27 28.5 26 30 24.5 30 H13.5 C12 30 11 28.5 11 27Z" fill="#FFFFFF"/>
                        </svg>
                    </button>
                    <!-- Кнопка Telegram - уменьшенная -->
                    <button class="friend-tg-btn" onclick="event.stopPropagation(); Friends.openTelegramChat('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="80" cy="80" r="80" fill="#000000"/>
                            <path fill="#FFFFFF" d="M120.1 42.5L32.3 75.7C28.4 77.2 28.5 79.4 31.7 80.4L54.2 87.5L103.7 57.5C105.9 56.3 108 56.9 106.3 58.4L67.3 93.9L65.8 115.5C68.1 115.5 69.1 114.4 70.3 113.1L81.2 102.1L104.1 118.9C108.3 121.3 111.4 120.1 112.5 115L125.2 50.3C126.8 44.1 123.4 41.3 120.1 42.5Z"/>
                        </svg>
                    </button>
                    <!-- Кнопка удаления - уменьшенная -->
                    <button class="friend-delete-btn" onclick="event.stopPropagation(); Friends.deleteFriend('${friend.player_id}')">
                        <svg width="18" height="18" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="16" fill="#000000"/>
                            <g stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none">
                                <path d="M9 12H23"/>
                                <path d="M13 12V10C13 9.5 13.5 9 14 9H18C18.5 9 19 9.5 19 10V12"/>
                                <path d="M12 12L12.5 21C12.5 21.5 13 22 13.5 22H18.5C19 22 19.5 21.5 19.5 21L20 12"/>
                                <path d="M15 15V19"/>
                                <path d="M17 15V19"/>
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
    },
    
    // ============================================
    // НОВЫЕ МЕТОДЫ ДЛЯ КНОПОК
    // ============================================
    openTelegramChat(playerId) {
        console.log('📨 Открыть чат с другом:', playerId);
        // Здесь будет логика открытия чата в Telegram
        alert(`Чат с игроком ${playerId} (будет позже)`);
    },
    
    deleteFriend(playerId) {
        console.log('Удалить друга:', playerId);
        // Здесь будет логика удаления из друзей
        if (confirm('Удалить пользователя из друзей?')) {
            alert(`Удаление друга ${playerId} (будет позже)`);
        }
    }
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Friends.js загружен');
    setTimeout(() => Friends.init(), 1000);
});

window.Friends = Friends;

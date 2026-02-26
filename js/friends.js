// ============================================
// ДРУЗЬЯ (Telegram Mini App версия) - СЧЕТЧИК РЯДОМ
// ============================================

const Friends = {
    list: [],
    count: 0,
    telegramId: null,
    
    init() {
        this.telegramId = Profile.getTelegramId();
        this.loadFriends();
    },
    
    // Загрузка списка друзей
    async loadFriends() {
        
        // ПОКА ПУСТО - 0 друзей
        this.list = [];
        this.count = this.list.length;
        this.render();
        this.renderFriendsPage();
    },
    
    // Отрисовка на главном экране профиля
    render() {
        const friendsList = document.getElementById('friendsList');
        const friendsTitle = document.querySelector('.friends-title');
        
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши друзья: ${this.count}`;
        }
        
        if (friendsList) {
            if (this.list.length === 0) {
                friendsList.innerHTML = `
                    <div class="empty-friends">
                        <div class="empty-friends-text">пока что пусто</div>
                    </div>
                `;
            } else {
                friendsList.innerHTML = this.list.map(f => `
                    <div class="friend-item" onclick="Friends.showFriendProfile('${f.id}')">
                        <div class="friend-avatar"></div>
                        <div class="friend-info">
                            <div class="friend-name-row">
                                <span class="friend-name">${f.name || 'Без имени'}</span>
                                <span class="friend-id">${f.id}</span>
                            </div>
                            <div class="friend-steam">steamcommunity.com/id/${(f.name || 'user').toLowerCase()}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    },
    
    // Отрисовка на странице друзей
    renderFriendsPage() {
        const friendsPageList = document.getElementById('friendsPageList');
        
        if (!friendsPageList) return;
        
        if (this.list.length === 0) {
            friendsPageList.innerHTML = `
                <div class="empty-friends">
                    <div class="empty-friends-text">пока что пусто</div>
                </div>
            `;
        } else {
            friendsPageList.innerHTML = this.list.map(f => `
                <div class="friend-item" onclick="Friends.showFriendProfile('${f.id}')">
                    <div class="friend-avatar"></div>
                    <div class="friend-details">
                        <div class="friend-name">${f.name || 'Без имени'}</div>
                        <div class="friend-id">ID: ${f.id}</div>
                    </div>
                    <div class="friend-status">online</div>
                </div>
            `).join('');
        }
    },
    
    // НОВЫЙ МЕТОД - показать экран команды
    showTeamPage() {
        console.log('showTeamPage called');
        if (typeof Team !== 'undefined' && Team.showTeamPage) {
            Team.showTeamPage();
        } else {
            console.error('Team not found!');
            // Запасной вариант - показываем старый экран друзей
            const friendsScreen = document.getElementById('friendsScreen');
            if (friendsScreen) {
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active');
                });
                friendsScreen.classList.add('active');
                this.renderFriendsPage();
            }
        }
    },
    
    // Показать страницу друзей (старый метод)
    showFriendsPage() {
        console.log('showFriendsPage called');
        const friendsScreen = document.getElementById('friendsScreen');
        if (friendsScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            friendsScreen.classList.add('active');
            this.renderFriendsPage();
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        } else {
            console.error('friendsScreen not found!');
        }
    },
    
    // Поиск пользователя по ID
    searchByID() {
        const searchInput = document.getElementById('friendSearchInput');
        if (!searchInput) return;
        
        const userId = searchInput.value.trim();
        
        if (!userId) {
            alert('❌ Введите ID пользователя');
            return;
        }
        
        alert(`🔍 Поиск пользователя с ID: ${userId} (будет позже)`);
        searchInput.value = '';
    },
    
    // ПОКАЗАТЬ ПРОФИЛЬ ДРУГА
    showFriendProfile(friendId) {
        alert(`👤 Профиль друга ${friendId} (будет позже)`);
    },
    
    // ТЕСТОВАЯ ФУНКЦИЯ - добавить друга (чтобы проверить счетчик)
    addTestFriend() {
        const newFriend = {
            id: Math.floor(Math.random() * 100000).toString(),
            name: `Player${this.list.length + 1}`
        };
        
        this.list.push(newFriend);
        this.count = this.list.length;
        this.render();
        this.renderFriendsPage();
        
        console.log(`✅ Добавлен друг, теперь друзей: ${this.count}`);
    },
    
    // ТЕСТОВАЯ ФУНКЦИЯ - удалить друга
    removeTestFriend() {
        this.list.pop();
        this.count = this.list.length;
        this.render();
        this.renderFriendsPage();
        
        console.log(`✅ Удален друг, теперь друзей: ${this.count}`);
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Friends.init(), 300);
});

// Для теста в консоли (чтобы проверить счетчик)
window.Friends = Friends;

// ============================================
// КОМАНДА
// ============================================

const Team = {
    currentTab: 'friends',
    
    init() {
        this.renderFriendsTab();
    },
    
    // Переключение табов
    switchTab(tab) {
        this.currentTab = tab;
        
        // Обновляем активный таб
        document.querySelectorAll('.team-tab').forEach(t => {
            t.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Рендерим соответствующий контент
        if (tab === 'friends') {
            this.renderFriendsTab();
        } else {
            this.renderSearchTab();
        }
    },
    
    // Таб с друзьями
    renderFriendsTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        // Используем список друзей из Friends
        if (Friends.list.length === 0) {
            content.innerHTML = `
                <div class="team-list">
                    <div class="empty-friends">
                        <div class="empty-friends-text">пока что пусто</div>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="team-list">
                    ${Friends.list.map(f => `
                        <div class="friend-item" onclick="Team.showFriendProfile('${f.id}')">
                            <div class="friend-avatar"></div>
                            <div class="friend-details">
                                <div class="friend-name">${f.name || 'Без имени'}</div>
                                <div class="friend-id">ID: ${f.id}</div>
                            </div>
                            <div class="friend-status">online</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },
    
    // Таб поиска игроков
    renderSearchTab() {
        const content = document.getElementById('teamContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="team-search-container">
                <div class="team-search-box">
                    <input type="text" id="teamSearchInput" class="team-search-input" placeholder="Введите ID игрока" maxlength="20">
                    <button class="team-search-btn" onclick="Team.searchPlayer()">Найти</button>
                </div>
            </div>
            <div class="team-list" id="teamSearchResults">
                <!-- Сюда будут подгружаться результаты поиска -->
            </div>
        `;
    },
    
    // Поиск игрока
    searchPlayer() {
        const input = document.getElementById('teamSearchInput');
        if (!input) return;
        
        const playerId = input.value.trim();
        if (!playerId) {
            alert('❌ Введите ID игрока');
            return;
        }
        
        // Пока просто заглушка
        alert(`🔍 Поиск игрока с ID: ${playerId}`);
        input.value = '';
    },
    
    // Показать профиль друга
    showFriendProfile(friendId) {
        alert(`👤 Профиль друга ${friendId}`);
    },
    
    // Показать запросы в друзья
    showRequests() {
        alert('📨 Запросы в друзья (будет позже)');
    },
    
    // Вернуться назад
    goBack() {
        App.showScreen('profileScreen', true);
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Будет вызываться при открытии экрана
});

window.Team = Team;

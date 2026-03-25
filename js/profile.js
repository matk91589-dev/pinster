// ============================================
// ПРОФИЛЬ - УЛЬТРА-МИНИМАЛЬНАЯ ВЕРСИЯ
// ============================================

const Profile = {
    friendsList: [],
    telegramId: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    
    getTelegramId() {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            return tg.initDataUnsafe.user.id;
        }
        return null;
    },
    
    // ✅ ЗАГРУЗКА ДРУЗЕЙ (вызываем сразу)
    async loadFriends() {
        console.log('🔵🔵🔵 PROFILE.loadFriends() ВЫЗВАН 🔵🔵🔵');
        
        this.telegramId = this.getTelegramId();
        console.log('📱 Telegram ID:', this.telegramId);
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const data = await response.json();
            console.log('📦 Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                console.log('✅ Друзей загружено:', this.friendsList.length);
                this.updateFriendsDisplay();
            } else {
                console.log('❌ Нет друзей');
                this.updateFriendsDisplay();
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    },
    
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
        console.log('🖼️ Обновляем отображение, friendsList найден:', !!friendsListEl);
        
        if (!friendsListEl) {
            setTimeout(() => this.updateFriendsDisplay(), 200);
            return;
        }
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши друзья: ${this.friendsList.length}`;
        }
        
        if (!this.friendsList.length) {
            friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">у вас пока нет друзей</div></div>';
            return;
        }
        
        let html = '';
        for (let i = 0; i < Math.min(this.friendsList.length, 5); i++) {
            const friend = this.friendsList[i];
            const firstChar = friend.nick && friend.nick.length > 0 ? friend.nick[0].toUpperCase() : '?';
            html += `
                <div class="friend-row" onclick="Profile.showFriendProfile('${friend.player_id}')">
                    <div class="friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${friend.player_id}</span>
                        <span class="friend-name">${friend.nick || 'Без имени'}</span>
                    </div>
                    <span class="friend-arrow">→</span>
                </div>
            `;
        }
        
        if (this.friendsList.length > 5) {
            html += `<div class="friend-row more-friends" onclick="Profile.showAllFriends()">
                        <div class="friend-avatar"><span>+</span></div>
                        <div class="friend-info">
                            <span class="friend-name">и еще ${this.friendsList.length - 5} друзей</span>
                        </div>
                        <span class="friend-arrow">→</span>
                    </div>`;
        }
        
        friendsListEl.innerHTML = html;
        console.log('✅ Друзья отображены, показано:', Math.min(this.friendsList.length, 5));
    },
    
    showFriendProfile(playerId) {
        if (window.App) App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
    },
    
    showAllFriends() {
        if (window.Team && Team.showTeamPage) {
            Team.showTeamPage();
        }
    },
    
    // Заглушки для других методов
    loadProfileFromServer() {},
    loadAvatar() {},
    updateDisplay() {},
    toggleEditMode() {},
    editName() {},
    editFaceitAge() {},
    editPremierAge() {},
    editPrimeAge() {},
    editPublicAge() {},
    applyChanges() {},
    init() {
        console.log('🚀 Profile.init()');
        // Грузим друзей сразу!
        this.loadFriends();
    }
};

// ✅ ЗАПУСК СРАЗУ
console.log('Profile.js загружен');
Profile.init();

window.Profile = Profile;

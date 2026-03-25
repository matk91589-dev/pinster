// ============================================
// ПРОФИЛЬ - МИНИМАЛЬНАЯ ВЕРСИЯ С ДРУЗЬЯМИ
// ============================================

const Profile = {
    editMode: false,
    savedName: '-',
    savedAvatar: '<div class="tg-avatar-svg"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#ffffff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff"/></svg></div>',
    savedAge: '',
    savedSteam: '',
    savedFaceitLink: '',
    savedAvatarUrl: null,
    tempName: '-',
    tempAge: '',
    tempSteam: '',
    tempFaceitLink: '',
    tempAvatarUrl: null,
    telegramId: null,
    toastTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isLoading: false,
    isProfileLoaded: false,
    isInitialized: false,
    friendsList: [],
    isFriendsLoaded: false,
    
    getTelegramId() {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            return tg.initDataUnsafe.user.id;
        }
        return null;
    },
    
    showToast(message) {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        const existingToast = document.querySelector('.profile-toast');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 1000);
    },
    
    // ✅ ЗАГРУЗКА ДРУЗЕЙ
    async loadFriends() {
        console.log('🔵🔵🔵 PROFILE.loadFriends() ВЫЗВАН 🔵🔵🔵');
        
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
            console.log('📱 Telegram ID:', this.telegramId);
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
        console.log('👥 Загрузка друзей...');
        
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
                this.isFriendsLoaded = true;
                console.log('✅ Друзей загружено:', this.friendsList.length);
                this.updateFriendsDisplay();
            } else {
                this.friendsList = [];
                this.isFriendsLoaded = true;
                console.log('❌ Нет друзей');
                this.updateFriendsDisplay();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки друзей:', error);
            this.friendsList = [];
            this.isFriendsLoaded = true;
            this.updateFriendsDisplay();
        }
    },
    
    // ✅ ОТОБРАЖЕНИЕ ДРУЗЕЙ
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
        console.log('🖼️ updateFriendsDisplay, friendsListEl:', friendsListEl);
        
        if (!friendsListEl) {
            console.warn('⚠️ friendsList не найден, повтор через 100ms');
            setTimeout(() => this.updateFriendsDisplay(), 100);
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
        console.log('✅ Друзья отображены');
    },
    
    showFriendProfile(playerId) {
        if (window.App) App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
    },
    
    showAllFriends() {
        if (window.Team && Team.showTeamPage) {
            Team.showTeamPage();
        }
    },
    
    // ✅ ЗАГРУЗКА ПРОФИЛЯ
    async loadProfileFromServer() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.isLoading = false;
            return;
        }
        
        console.log('🔥 Загрузка профиля...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.savedName = data.nick || '-';
                this.savedAge = data.age || '';
                this.savedSteam = data.steam_link || '';
                this.savedFaceitLink = data.faceit_link || '';
                
                this.tempName = this.savedName;
                this.tempAge = this.savedAge;
                this.tempSteam = this.savedSteam;
                this.tempFaceitLink = this.savedFaceitLink;
                
                localStorage.setItem('profile_nick', this.savedName);
                localStorage.setItem('profile_age', this.savedAge);
                localStorage.setItem('profile_steam', this.savedSteam);
                localStorage.setItem('profile_faceit', this.savedFaceitLink);
                
                this.updateDisplay();
                this.isProfileLoaded = true;
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
        } finally {
            this.isLoading = false;
        }
    },
    
    // ✅ ЗАГРУЗКА АВАТАРА (заглушка)
    async loadAvatar() {
        console.log('🖼️ loadAvatar вызван (заглушка)');
        // Заглушка — не делаем ничего
        return;
    },
    
    updateDisplay() {
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = this.savedName;
        
        const ageValueEl = document.getElementById('ageValue');
        if (ageValueEl) ageValueEl.value = this.savedAge || '';
        
        const steamDisplayEl = document.getElementById('steamDisplay');
        if (steamDisplayEl) steamDisplayEl.value = this.savedSteam || '';
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl) faceitLinkDisplayEl.value = this.savedFaceitLink || '';
        
        this.updateAvatarDisplay();
    },
    
    updateAvatarDisplay() {
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            if (this.savedAvatarUrl) {
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                avatarDiv.innerHTML = this.savedAvatar;
            }
        }
    },
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            if (this.editMode) {
                applyBtn.style.display = 'inline-block';
            } else {
                applyBtn.style.display = 'none';
            }
        }
    },
    
    editName() {
        this.showToast('Редактирование в разработке');
    },
    
    editFaceitAge() {
        this.showToast('Редактирование в разработке');
    },
    
    editPremierAge() {
        this.showToast('Редактирование в разработке');
    },
    
    editPrimeAge() {
        this.showToast('Редактирование в разработке');
    },
    
    editPublicAge() {
        this.showToast('Редактирование в разработке');
    },
    
    applyChanges() {
        this.showToast('Сохранение в разработке');
        this.toggleEditMode();
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init()');
        this.telegramId = this.getTelegramId();
        console.log('📱 Telegram ID:', this.telegramId);
        
        // Сначала пробуем из кэша
        const cachedNick = localStorage.getItem('profile_nick');
        if (cachedNick) {
            this.savedName = cachedNick;
            this.tempName = cachedNick;
            this.savedAge = localStorage.getItem('profile_age') || '';
            this.savedSteam = localStorage.getItem('profile_steam') || '';
            this.savedFaceitLink = localStorage.getItem('profile_faceit') || '';
            this.updateDisplay();
        }
        
        // Загружаем всё
        setTimeout(() => {
            this.loadProfileFromServer();
            this.loadAvatar();  // Теперь есть
            this.loadFriends();  // 👈 ЗАГРУЖАЕМ ДРУЗЕЙ
        }, 500);
        
        this.setupClickHandlers();
    },
    
    setupClickHandlers() {
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => this.showAllFriends();
        }
        
        const editToggle = document.getElementById('editToggle');
        if (editToggle) {
            editToggle.onclick = () => this.toggleEditMode();
        }
        
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.onclick = () => {
                this.applyChanges();
            };
        }
    }
};

// ✅ ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile: DOM загружен');
    Profile.init();
});

window.Profile = Profile;

// ============================================
// ПРОФИЛЬ - ПОЛНАЯ ВЕРСИЯ С ФОРСИРОВАННОЙ ЗАГРУЗКОЙ ДРУЗЕЙ
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
    
    generateRandomNick() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let nick = '';
        for (let i = 0; i < 6; i++) {
            nick += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nick;
    },
    
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
    
    showFieldError(container, message) {
        if (!container) return;
        this.removeErrorMessage(container);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        container.parentNode.insertBefore(errorMsg, container.nextSibling);
    },
    
    removeErrorMessage(container) {
        if (!container) return;
        const nextEl = container.nextElementSibling;
        if (nextEl && nextEl.classList.contains('error-message')) {
            nextEl.remove();
        }
    },
    
    clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.stat-value.error, .profile-stat-value.error').forEach(el => {
            el.classList.remove('error');
        });
    },
    
    loadFromCache() {
        const cachedNick = localStorage.getItem('profile_nick');
        const cachedAge = localStorage.getItem('profile_age');
        const cachedSteam = localStorage.getItem('profile_steam');
        const cachedFaceit = localStorage.getItem('profile_faceit');
        const cachedAvatar = localStorage.getItem('profile_avatar');
        
        if (cachedNick) {
            this.savedName = cachedNick;
            this.tempName = cachedNick;
            if (cachedAge) this.savedAge = cachedAge;
            if (cachedSteam) this.savedSteam = cachedSteam;
            if (cachedFaceit) this.savedFaceitLink = cachedFaceit;
            if (cachedAvatar) this.savedAvatarUrl = cachedAvatar;
            
            this.updateDisplay();
            console.log('✅ Профиль загружен из кэша');
            return true;
        }
        return false;
    },
    
    // ✅ ЗАГРУЗКА ДРУЗЕЙ
    async loadFriends() {
        console.log('🔵🔵🔵 PROFILE.loadFriends() ВЫЗВАН 🔵🔵🔵');
        
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id для загрузки друзей');
            return;
        }
        
        console.log('👥 PROFILE: Загрузка друзей...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const data = await response.json();
            console.log('📦 PROFILE: Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.isFriendsLoaded = true;
                console.log('✅ PROFILE: Друзей загружено:', this.friendsList.length);
                this.updateFriendsDisplay();
            } else {
                this.friendsList = [];
                this.isFriendsLoaded = true;
                console.log('❌ PROFILE: Нет друзей');
                this.updateFriendsDisplay();
            }
        } catch (error) {
            console.error('❌ PROFILE: Ошибка загрузки друзей:', error);
            this.friendsList = [];
            this.isFriendsLoaded = true;
            this.updateFriendsDisplay();
        }
    },
    
    // ✅ ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ДРУЗЕЙ
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
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
            const remaining = this.friendsList.length - 5;
            const word = this.getFriendsWord(remaining);
            html += `<div class="friend-row more-friends" onclick="Profile.showAllFriends()">
                        <div class="friend-avatar"><span>+</span></div>
                        <div class="friend-info">
                            <span class="friend-name">и еще ${remaining} ${word}</span>
                        </div>
                        <span class="friend-arrow">→</span>
                    </div>`;
        }
        
        friendsListEl.innerHTML = html;
        console.log('✅ PROFILE: Друзья отображены');
    },
    
    getFriendsWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'друг';
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'друга';
        return 'друзей';
    },
    
    showFriendProfile(playerId) {
        if (window.App) App.showAlert(`Профиль друга ${playerId}\n(функция в разработке)`);
    },
    
    showAllFriends() {
        if (window.Team && Team.showTeamPage) {
            Team.showTeamPage();
        }
    },
    
    async loadProfileFromServer(force = false) {
        if (!force && this.isProfileLoaded) return;
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
    
    async loadAvatar() {
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) return;
        
        const cachedAvatar = localStorage.getItem('profile_avatar');
        if (cachedAvatar && !this.savedAvatarUrl) {
            this.savedAvatarUrl = cachedAvatar;
            this.tempAvatarUrl = cachedAvatar;
            this.updateAvatarDisplay();
            console.log('✅ Аватар из кэша');
        }
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.avatar) {
                this.savedAvatarUrl = data.avatar;
                this.tempAvatarUrl = data.avatar;
                localStorage.setItem('profile_avatar', data.avatar);
                this.updateAvatarDisplay();
            }
        } catch (error) {
            console.error('❌ Ошибка аватара:', error);
        }
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init()');
        
        this.telegramId = this.getTelegramId();
        console.log('📱 Profile telegramId:', this.telegramId);
        
        this.loadFromCache();
        
        setTimeout(() => {
            this.loadProfileFromServer();
            this.loadAvatar();
            this.loadFriends();
        }, 500);
        
        this.setupClickHandlers();
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
        this.clearAllErrors();
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
            applyBtn.style.display = this.editMode ? 'inline-block' : 'none';
        }
    },
    
    editName() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        // Заглушка
    },
    
    editFaceitAge() {},
    editPremierAge() {},
    editPrimeAge() {},
    editPublicAge() {},
    editAge() {},
    editSteam() {},
    editFaceitLink() {},
    validateAge() { return true; },
    validateSteamLink() { return true; },
    validateFaceitLink() { return true; },
    applyChanges() {
        this.toggleEditMode();
        this.showToast('Сохранение в разработке');
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
            applyBtn.onclick = () => this.applyChanges();
        }
    }
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile: DOM загружен');
    Profile.init();
});

window.Profile = Profile;

// ФОРСИРОВАННАЯ ЗАГРУЗКА ДРУЗЕЙ (НА ВСЯКИЙ СЛУЧАЙ)
setTimeout(() => {
    if (window.Profile && !window.Profile.isFriendsLoaded) {
        console.log('🔥🔥🔥 ФОРСИРОВАННАЯ ЗАГРУЗКА ДРУЗЕЙ 🔥🔥🔥');
        window.Profile.loadFriends();
    }
}, 1500);

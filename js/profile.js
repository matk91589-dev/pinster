// ============================================
// ПРОФИЛЬ - ОПТИМИЗИРОВАННЫЙ С КЭШИРОВАНИЕМ
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
    tempAvatar: '<div class="tg-avatar-svg"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#ffffff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff"/></svg></div>',
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
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tg_id');
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
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 PROFILE: Ответ друзей:', data);
            
            if (data.status === 'ok' && data.friends && data.friends.length > 0) {
                this.friendsList = data.friends;
                this.isFriendsLoaded = true;
                console.log('✅ PROFILE: Друзья загружены:', this.friendsList.length);
            } else {
                this.friendsList = [];
                this.isFriendsLoaded = true;
                console.log('❌ PROFILE: Нет друзей');
            }
            
            this.updateFriendsDisplay();
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
            console.warn('⚠️ friendsList не найден в DOM, повтор через 100ms');
            setTimeout(() => this.updateFriendsDisplay(), 100);
            return;
        }
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши друзья: ${this.friendsList.length}`;
        }
        
        if (!this.friendsList.length) {
            friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">у вас пока нет друзей</div></div>';
            console.log('📋 PROFILE: Отображение друзей — пусто');
            return;
        }
        
        let html = '';
        const showCount = Math.min(this.friendsList.length, 5);
        
        for (let i = 0; i < showCount; i++) {
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
                    <span class="friend-arrow orange-arrow">→</span>
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
                        <span class="friend-arrow orange-arrow">→</span>
                    </div>`;
        }
        
        friendsListEl.innerHTML = html;
        
        // Добавляем стили для оранжевых стрелок
        this.injectArrowStyles();
        
        console.log('✅ PROFILE: Отображение друзей обновлено, показано:', showCount, 'из', this.friendsList.length);
    },
    
    // 🎨 ДОБАВЛЯЕМ СТИЛИ ДЛЯ ОРАНЖЕВЫХ СТРЕЛОК
    injectArrowStyles() {
        if (document.getElementById('profile-arrow-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'profile-arrow-styles';
        style.textContent = `
            .friend-arrow.orange-arrow {
                color: #FF5500 !important;
                font-size: 18px;
                font-weight: 300;
                opacity: 0.9;
            }
            .more-friends .friend-arrow.orange-arrow {
                color: #FF5500 !important;
            }
        `;
        document.head.appendChild(style);
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
        } else {
            if (window.App) App.showScreen('teamScreen', true);
        }
    },
    
    async loadProfileFromServer(force = false) {
        if (!force && this.isProfileLoaded) {
            console.log('✅ Профиль уже загружен');
            return;
        }
        
        if (this.isLoading) {
            console.log('⏳ Профиль уже загружается...');
            return;
        }
        
        this.isLoading = true;
        
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
        }
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            this.isLoading = false;
            return;
        }
        
        console.log('🔥 Загрузка профиля с сервера...');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/profile/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📦 Данные профиля с сервера:', data);
            
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
                console.log('✅ Профиль загружен с сервера');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Таймаут загрузки профиля (3 сек)');
            } else {
                console.error('❌ Ошибка загрузки профиля:', error);
            }
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
        
        console.log('🖼️ Загрузка аватара с сервера...');
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'ok' && data.avatar) {
                this.savedAvatarUrl = data.avatar;
                this.tempAvatarUrl = data.avatar;
                localStorage.setItem('profile_avatar', data.avatar);
                this.updateAvatarDisplay();
                console.log('✅ Аватар загружен');
            }
        } catch (error) {
            console.error('❌ Ошибка аватара:', error);
        }
    },
    
    // ✅ ИНИЦИАЛИЗАЦИЯ
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init()');
        
        this.telegramId = this.getTelegramId();
        console.log('📱 Profile telegramId:', this.telegramId);
        
        this.loadFromCache();
        
        // Загружаем всё
        setTimeout(() => {
            this.loadProfileFromServer();
            this.loadAvatar();
            this.loadFriends();
        }, 500);
        
        this.setupListeners();
        this.setupClickHandlers();
        
        // Устанавливаем прямые обработчики на карточки
        this.setupCardHandlers();
    },
    
    // ПРЯМЫЕ ОБРАБОТЧИКИ ДЛЯ КАРТОЧЕК
    setupCardHandlers() {
        console.log('🔧 Устанавливаем обработчики на карточки...');
        
        // Возраст
        const ageCard = document.getElementById('ageCard');
        if (ageCard) {
            ageCard.style.cursor = 'pointer';
            ageCard.onclick = (e) => {
                console.log('🖱️ Клик по возрасту, editMode:', this.editMode);
                if (this.editMode) {
                    this.editAge();
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            };
            console.log('✅ Обработчик возраста установлен');
        } else {
            console.warn('⚠️ ageCard не найден');
        }
        
        // Steam
        const steamCard = document.getElementById('steamCard');
        if (steamCard) {
            steamCard.style.cursor = 'pointer';
            steamCard.onclick = (e) => {
                console.log('🖱️ Клик по Steam, editMode:', this.editMode);
                if (this.editMode) {
                    this.editSteam();
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            };
            console.log('✅ Обработчик Steam установлен');
        } else {
            console.warn('⚠️ steamCard не найден');
        }
        
        // Faceit
        const faceitCard = document.getElementById('faceitCard');
        if (faceitCard) {
            faceitCard.style.cursor = 'pointer';
            faceitCard.onclick = (e) => {
                console.log('🖱️ Клик по Faceit, editMode:', this.editMode);
                if (this.editMode) {
                    this.editFaceitLink();
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            };
            console.log('✅ Обработчик Faceit установлен');
        } else {
            console.warn('⚠️ faceitCard не найден');
        }
    },
    
    updateDisplay() {
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl && profileNameEl.textContent !== this.savedName) {
            profileNameEl.textContent = this.savedName;
        }
        
        const ageValueEl = document.getElementById('ageValue');
        if (ageValueEl && ageValueEl.value !== this.savedAge) {
            ageValueEl.value = this.savedAge || '';
        }
        
        const steamDisplayEl = document.getElementById('steamDisplay');
        if (steamDisplayEl && steamDisplayEl.value !== this.savedSteam) {
            steamDisplayEl.value = this.savedSteam || '';
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl && faceitLinkDisplayEl.value !== this.savedFaceitLink) {
            faceitLinkDisplayEl.value = this.savedFaceitLink || '';
        }
        
        this.updateAvatarDisplay();
        this.clearAllErrors();
    },
    
    updateAvatarDisplay() {
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            if (this.savedAvatarUrl) {
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                avatarDiv.innerHTML = this.savedAvatar;
            }
        }
    },
    
    toggleEditMode() {
        if (window.Settings) Settings.click();
        this.editMode = !this.editMode;
        
        const profileScreen = document.getElementById('profileScreen');
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        const profileName = document.getElementById('profileName');
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        const avatar = document.getElementById('profileAvatar');
        
        this.clearAllErrors();
        
        if (this.editMode) {
            if (profileScreen) profileScreen.classList.add('editable');
            if (editToggle) editToggle.classList.add('active');
            if (applyBtn) {
                applyBtn.classList.add('visible');
                applyBtn.style.display = 'inline-block';
            }
            if (ageInput) ageInput.readOnly = false;
            if (steamInput) steamInput.readOnly = false;
            if (faceitInput) faceitInput.readOnly = false;
            if (profileName) profileName.classList.add('editable');
            if (avatar) avatar.classList.add('editable-avatar');
        } else {
            if (profileScreen) profileScreen.classList.remove('editable');
            if (editToggle) editToggle.classList.remove('active');
            if (applyBtn) {
                applyBtn.classList.remove('visible');
                applyBtn.style.display = 'none';
            }
            if (ageInput) ageInput.readOnly = true;
            if (steamInput) steamInput.readOnly = true;
            if (faceitInput) faceitInput.readOnly = true;
            if (profileName) profileName.classList.remove('editable');
            if (avatar) avatar.classList.remove('editable-avatar');
            if (this.tempAvatarUrl !== this.savedAvatarUrl) {
                this.tempAvatarUrl = this.savedAvatarUrl;
                this.updateAvatarDisplay();
            }
        }
    },
    
    validateAge(ageStr) {
        const ageInput = document.getElementById('ageValue');
        const container = ageInput?.closest('.stat-value');
        this.removeErrorMessage(container);
        
        if (ageStr === '') {
            this.tempAge = '';
            container?.classList.remove('error');
            return true;
        }
        
        if (ageStr.length > 3) {
            container?.classList.add('error');
            this.showFieldError(container, 'возраст от 1 до 100');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        const age = parseInt(ageStr);
        if (isNaN(age) || age < 0 || age > 100) {
            container?.classList.add('error');
            this.showFieldError(container, 'возраст от 1 до 100');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        this.tempAge = ageStr;
        container?.classList.remove('error');
        return true;
    },

    validateSteamLink(link) {
        const steamInput = document.getElementById('steamDisplay');
        const container = steamInput?.closest('.profile-stat-value');
        this.removeErrorMessage(container);
        
        if (link === '') {
            this.tempSteam = '';
            container?.classList.remove('error');
            return true;
        }
        
        if (link.length > 100) {
            container?.classList.add('error');
            this.showFieldError(container, 'некорректный ввод');
            return false;
        }
        
        container?.classList.remove('error');
        this.tempSteam = link;
        return true;
    },

    validateFaceitLink(link) {
        const faceitInput = document.getElementById('faceitLinkDisplay');
        const container = faceitInput?.closest('.profile-stat-value');
        this.removeErrorMessage(container);
        
        if (link === '') {
            this.tempFaceitLink = '';
            container?.classList.remove('error');
            return true;
        }
        
        if (link.length > 100) {
            container?.classList.add('error');
            this.showFieldError(container, 'некорректный ввод');
            return false;
        }
        
        container?.classList.remove('error');
        this.tempFaceitLink = link;
        return true;
    },
    
    async applyChanges() {
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.style.pointerEvents = 'none';
            applyBtn.style.opacity = '0.5';
        }
        
        this.clearAllErrors();
        
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
            if (!this.telegramId) {
                if (applyBtn) {
                    applyBtn.style.pointerEvents = 'auto';
                    applyBtn.style.opacity = '1';
                }
                return;
            }
        }

        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');

        let isValid = true;
        if (ageInput && !this.validateAge(ageInput.value)) isValid = false;
        if (steamInput && !this.validateSteamLink(steamInput.value)) isValid = false;
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) isValid = false;
        
        if (!isValid) {
            if (window.Settings) Settings.error();
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }

        const dataToSend = {
            telegram_id: this.telegramId,
            nick: this.tempName,
            age: ageInput ? ageInput.value || null : null,
            steam_link: steamInput ? steamInput.value || null : null,
            faceit_link: faceitInput ? faceitInput.value || null : null,
            avatar: this.tempAvatarUrl || null
        };

        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.savedName = this.tempName;
                this.savedAge = ageInput ? ageInput.value : '';
                this.savedSteam = steamInput ? steamInput.value : '';
                this.savedFaceitLink = faceitInput ? faceitInput.value : '';
                this.savedAvatarUrl = this.tempAvatarUrl;
                
                localStorage.setItem('profile_nick', this.savedName);
                localStorage.setItem('profile_age', this.savedAge);
                localStorage.setItem('profile_steam', this.savedSteam);
                localStorage.setItem('profile_faceit', this.savedFaceitLink);
                if (this.savedAvatarUrl) localStorage.setItem('profile_avatar', this.savedAvatarUrl);
                
                this.updateDisplay();
                this.toggleEditMode();
                this.showToast('Профиль сохранен');
                if (window.Settings) Settings.success();
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            this.showToast('Ошибка сохранения');
            if (window.Settings) Settings.error();
        } finally {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
        }
    },
    
    editName() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        if (window.Settings) Settings.click();
        const profileName = document.getElementById('profileName');
        if (!profileName) return;
        
        const existingInput = profileName.parentNode.querySelector('.profile-name-input');
        if (existingInput) {
            existingInput.focus();
            return;
        }
        
        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.className = 'profile-name-input';
        tempInput.value = this.tempName;
        tempInput.maxLength = 10;
        tempInput.style.cssText = `width:100%; background:transparent; border:none; color:#FF5500; font-size:clamp(16px,5vw,20px); font-weight:600; outline:none; padding:4px 0; margin:0;`;
        
        profileName.style.display = 'none';
        profileName.parentNode.insertBefore(tempInput, profileName.nextSibling);
        setTimeout(() => tempInput.focus(), 50);
        
        const saveHandler = () => {
            const newName = tempInput.value.trim();
            if (newName && newName.length >= 3 && newName.length <= 10) {
                this.tempName = newName;
                profileName.textContent = newName;
                this.showToast('Нажмите Применить для сохранения');
            } else if (newName && (newName.length < 3 || newName.length > 10)) {
                this.showToast('Никнейм должен быть от 3 до 10 символов');
                if (window.Settings) Settings.error();
            }
            tempInput.remove();
            profileName.style.display = 'inline-block';
        };
        
        tempInput.addEventListener('blur', saveHandler, { once: true });
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveHandler();
            }
        });
    },
    
    editAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        if (window.Settings) Settings.click();
        document.getElementById('ageValue')?.focus();
    },
    
    editSteam() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        if (window.Settings) Settings.click();
        document.getElementById('steamDisplay')?.focus();
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        if (window.Settings) Settings.click();
        document.getElementById('faceitLinkDisplay')?.focus();
    },
    
    editFaceitAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('faceitAgeValue')?.focus();
    },
    
    editPremierAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('premierAgeValue')?.focus();
    },
    
    editPrimeAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('primeAgeValue')?.focus();
    },
    
    editPublicAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('publicAgeValue')?.focus();
    },
    
    setupClickHandlers() {
        // Аватар
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.style.cursor = 'pointer';
            avatar.onclick = (e) => {
                if (this.editMode) {
                    if (window.Avatar && Avatar.select) {
                        if (window.Settings) Settings.click();
                        Avatar.select();
                    }
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            };
        }
        
        // Ник
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.style.cursor = 'pointer';
            profileName.onclick = (e) => {
                if (this.editMode) this.editName();
                else this.showToast('Для изменений перейдите в режим редактирования');
            };
        }
        
        // Стрелка друзей
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => {
                this.showAllFriends();
            };
        }
    },
    
    setupListeners() {
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.onblur = () => { if (this.editMode) this.validateAge(ageInput.value); };
            ageInput.onfocus = () => {
                if (this.editMode) {
                    const container = ageInput.closest('.stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            };
            ageInput.oninput = () => {
                if (this.editMode) {
                    const val = ageInput.value;
                    const container = ageInput.closest('.stat-value');
                    if (val === '' || (val.length <= 3 && !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100)) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            };
        }
        
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            steamInput.onblur = () => { if (this.editMode) this.validateSteamLink(steamInput.value); };
            steamInput.onfocus = () => {
                if (this.editMode) {
                    const container = steamInput.closest('.profile-stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            };
            steamInput.oninput = () => {
                if (this.editMode) {
                    const val = steamInput.value;
                    const container = steamInput.closest('.profile-stat-value');
                    if (val.length <= 100) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            };
        }
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            faceitInput.onblur = () => { if (this.editMode) this.validateFaceitLink(faceitInput.value); };
            faceitInput.onfocus = () => {
                if (this.editMode) {
                    const container = faceitInput.closest('.profile-stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            };
            faceitInput.oninput = () => {
                if (this.editMode) {
                    const val = faceitInput.value;
                    const container = faceitInput.closest('.profile-stat-value');
                    if (val.length <= 100) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            };
        }
        
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) applyBtn.style.display = 'none';
    }
};

// ✅ ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile: DOM загружен');
    Profile.init();
});

window.Profile = Profile;

// 🔥 ФОРСИРОВАННАЯ ЗАГРУЗКА ДРУЗЕЙ
setTimeout(() => {
    if (window.Profile && !window.Profile.isFriendsLoaded) {
        console.log('🔥🔥🔥 ФОРСИРОВАННАЯ ЗАГРУЗКА ДРУЗЕЙ 🔥🔥🔥');
        window.Profile.loadFriends();
    }
}, 1500);

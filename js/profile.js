// ============================================
// ПРОФИЛЬ - С ЖЁСТКОЙ ВАЛИДАЦИЕЙ
// ============================================

console.log('🔥 PROFILE.JS ЗАГРУЖЕН');

// Константы валидации
const VALIDATION = {
    NICK: {
        min: 2,
        max: 10,  // БЫЛО 32, СТАЛО 10
        pattern: /^[a-zA-Z0-9_]+$/,
        error: 'Ник: 2-10 латинских букв, цифр или _'
    },
    AGE: {
        min: 0,
        max: 100,
        error: 'Возраст: от 0 до 100'
    },
    STEAM: {
        patterns: [
            /^https:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/,
            /^https:\/\/s\.team\/[a-zA-Z0-9_-]+\/?$/
        ],
        maxLength: 100,
        error: 'Ссылка Steam: steamcommunity.com/id/... или s.team/...'
    },
    FACEIT: {
        pattern: /^https:\/\/www\.faceit\.com\/[a-z]{2}\/players\/[a-zA-Z0-9_-]+\/?$/,
        maxLength: 100,
        error: 'Ссылка FaceIT: faceit.com/ru/players/...'
    }
};

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
    isLoadingFriends: false,
    
    // ========== ВАЛИДАЦИЯ ==========
    validateNick(nick) {
        if (!nick || nick.length < VALIDATION.NICK.min || nick.length > VALIDATION.NICK.max) {
            return { valid: false, error: VALIDATION.NICK.error };
        }
        if (!VALIDATION.NICK.pattern.test(nick)) {
            return { valid: false, error: VALIDATION.NICK.error };
        }
        return { valid: true };
    },
    
    validateAge(age) {
        if (age === '' || age === null || age === undefined) {
            return { valid: true }; // Пустое - ок
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < VALIDATION.AGE.min || ageNum > VALIDATION.AGE.max) {
            return { valid: false, error: VALIDATION.AGE.error };
        }
        return { valid: true, value: ageNum };
    },
    
    validateSteamLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true }; // Пустое - ок
        }
        
        // Проверка длины
        if (link.length > VALIDATION.STEAM.maxLength) {
            return { valid: false, error: `Ссылка Steam не может быть длиннее ${VALIDATION.STEAM.maxLength} символов` };
        }
        
        // Проверка формата
        const trimmedLink = link.trim().replace(/\/$/, ''); // Убираем слеш в конце
        const isValid = VALIDATION.STEAM.patterns.some(pattern => pattern.test(trimmedLink));
        
        if (!isValid) {
            return { valid: false, error: VALIDATION.STEAM.error };
        }
        
        return { valid: true, value: trimmedLink };
    },
    
    validateFaceitLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true }; // Пустое - ок
        }
        
        // Проверка длины
        if (link.length > VALIDATION.FACEIT.maxLength) {
            return { valid: false, error: `Ссылка FaceIT не может быть длиннее ${VALIDATION.FACEIT.maxLength} символов` };
        }
        
        // Проверка формата
        const trimmedLink = link.trim().replace(/\/$/, '');
        if (!VALIDATION.FACEIT.pattern.test(trimmedLink)) {
            return { valid: false, error: VALIDATION.FACEIT.error };
        }
        
        return { valid: true, value: trimmedLink };
    },
    
    getTelegramId() {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) {
            return tg.initDataUnsafe.user.id;
        }
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tg_id');
    },
    
    showToast(message, isError = false) {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        const existingToast = document.querySelector('.profile-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        if (isError) {
            toast.style.background = 'rgba(255, 59, 48, 0.9)';
        }
        toast.textContent = message;
        document.body.appendChild(toast);
        
        toast.offsetHeight;
        toast.classList.add('show');
        
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, isError ? 3000 : 2000);
    },
    
    // Функция копирования в буфер обмена
    copyToClipboard(text, btnElement) {
        if (!text || text === '' || text === 'Не указана') {
            this.showToast('Нет данных для копирования');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Скопировано в буфер обмена');
            if (btnElement) {
                btnElement.classList.add('copied');
                setTimeout(() => btnElement.classList.remove('copied'), 1500);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showToast('Ошибка копирования');
        });
    },
    
    // Обновление отображения ссылок с кнопками копирования
    updateLinksWithCopy() {
        // Steam ссылка
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput && this.savedSteam && this.savedSteam !== '') {
            const parent = steamInput.parentNode;
            
            let wrapper = parent.querySelector('.link-with-copy');
            if (!wrapper && parent !== steamInput) {
                wrapper = document.createElement('div');
                wrapper.className = 'link-with-copy';
                steamInput.parentNode.insertBefore(wrapper, steamInput);
                wrapper.appendChild(steamInput);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(this.savedSteam, copyBtn);
                };
                wrapper.appendChild(copyBtn);
            }
        }
        
        // Faceit ссылка
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput && this.savedFaceitLink && this.savedFaceitLink !== '') {
            const parent = faceitInput.parentNode;
            
            let wrapper = parent.querySelector('.link-with-copy');
            if (!wrapper && parent !== faceitInput) {
                wrapper = document.createElement('div');
                wrapper.className = 'link-with-copy';
                faceitInput.parentNode.insertBefore(wrapper, faceitInput);
                wrapper.appendChild(faceitInput);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(this.savedFaceitLink, copyBtn);
                };
                wrapper.appendChild(copyBtn);
            }
        }
    },
    
    // Загрузка друзей для профиля
    async loadFriends() {
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
        }
        if (!this.telegramId || this.isFriendsLoaded || this.isLoadingFriends) return;
        
        this.isLoadingFriends = true;
        
        this.updateFriendsLoading();
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data.status === 'ok' && data.friends) {
                this.friendsList = data.friends;
                this.isFriendsLoaded = true;
                this.updateFriendsDisplay();
                console.log('✅ Тиммейты загружены:', this.friendsList.length);
            } else {
                this.friendsList = [];
                this.isFriendsLoaded = true;
                this.updateFriendsDisplay();
            }
        } catch (error) {
            console.error('Ошибка загрузки тиммейтов:', error);
            this.friendsList = [];
            this.isFriendsLoaded = true;
            this.updateFriendsDisplay();
        } finally {
            this.isLoadingFriends = false;
        }
    },
    
    updateFriendsLoading() {
        const friendsListEl = document.getElementById('friendsList');
        if (!friendsListEl) return;
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = 'Ваши тиммейты:';
        }
        
        friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">загрузка тиммейтов...</div></div>';
    },
    
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
        if (!friendsListEl) return;
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши тиммейты: ${this.friendsList.length}`;
        }
        
        if (!this.friendsList.length) {
            friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">у вас пока нет друзей</div></div>';
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
    },
    
    getFriendsWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'тиммейт';
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'тиммейта';
        return 'тиммейтов';
    },
    
    showFriendProfile(playerId) {
        this.showToast(`Профиль тиммейта ID: ${playerId}`);
    },
    
    showAllFriends() {
        if (window.Team && Team.showTeamPage) {
            Team.showTeamPage();
        } else if (window.App) {
            App.showScreen('teamScreen', true);
        }
    },
    
    async loadProfileFromServer() {
        if (this.isProfileLoaded || this.isLoading) return;
        
        this.isLoading = true;
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.isLoading = false;
            return;
        }
        
        const cachedNick = localStorage.getItem('profile_nick');
        if (cachedNick) {
            this.savedName = cachedNick;
            this.savedAge = localStorage.getItem('profile_age') || '';
            this.savedSteam = localStorage.getItem('profile_steam') || '';
            this.savedFaceitLink = localStorage.getItem('profile_faceit') || '';
            this.updateDisplay();
        }
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    this.savedName = data.nick || '-';
                    this.savedAge = data.age || '';
                    this.savedSteam = data.steam_link || '';
                    this.savedFaceitLink = data.faceit_link || '';
                    
                    localStorage.setItem('profile_nick', this.savedName);
                    localStorage.setItem('profile_age', this.savedAge);
                    localStorage.setItem('profile_steam', this.savedSteam);
                    localStorage.setItem('profile_faceit', this.savedFaceitLink);
                    
                    this.updateDisplay();
                    this.isProfileLoaded = true;
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        } finally {
            this.isLoading = false;
        }
    },
    
    async loadAvatar() {
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) return;
        
        const cachedAvatar = localStorage.getItem('profile_avatar');
        if (cachedAvatar && cachedAvatar !== 'null') {
            this.savedAvatarUrl = cachedAvatar;
            this.updateAvatarDisplay();
        }
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && data.avatar && data.avatar !== 'null') {
                    this.savedAvatarUrl = data.avatar;
                    localStorage.setItem('profile_avatar', data.avatar);
                    this.updateAvatarDisplay();
                    console.log('✅ Аватар загружен');
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
        }
    },
    
    updateAvatarDisplay() {
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            if (this.savedAvatarUrl && this.savedAvatarUrl !== 'null') {
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                avatarDiv.innerHTML = this.savedAvatar;
            }
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
            setTimeout(() => this.updateLinksWithCopy(), 50);
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl && faceitLinkDisplayEl.value !== this.savedFaceitLink) {
            faceitLinkDisplayEl.value = this.savedFaceitLink || '';
            setTimeout(() => this.updateLinksWithCopy(), 50);
        }
        
        this.updateAvatarDisplay();
    },
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const profileScreen = document.getElementById('profileScreen');
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        const profileName = document.getElementById('profileName');
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        const avatar = document.getElementById('profileAvatar');
        
        if (this.editMode) {
            profileScreen?.classList.add('editable');
            editToggle?.classList.add('active');
            if (applyBtn) {
                applyBtn.classList.add('visible');
                applyBtn.style.display = 'inline-block';
            }
            if (ageInput) {
                ageInput.readOnly = false;
                ageInput.maxLength = 3;  // Защита от миллиона
            }
            if (steamInput) {
                steamInput.readOnly = false;
                steamInput.maxLength = VALIDATION.STEAM.maxLength;
            }
            if (faceitInput) {
                faceitInput.readOnly = false;
                faceitInput.maxLength = VALIDATION.FACEIT.maxLength;
            }
            if (profileName) profileName.classList.add('editable');
            if (avatar) avatar.classList.add('editable-avatar');
            this.showToast('Режим редактирования включен');
        } else {
            profileScreen?.classList.remove('editable');
            editToggle?.classList.remove('active');
            if (applyBtn) {
                applyBtn.classList.remove('visible');
                applyBtn.style.display = 'none';
            }
            if (ageInput) ageInput.readOnly = true;
            if (steamInput) steamInput.readOnly = true;
            if (faceitInput) faceitInput.readOnly = true;
            if (profileName) profileName.classList.remove('editable');
            if (avatar) avatar.classList.remove('editable-avatar');
        }
    },
    
    async applyChanges() {
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.style.pointerEvents = 'none';
            applyBtn.style.opacity = '0.5';
        }
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.showToast('Ошибка: нет Telegram ID', true);
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        const updateData = {};
        let hasErrors = false;
        
        // Валидация ника
        const newNick = this.savedName;
        if (newNick && newNick !== '-') {
            const nickValidation = this.validateNick(newNick);
            if (!nickValidation.valid) {
                this.showToast(nickValidation.error, true);
                hasErrors = true;
            } else {
                updateData.nick = newNick;
            }
        }
        
        // Валидация возраста
        const newAge = ageInput?.value;
        if (newAge !== this.savedAge) {
            const ageValidation = this.validateAge(newAge);
            if (!ageValidation.valid) {
                this.showToast(ageValidation.error, true);
                hasErrors = true;
            } else {
                updateData.age = ageValidation.value || null;
            }
        }
        
        // Валидация Steam
        const newSteam = steamInput?.value;
        if (newSteam !== this.savedSteam) {
            const steamValidation = this.validateSteamLink(newSteam);
            if (!steamValidation.valid) {
                this.showToast(steamValidation.error, true);
                hasErrors = true;
            } else {
                updateData.steam_link = steamValidation.value || null;
            }
        }
        
        // Валидация FaceIT
        const newFaceit = faceitInput?.value;
        if (newFaceit !== this.savedFaceitLink) {
            const faceitValidation = this.validateFaceitLink(newFaceit);
            if (!faceitValidation.valid) {
                this.showToast(faceitValidation.error, true);
                hasErrors = true;
            } else {
                updateData.faceit_link = faceitValidation.value || null;
            }
        }
        
        if (hasErrors) {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        if (Object.keys(updateData).length === 0) {
            this.toggleEditMode();
            this.showToast('Нет изменений');
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        updateData.telegram_id = this.telegramId;
        
        console.log('📤 Отправка данных:', updateData);
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'ok') {
                if (updateData.nick) this.savedName = updateData.nick;
                if (updateData.age !== undefined) this.savedAge = updateData.age || '';
                if (updateData.steam_link !== undefined) this.savedSteam = updateData.steam_link || '';
                if (updateData.faceit_link !== undefined) this.savedFaceitLink = updateData.faceit_link || '';
                
                localStorage.setItem('profile_nick', this.savedName);
                localStorage.setItem('profile_age', this.savedAge);
                localStorage.setItem('profile_steam', this.savedSteam);
                localStorage.setItem('profile_faceit', this.savedFaceitLink);
                
                this.updateDisplay();
                this.toggleEditMode();
                this.showToast('Профиль сохранен');
            } else {
                console.error('Ошибка сервера:', data);
                this.showToast(data.error || 'Ошибка сохранения', true);
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            this.showToast('Ошибка сохранения', true);
        } finally {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
        }
    },
    
    editName() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования', true);
            return;
        }
        
        const profileName = document.getElementById('profileName');
        if (!profileName) return;
        
        const currentName = this.savedName === '-' ? '' : this.savedName;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = 'Ник (2-10 символов)';
        input.maxLength = VALIDATION.NICK.max;
        input.style.cssText = `
            background: #1A1D24;
            border: 1px solid #FF5500;
            border-radius: 8px;
            color: #FF5500;
            font-size: 18px;
            font-weight: 600;
            padding: 8px 12px;
            width: 100%;
            outline: none;
            font-family: inherit;
        `;
        
        profileName.style.display = 'none';
        profileName.parentNode.insertBefore(input, profileName.nextSibling);
        input.focus();
        
        const save = () => {
            const newName = input.value.trim();
            const validation = this.validateNick(newName);
            
            if (validation.valid) {
                this.savedName = newName;
                profileName.textContent = newName;
                localStorage.setItem('profile_nick', newName);
                this.showToast('Нажмите "Применить" для сохранения');
            } else {
                this.showToast(validation.error, true);
                input.focus();
                return;
            }
            
            input.remove();
            profileName.style.display = 'inline-block';
        };
        
        input.addEventListener('blur', save, { once: true });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                save();
            }
        });
    },
    
    editAge() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования', true);
            return;
        }
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.focus();
            ageInput.select();
        }
    },
    
    editSteam() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования', true);
            return;
        }
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            steamInput.focus();
            steamInput.select();
        }
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования', true);
            return;
        }
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            faceitInput.focus();
            faceitInput.select();
        }
    },
    
    setupClickHandlers() {
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.style.cursor = 'pointer';
            avatar.onclick = () => {
                if (this.editMode) {
                    if (window.Avatar?.select) Avatar.select();
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования', true);
                }
            };
        }
        
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.style.cursor = 'pointer';
            profileName.onclick = () => this.editName();
        }
        
        const ageCard = document.getElementById('ageCard');
        if (ageCard) {
            ageCard.style.cursor = 'pointer';
            ageCard.onclick = () => this.editAge();
        } else {
            const ageStatCard = document.querySelector('.stat-card:last-child');
            if (ageStatCard) {
                ageStatCard.style.cursor = 'pointer';
                ageStatCard.onclick = () => this.editAge();
            }
        }
        
        const steamCard = document.getElementById('steamCard');
        if (steamCard) {
            steamCard.style.cursor = 'pointer';
            steamCard.onclick = () => this.editSteam();
        } else {
            const steamStatCard = document.querySelector('.profile-stat-card:first-child');
            if (steamStatCard) {
                steamStatCard.style.cursor = 'pointer';
                steamStatCard.onclick = () => this.editSteam();
            }
        }
        
        const faceitCard = document.getElementById('faceitCard');
        if (faceitCard) {
            faceitCard.style.cursor = 'pointer';
            faceitCard.onclick = () => this.editFaceitLink();
        } else {
            const faceitStatCard = document.querySelector('.profile-stat-card:last-child');
            if (faceitStatCard) {
                faceitStatCard.style.cursor = 'pointer';
                faceitStatCard.onclick = () => this.editFaceitLink();
            }
        }
        
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => {
                if (window.Team?.showTeamPage) Team.showTeamPage();
            };
        }
        
        // Устанавливаем maxLength на все инпуты
        const ageInput = document.getElementById('ageValue');
        if (ageInput) ageInput.maxLength = 3;
        
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) steamInput.maxLength = VALIDATION.STEAM.maxLength;
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) faceitInput.maxLength = VALIDATION.FACEIT.maxLength;
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init()');
        this.telegramId = this.getTelegramId();
        
        const cachedNick = localStorage.getItem('profile_nick');
        if (cachedNick) {
            this.savedName = cachedNick;
            this.savedAge = localStorage.getItem('profile_age') || '';
            this.savedSteam = localStorage.getItem('profile_steam') || '';
            this.savedFaceitLink = localStorage.getItem('profile_faceit') || '';
            this.updateDisplay();
        }
        
        const cachedAvatar = localStorage.getItem('profile_avatar');
        if (cachedAvatar && cachedAvatar !== 'null') {
            this.savedAvatarUrl = cachedAvatar;
            this.updateAvatarDisplay();
        }
        
        setTimeout(() => {
            this.loadProfileFromServer();
            this.loadAvatar();
            this.loadFriends();
        }, 100);
        
        this.setupClickHandlers();
    }
};

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Profile.init());
} else {
    Profile.init();
}

window.Profile = Profile;

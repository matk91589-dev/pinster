// ============================================
// ПРОФИЛЬ - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

console.log('🔥 PROFILE.JS ЗАГРУЖЕН (v2.1)');

// Константы валидации
const VALIDATION = {
    NICK: {
        min: 2,
        max: 10,
        pattern: /^[a-zA-Z0-9_]+$/,
        error: 'неверный ввод'
    },
    AGE: {
        min: 0,
        max: 100,
        error: 'неверный ввод'
    },
    STEAM: {
        patterns: [
            /^https:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/,
            /^https:\/\/s\.team\/[a-zA-Z0-9_-]+\/?$/
        ],
        maxLength: 100,
        error: 'неверный ввод'
    },
    FACEIT: {
        pattern: /^https:\/\/www\.faceit\.com\/[a-z]{2}\/players\/[a-zA-Z0-9_-]+\/?$/,
        maxLength: 100,
        error: 'неверный ввод'
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
    // Временные значения (сохраняются при выходе из профиля)
    tempName: '-',
    tempAge: '',
    tempSteam: '',
    tempFaceitLink: '',
    telegramId: null,
    toastTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isLoading: false,
    isProfileLoaded: false,
    isInitialized: false,
    friendsList: [],
    isFriendsLoaded: false,
    isLoadingFriends: false,
    
    // Ошибки валидации для каждого поля
    validationErrors: {
        nick: false,
        age: false,
        steam: false,
        faceit: false
    },
    
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
            return { valid: true };
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < VALIDATION.AGE.min || ageNum > VALIDATION.AGE.max) {
            return { valid: false, error: VALIDATION.AGE.error };
        }
        return { valid: true, value: ageNum };
    },
    
    validateSteamLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true };
        }
        
        if (link.length > VALIDATION.STEAM.maxLength) {
            return { valid: false, error: VALIDATION.STEAM.error };
        }
        
        const trimmedLink = link.trim().replace(/\/$/, '');
        const isValid = VALIDATION.STEAM.patterns.some(pattern => pattern.test(trimmedLink));
        
        if (!isValid) {
            return { valid: false, error: VALIDATION.STEAM.error };
        }
        
        return { valid: true, value: trimmedLink };
    },
    
    validateFaceitLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true };
        }
        
        if (link.length > VALIDATION.FACEIT.maxLength) {
            return { valid: false, error: VALIDATION.FACEIT.error };
        }
        
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
    
    // Обновление отображения ошибки для поля
    updateFieldError(fieldId, hasError, errorText = 'неверный ввод') {
        const label = document.querySelector(`[data-field="${fieldId}"]`);
        const input = document.getElementById(fieldId);
        
        if (label) {
            if (hasError) {
                label.innerHTML = `${label.getAttribute('data-label')} <span style="color: #FF3B30;">*${errorText}</span>`;
            } else {
                label.textContent = label.getAttribute('data-label');
            }
        }
        
        if (input) {
            if (hasError) {
                input.style.color = '#FF3B30';
                input.style.borderColor = '#FF3B30';
            } else {
                input.style.color = '';
                input.style.borderColor = '';
            }
        }
    },
    
    // Функция копирования в буфер обмена (работает всегда)
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
        if (steamInput) {
            const parent = steamInput.parentNode;
            
            let wrapper = parent.querySelector('.link-with-copy');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'link-with-copy';
                steamInput.parentNode.insertBefore(wrapper, steamInput);
                wrapper.appendChild(steamInput);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(steamInput.value || this.savedSteam, copyBtn);
                };
                wrapper.appendChild(copyBtn);
            }
        }
        
        // Faceit ссылка
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            const parent = faceitInput.parentNode;
            
            let wrapper = parent.querySelector('.link-with-copy');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'link-with-copy';
                faceitInput.parentNode.insertBefore(wrapper, faceitInput);
                wrapper.appendChild(faceitInput);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(faceitInput.value || this.savedFaceitLink, copyBtn);
                };
                wrapper.appendChild(copyBtn);
            }
        }
    },
    
    // Загрузка друзей
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
        
        friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">загрузка...</div></div>';
    },
    
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
        if (!friendsListEl) return;
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Ваши тиммейты: ${this.friendsList.length}`;
        }
        
        if (!this.friendsList.length) {
            friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">у вас пока нет тиммейтов</div></div>';
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
                    
                    // Инициализируем временные значения
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
        if (profileNameEl) {
            profileNameEl.textContent = this.editMode ? this.tempName : this.savedName;
        }
        
        const ageValueEl = document.getElementById('ageValue');
        if (ageValueEl) {
            ageValueEl.value = this.editMode ? this.tempAge : this.savedAge;
        }
        
        const steamDisplayEl = document.getElementById('steamDisplay');
        if (steamDisplayEl) {
            steamDisplayEl.value = this.editMode ? this.tempSteam : this.savedSteam;
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl) {
            faceitLinkDisplayEl.value = this.editMode ? this.tempFaceitLink : this.savedFaceitLink;
        }
        
        this.updateAvatarDisplay();
        setTimeout(() => this.updateLinksWithCopy(), 50);
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
            // Сохраняем текущие значения во временные
            this.tempName = this.savedName;
            this.tempAge = this.savedAge;
            this.tempSteam = this.savedSteam;
            this.tempFaceitLink = this.savedFaceitLink;
            
            // Сбрасываем ошибки
            this.validationErrors = { nick: false, age: false, steam: false, faceit: false };
            this.updateFieldError('ageValue', false);
            this.updateFieldError('steamDisplay', false);
            this.updateFieldError('faceitLinkDisplay', false);
            
            profileScreen?.classList.add('editable');
            editToggle?.classList.add('active');
            if (applyBtn) {
                applyBtn.classList.add('visible');
                applyBtn.style.display = 'inline-block';
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            if (ageInput) {
                ageInput.readOnly = false;
                ageInput.maxLength = 3;
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
            
            this.updateDisplay();
            this.showToast('Режим редактирования');
        } else {
            // Выход без сохранения - сбрасываем временные значения
            this.tempName = this.savedName;
            this.tempAge = this.savedAge;
            this.tempSteam = this.savedSteam;
            this.tempFaceitLink = this.savedFaceitLink;
            
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
            
            this.updateDisplay();
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
        
        // Получаем актуальные значения из полей
        const newNick = this.tempName;
        const newAge = ageInput?.value || '';
        const newSteam = steamInput?.value || '';
        const newFaceit = faceitInput?.value || '';
        
        const updateData = {};
        let hasErrors = false;
        
        // Валидация ника
        if (newNick && newNick !== '-') {
            const nickValidation = this.validateNick(newNick);
            this.validationErrors.nick = !nickValidation.valid;
            if (!nickValidation.valid) {
                this.showToast(`Ник: ${nickValidation.error}`, true);
                hasErrors = true;
            } else {
                updateData.nick = newNick;
            }
        }
        
        // Валидация возраста
        if (newAge !== this.savedAge) {
            const ageValidation = this.validateAge(newAge);
            this.validationErrors.age = !ageValidation.valid;
            this.updateFieldError('ageValue', !ageValidation.valid);
            
            if (!ageValidation.valid) {
                hasErrors = true;
            } else {
                updateData.age = ageValidation.value || null;
            }
        } else {
            this.updateFieldError('ageValue', false);
        }
        
        // Валидация Steam
        if (newSteam !== this.savedSteam) {
            const steamValidation = this.validateSteamLink(newSteam);
            this.validationErrors.steam = !steamValidation.valid;
            this.updateFieldError('steamDisplay', !steamValidation.valid);
            
            if (!steamValidation.valid) {
                hasErrors = true;
            } else {
                updateData.steam_link = steamValidation.value || null;
            }
        } else {
            this.updateFieldError('steamDisplay', false);
        }
        
        // Валидация FaceIT
        if (newFaceit !== this.savedFaceitLink) {
            const faceitValidation = this.validateFaceitLink(newFaceit);
            this.validationErrors.faceit = !faceitValidation.valid;
            this.updateFieldError('faceitLinkDisplay', !faceitValidation.valid);
            
            if (!faceitValidation.valid) {
                hasErrors = true;
            } else {
                updateData.faceit_link = faceitValidation.value || null;
            }
        } else {
            this.updateFieldError('faceitLinkDisplay', false);
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
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'ok') {
                // Сохраняем изменения
                if (updateData.nick) this.savedName = updateData.nick;
                if (updateData.age !== undefined) this.savedAge = updateData.age || '';
                if (updateData.steam_link !== undefined) this.savedSteam = updateData.steam_link || '';
                if (updateData.faceit_link !== undefined) this.savedFaceitLink = updateData.faceit_link || '';
                
                localStorage.setItem('profile_nick', this.savedName);
                localStorage.setItem('profile_age', this.savedAge);
                localStorage.setItem('profile_steam', this.savedSteam);
                localStorage.setItem('profile_faceit', this.savedFaceitLink);
                
                this.toggleEditMode();
                this.showToast('Профиль сохранен');
            } else {
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
        
        const currentName = this.tempName === '-' ? '' : this.tempName;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = '2-10 символов';
        input.maxLength = VALIDATION.NICK.max;
        input.style.cssText = `
            background: #1A1D24;
            border: 1px solid #FF5500;
            border-radius: 6px;
            color: #FF5500;
            font-size: 16px;
            font-weight: 600;
            padding: 6px 10px;
            width: 140px;
            outline: none;
            font-family: inherit;
            display: inline-block;
        `;
        
        const parent = profileName.parentNode;
        profileName.style.display = 'none';
        parent.insertBefore(input, profileName.nextSibling);
        input.focus();
        
        const save = () => {
            const newName = input.value.trim();
            const validation = this.validateNick(newName);
            
            if (validation.valid) {
                this.tempName = newName;
                profileName.textContent = newName;
                this.validationErrors.nick = false;
            } else {
                this.showToast(`Ник: ${validation.error}`, true);
                this.validationErrors.nick = true;
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
    
    // Сохранение временных изменений при вводе
    handleInputChange() {
        if (!this.editMode) return;
        
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        this.tempAge = ageInput?.value || '';
        this.tempSteam = steamInput?.value || '';
        this.tempFaceitLink = faceitInput?.value || '';
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
        
        // Добавляем data-атрибуты для лейблов
        const ageLabel = document.querySelector('[data-field="ageValue"]');
        if (!ageLabel) {
            const label = document.querySelector('.stat-card:last-child .stat-label');
            if (label) {
                label.setAttribute('data-field', 'ageValue');
                label.setAttribute('data-label', 'ВОЗРАСТ');
            }
        }
        
        const steamLabel = document.querySelector('[data-field="steamDisplay"]');
        if (!steamLabel) {
            const label = document.querySelector('.profile-stat-card:first-child .profile-stat-label');
            if (label) {
                label.setAttribute('data-field', 'steamDisplay');
                label.setAttribute('data-label', 'Steam');
            }
        }
        
        const faceitLabel = document.querySelector('[data-field="faceitLinkDisplay"]');
        if (!faceitLabel) {
            const label = document.querySelector('.profile-stat-card:last-child .profile-stat-label');
            if (label) {
                label.setAttribute('data-field', 'faceitLinkDisplay');
                label.setAttribute('data-label', 'FaceIT');
            }
        }
        
        // Обработчики ввода
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.addEventListener('input', () => this.handleInputChange());
        }
        
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            steamInput.addEventListener('input', () => this.handleInputChange());
        }
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            faceitInput.addEventListener('input', () => this.handleInputChange());
        }
        
        const ageCard = document.getElementById('ageCard') || document.querySelector('.stat-card:last-child');
        if (ageCard) {
            ageCard.style.cursor = 'pointer';
            ageCard.onclick = () => this.editAge();
        }
        
        const steamCard = document.getElementById('steamCard') || document.querySelector('.profile-stat-card:first-child');
        if (steamCard) {
            steamCard.style.cursor = 'pointer';
            steamCard.onclick = () => this.editSteam();
        }
        
        const faceitCard = document.getElementById('faceitCard') || document.querySelector('.profile-stat-card:last-child');
        if (faceitCard) {
            faceitCard.style.cursor = 'pointer';
            faceitCard.onclick = () => this.editFaceitLink();
        }
        
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => {
                if (window.Team?.showTeamPage) Team.showTeamPage();
            };
        }
        
        // Устанавливаем maxLength
        if (ageInput) ageInput.maxLength = 3;
        if (steamInput) steamInput.maxLength = VALIDATION.STEAM.maxLength;
        if (faceitInput) faceitInput.maxLength = VALIDATION.FACEIT.maxLength;
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init() v2.1');
        this.telegramId = this.getTelegramId();
        
        // Инициализация временных значений
        this.tempName = this.savedName;
        this.tempAge = this.savedAge;
        this.tempSteam = this.savedSteam;
        this.tempFaceitLink = this.savedFaceitLink;
        
        setTimeout(() => {
            this.loadProfileFromServer();
            this.loadAvatar();
            this.loadFriends();
        }, 100);
        
        this.setupClickHandlers();
        this.updateLinksWithCopy();
    }
};

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Profile.init());
} else {
    Profile.init();
}

window.Profile = Profile;

// ============================================
// ПРОФИЛЬ - v3.6 FINAL (ФИКС АВАТАРКИ + ДРУЗЬЯ)
// ============================================

console.log('🔥 PROFILE.JS ЗАГРУЖЕН (v3.6 FINAL)');

// Константы валидации
const VALIDATION = {
    NICK: {
        min: 2,
        max: 10,
        pattern: /^[a-zA-Z0-9_]+$/,
        error: 'неверный ввод',
        hint: '2-10 лат. букв, цифр, _'
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
    savedRating: 0,
    tempName: '-',
    tempAge: '',
    tempSteam: '',
    tempFaceitLink: '',
    telegramId: null,
    playerId: null,
    toastTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isLoading: false,
    isProfileLoaded: false,
    isInitialized: false,
    friendsList: [],
    isFriendsLoaded: false,
    isLoadingFriends: false,
    screenObserver: null,
    
    validationErrors: {
        nick: false,
        age: false,
        steam: false,
        faceit: false
    },
    
    // 🔥 Вспомогательная функция для задержки
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    updateRatingDisplay() {
        const ratingInput = document.getElementById('ratingValue');
        if (ratingInput) {
            const rating = this.savedRating || 0;
            ratingInput.value = (rating > 0 ? '+' : '') + rating;
            
            if (rating > 0) {
                ratingInput.style.color = '#4CAF50';
            } else if (rating < 0) {
                ratingInput.style.color = '#FF3B30';
            } else {
                ratingInput.style.color = '';
            }
        }
    },
    
    validateNick(nick) {
        if (!nick || nick.length < VALIDATION.NICK.min || nick.length > VALIDATION.NICK.max) {
            return { valid: false };
        }
        if (!VALIDATION.NICK.pattern.test(nick)) {
            return { valid: false };
        }
        return { valid: true };
    },
    
    validateAge(age) {
        if (age === '' || age === null || age === undefined) {
            return { valid: true };
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < VALIDATION.AGE.min || ageNum > VALIDATION.AGE.max) {
            return { valid: false };
        }
        return { valid: true, value: ageNum };
    },
    
    validateSteamLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true };
        }
        if (link.length > VALIDATION.STEAM.maxLength) {
            return { valid: false };
        }
        const trimmedLink = link.trim().replace(/\/$/, '');
        const isValid = VALIDATION.STEAM.patterns.some(pattern => pattern.test(trimmedLink));
        return { valid: isValid, value: isValid ? trimmedLink : null };
    },
    
    validateFaceitLink(link) {
        if (!link || link.trim() === '') {
            return { valid: true };
        }
        if (link.length > VALIDATION.FACEIT.maxLength) {
            return { valid: false };
        }
        const trimmedLink = link.trim().replace(/\/$/, '');
        const isValid = VALIDATION.FACEIT.pattern.test(trimmedLink);
        return { valid: isValid, value: isValid ? trimmedLink : null };
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
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${isError ? 'rgba(255, 59, 48, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
            backdrop-filter: blur(10px);
            color: white;
            padding: 10px 16px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000;
            transition: transform 0.3s ease;
            white-space: normal;
            word-break: break-word;
            text-align: center;
            max-width: calc(100vw - 40px);
            width: auto;
            min-width: 200px;
            line-height: 1.4;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.style.transform = 'translateX(-50%) translateY(0)';
        this.toastTimeout = setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, isError ? 2500 : 2000);
    },
    
    updateFieldError(fieldId, hasError) {
        const label = document.querySelector(`[data-field="${fieldId}"]`);
        const input = document.getElementById(fieldId);
        
        if (label) {
            const baseText = label.getAttribute('data-label');
            if (hasError) {
                label.innerHTML = `${baseText} <span style="color: #FF3B30; font-weight: 400;">*${VALIDATION[fieldId === 'ageValue' ? 'AGE' : (fieldId === 'steamDisplay' ? 'STEAM' : 'FACEIT')].error}</span>`;
            } else {
                label.textContent = baseText;
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
    
    validateOnInput() {
        if (!this.editMode) return;
        
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        if (ageInput) {
            const ageValid = this.validateAge(ageInput.value);
            this.validationErrors.age = !ageValid.valid;
            this.updateFieldError('ageValue', !ageValid.valid);
        }
        
        if (steamInput) {
            const steamValid = this.validateSteamLink(steamInput.value);
            this.validationErrors.steam = !steamValid.valid && steamInput.value.trim() !== '';
            this.updateFieldError('steamDisplay', this.validationErrors.steam);
        }
        
        if (faceitInput) {
            const faceitValid = this.validateFaceitLink(faceitInput.value);
            this.validationErrors.faceit = !faceitValid.valid && faceitInput.value.trim() !== '';
            this.updateFieldError('faceitLinkDisplay', this.validationErrors.faceit);
        }
        
        this.tempAge = ageInput?.value || '';
        this.tempSteam = steamInput?.value || '';
        this.tempFaceitLink = faceitInput?.value || '';
    },
    
    copyToClipboard(text, btnElement) {
        if (!text || text === '' || text === 'Не указана') return;
        navigator.clipboard.writeText(text).then(() => {
            if (btnElement) {
                const originalHTML = btnElement.innerHTML;
                btnElement.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><polyline points="20 6 9 17 4 12" stroke="#4CAF50" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                btnElement.classList.add('copied');
                setTimeout(() => {
                    btnElement.innerHTML = originalHTML;
                    btnElement.classList.remove('copied');
                }, 1000);
            }
        }).catch(err => console.error('Ошибка копирования:', err));
    },
    
    updateLinksWithCopy() {
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            const oldWrapper = steamInput.parentNode.querySelector('.link-with-copy');
            if (oldWrapper) oldWrapper.remove();
            const wrapper = document.createElement('div');
            wrapper.className = 'link-with-copy';
            steamInput.parentNode.insertBefore(wrapper, steamInput);
            wrapper.appendChild(steamInput);
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('type', 'button');
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyToClipboard(steamInput.value || this.savedSteam, copyBtn);
            });
            wrapper.appendChild(copyBtn);
        }
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            const oldWrapper = faceitInput.parentNode.querySelector('.link-with-copy');
            if (oldWrapper) oldWrapper.remove();
            const wrapper = document.createElement('div');
            wrapper.className = 'link-with-copy';
            faceitInput.parentNode.insertBefore(wrapper, faceitInput);
            wrapper.appendChild(faceitInput);
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('type', 'button');
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyToClipboard(faceitInput.value || this.savedFaceitLink, copyBtn);
            });
            wrapper.appendChild(copyBtn);
        }
    },
    
    updatePlayerIdDisplay() {
        const profileNameLabel = document.querySelector('.profile-name-label');
        if (profileNameLabel && this.playerId) {
            profileNameLabel.textContent = `ID: ${this.playerId}`;
            profileNameLabel.style.cssText = `
                font-size: 11px;
                color: #FF5500;
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            `;
        }
    },
    
    showFriendActions(playerId, username, nick, btnElement) {
        const oldMenu = document.querySelector('.friend-actions-menu');
        if (oldMenu) oldMenu.remove();
    
        const rect = btnElement.getBoundingClientRect();
        const menuWidth = 210;
        const menuHeight = 85;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceRight = window.innerWidth - rect.right;
    
        let top;
        if (spaceBelow < menuHeight) {
            top = rect.top - menuHeight - 5;
        } else {
            top = rect.bottom + 5;
        }
    
        let left;
        if (spaceRight < menuWidth) {
            left = window.innerWidth - menuWidth - 10;
        } else {
            left = rect.right - menuWidth + 10;
        }
    
        const menu = document.createElement('div');
        menu.className = 'friend-actions-menu';
        menu.innerHTML = `
            <div class="friend-actions-popup" style="top: ${top}px; left: ${left}px;">
                <div class="friend-action-item write-btn">Написать в Telegram</div>
                <div class="friend-action-item delete-btn">Удалить из тиммейтов</div>
            </div>
        `;
    
        document.body.appendChild(menu);
    
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    
        menu.querySelector('.write-btn').onclick = () => {
            menu.remove();
            if (username && username !== 'null' && username !== '') {
                const url = `https://t.me/${username}`;
                if (window.Telegram?.WebApp?.openLink) {
                    window.Telegram.WebApp.openLink(url);
                } else if (window.Telegram?.WebApp?.openTelegramLink) {
                    window.Telegram.WebApp.openTelegramLink(url);
                } else {
                    window.open(url, '_blank');
                }
            } else {
                this.showToast('У пользователя нет username в Telegram', true);
            }
        };
    
        menu.querySelector('.delete-btn').onclick = () => {
            menu.remove();
            this.confirmDeleteFriend(playerId, nick);
        };
    },
    
    confirmDeleteFriend(playerId, nick) {
        const dialog = document.createElement('div');
        dialog.className = 'friend-delete-dialog';
        dialog.innerHTML = `
            <div class="friend-delete-overlay"></div>
            <div class="friend-delete-popup">
                <div class="friend-delete-title">Удалить тиммейта?</div>
                <div class="friend-delete-message">Вы уверены, что хотите удалить ${nick || 'этого игрока'} из списка тиммейтов?</div>
                <div class="friend-delete-buttons">
                    <button class="friend-delete-cancel">Отмена</button>
                    <button class="friend-delete-confirm">Удалить</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        dialog.querySelector('.friend-delete-overlay').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-cancel').onclick = () => dialog.remove();
        dialog.querySelector('.friend-delete-confirm').onclick = async () => {
            dialog.remove();
            await this.removeFriend(playerId, nick);
        };
    },
    
    async removeFriend(friendId, nick) {
        if (!this.telegramId) return;
        
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/friends/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    friend_player_id: friendId
                })
            });
            const data = await response.json();
            if (data.status === 'ok') {
                this.friendsList = this.friendsList.filter(f => f.player_id !== friendId);
                this.updateFriendsDisplay();
                this.showToast('Тиммейт удалён');
            }
        } catch(e) {
            console.error('Ошибка удаления:', e);
            this.showToast('Ошибка при удалении', true);
        }
    },
    
    async loadFriends() {
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId || this.isLoadingFriends) return;
        
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
        if (friendsTitle) friendsTitle.textContent = 'Ваши тиммейты:';
        friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">загрузка...</div></div>';
    },
    
    updateFriendsDisplay() {
        const friendsListEl = document.getElementById('friendsList');
        if (!friendsListEl) return;
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) friendsTitle.textContent = `Ваши тиммейты: ${this.friendsList.length}`;
        
        if (!this.friendsList.length) {
            friendsListEl.innerHTML = '<div class="empty-friends"><div class="empty-friends-text">у вас пока нет тиммейтов</div></div>';
            return;
        }
        
        let html = '';
        const showCount = Math.min(this.friendsList.length, 5);
        
        for (let i = 0; i < showCount; i++) {
            const friend = this.friendsList[i];
            const firstChar = friend.nick?.[0]?.toUpperCase() || '?';
            html += `
                <div class="friend-row" data-player-id="${friend.player_id}" data-username="${friend.username || ''}" data-nick="${friend.nick || 'Без имени'}">
                    <div class="friend-avatar">
                        ${friend.avatar ? `<img src="${friend.avatar}">` : `<span>${firstChar}</span>`}
                    </div>
                    <div class="friend-info">
                        <span class="friend-id">ID: ${friend.player_id}</span>
                        <span class="friend-name">${friend.nick || 'Без имени'}</span>
                    </div>
                    <div class="friend-arrow-menu">→</div>
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
        
        document.querySelectorAll('#friendsList .friend-arrow-menu').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const row = btn.closest('.friend-row');
                const playerId = row.dataset.playerId;
                const username = row.dataset.username;
                const nick = row.dataset.nick;
                this.showFriendActions(playerId, username, nick, btn);
            };
        });
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
        if (window.Team?.showTeamPage) Team.showTeamPage();
        else if (window.App) App.showScreen('teamScreen', true);
    },
    
    async loadProfileFromServer() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.isLoading = false;
            return;
        }
        
        try {
            // 🔥 Дожидаемся готовности DOM
            await this.delay(50);
            
            const initResponse = await fetch(`${this.BACKEND_URL}/api/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            if (initResponse.ok) {
                const initData = await initResponse.json();
                if (initData.status === 'ok') {
                    this.playerId = initData.player_id;
                    this.updatePlayerIdDisplay();
                }
            }
            
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

            const ratingResponse = await fetch(`${this.BACKEND_URL}/api/user/rating`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.telegramId })
            });
            
            const ratingData = await ratingResponse.json();
            if (ratingData.status === 'ok') {
                this.savedRating = ratingData.rating;
                this.updateRatingDisplay();
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
        if (!avatarDiv) return;
        
        // 🔥 ФИКС ДЛЯ BASE64 И ОБЫЧНЫХ URL
        if (this.savedAvatarUrl && this.savedAvatarUrl !== 'null' && this.savedAvatarUrl !== '') {
            // Проверяем, base64 это или обычный URL
            const isBase64 = this.savedAvatarUrl.startsWith('data:image');
            
            if (isBase64) {
                // Для base64 не добавляем ?t=
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
            } else {
                // Для обычных URL добавляем ?t= для сброса кэша
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}?t=${Date.now()}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
            }
            console.log('🖼️ Аватар обновлён (base64 или URL)');
        } else {
            avatarDiv.innerHTML = this.savedAvatar;
            console.log('🖼️ Аватар сброшен на дефолтный');
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
        
        const faceitDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitDisplayEl) {
            faceitDisplayEl.value = this.editMode ? this.tempFaceitLink : this.savedFaceitLink;
        }
        
        this.updateAvatarDisplay();
        this.updateRatingDisplay();
        setTimeout(() => this.updateLinksWithCopy(), 50);
    },
    
    forceExitEditMode() {
        if (!this.editMode) return;
        
        console.log('🔄 Сброс режима редактирования');
        this.editMode = false;
        
        const profileScreen = document.getElementById('profileScreen');
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        const profileName = document.getElementById('profileName');
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        const avatar = document.getElementById('profileAvatar');
        
        this.tempName = this.savedName;
        this.tempAge = this.savedAge;
        this.tempSteam = this.savedSteam;
        this.tempFaceitLink = this.savedFaceitLink;
        
        this.validationErrors = { nick: false, age: false, steam: false, faceit: false };
        this.updateFieldError('ageValue', false);
        this.updateFieldError('steamDisplay', false);
        this.updateFieldError('faceitLinkDisplay', false);
        
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
    },
    
    enterEditMode() {
        if (this.editMode) return;
        
        this.editMode = true;
        
        const profileScreen = document.getElementById('profileScreen');
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        const profileName = document.getElementById('profileName');
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        const avatar = document.getElementById('profileAvatar');
        
        this.tempName = this.savedName;
        this.tempAge = this.savedAge;
        this.tempSteam = this.savedSteam;
        this.tempFaceitLink = this.savedFaceitLink;
        
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
    },
    
    toggleEditMode() {
        if (this.editMode) {
            this.forceExitEditMode();
        } else {
            this.enterEditMode();
        }
    },
    
    async applyChanges() {
        const applyBtn = document.getElementById('applyBtn');
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.showToast('Ошибка: нет Telegram ID', true);
            return;
        }
        
        const hasErrors = this.validationErrors.nick || this.validationErrors.age || this.validationErrors.steam || this.validationErrors.faceit;
        
        if (hasErrors) {
            this.showToast('Исправьте ошибки в полях', true);
            return;
        }
        
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        const updateData = { telegram_id: this.telegramId };
        
        if (this.tempName !== this.savedName && this.tempName !== '-') {
            updateData.nick = this.tempName;
        }
        
        const newAge = ageInput?.value || '';
        if (newAge !== this.savedAge) {
            const ageValid = this.validateAge(newAge);
            if (ageValid.valid) {
                updateData.age = ageValid.value || null;
            }
        }
        
        const newSteam = steamInput?.value || '';
        if (newSteam !== this.savedSteam) {
            const steamValid = this.validateSteamLink(newSteam);
            if (steamValid.valid) {
                updateData.steam_link = steamValid.value || null;
            }
        }
        
        const newFaceit = faceitInput?.value || '';
        if (newFaceit !== this.savedFaceitLink) {
            const faceitValid = this.validateFaceitLink(newFaceit);
            if (faceitValid.valid) {
                updateData.faceit_link = faceitValid.value || null;
            }
        }
        
        if (Object.keys(updateData).length === 1) {
            this.forceExitEditMode();
            this.showToast('Нет изменений');
            return;
        }
        
        if (applyBtn) {
            applyBtn.style.pointerEvents = 'none';
            applyBtn.style.opacity = '0.5';
        }
        
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
                
                this.forceExitEditMode();
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
            this.showToast('Для изменений\nперейдите в режим редактирования', true);
            return;
        }
        
        this.showToast(VALIDATION.NICK.hint);
        
        const profileName = document.getElementById('profileName');
        if (!profileName) return;
        
        const currentName = this.tempName === '-' ? '' : this.tempName;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = 'ник';
        input.maxLength = VALIDATION.NICK.max;
        input.style.cssText = `
            background: #1A1D24;
            border: 1px solid #FF5500;
            border-radius: 6px;
            color: #FF5500;
            font-size: 15px;
            font-weight: 600;
            padding: 4px 8px;
            width: 130px;
            outline: none;
            font-family: inherit;
            display: inline-block;
            margin-left: 4px;
        `;
        
        const parent = profileName.parentNode;
        profileName.style.display = 'none';
        parent.insertBefore(input, profileName.nextSibling);
        input.focus();
        
        const save = () => {
            const newName = input.value.trim();
            const validation = this.validateNick(newName);
            this.validationErrors.nick = !validation.valid;
            
            if (validation.valid) {
                this.tempName = newName;
                profileName.textContent = newName;
            } else {
                this.showToast(`Ник: ${VALIDATION.NICK.hint}`, true);
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
            this.showToast('Для изменений\nперейдите в режим редактирования', true);
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
            this.showToast('Для изменений\nперейдите в режим редактирования', true);
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
            this.showToast('Для изменений\nперейдите в режим редактирования', true);
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
                    this.showToast('Для изменений\nперейдите в режим редактирования', true);
                }
            };
        }
        
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.style.cursor = 'pointer';
            profileName.onclick = () => this.editName();
        }
        
        const profileNameLabel = document.querySelector('.profile-name-label');
        if (profileNameLabel) {
            profileNameLabel.style.cursor = 'default';
        }
        
        const ageLabel = document.querySelector('.stat-card:last-child .stat-label');
        if (ageLabel && !ageLabel.hasAttribute('data-field')) {
            ageLabel.setAttribute('data-field', 'ageValue');
            ageLabel.setAttribute('data-label', 'ВОЗРАСТ');
        }
        
        const steamLabel = document.querySelector('.profile-stat-card:first-child .profile-stat-label');
        if (steamLabel && !steamLabel.hasAttribute('data-field')) {
            steamLabel.setAttribute('data-field', 'steamDisplay');
            steamLabel.setAttribute('data-label', 'Steam');
        }
        
        const faceitLabel = document.querySelector('.profile-stat-card:last-child .profile-stat-label');
        if (faceitLabel && !faceitLabel.hasAttribute('data-field')) {
            faceitLabel.setAttribute('data-field', 'faceitLinkDisplay');
            faceitLabel.setAttribute('data-label', 'FaceIT');
        }
        
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.addEventListener('input', () => this.validateOnInput());
            ageInput.maxLength = 3;
            ageInput.onclick = () => {
                if (!this.editMode) {
                    this.showToast('Для изменений\nперейдите в режим редактирования', true);
                }
            };
        }
        
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            steamInput.addEventListener('input', () => this.validateOnInput());
            steamInput.maxLength = VALIDATION.STEAM.maxLength;
            steamInput.onclick = (e) => {
                if (!e.target.closest('.copy-btn')) {
                    if (!this.editMode) {
                        this.showToast('Для изменений\nперейдите в режим редактирования', true);
                    }
                }
            };
        }
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            faceitInput.addEventListener('input', () => this.validateOnInput());
            faceitInput.maxLength = VALIDATION.FACEIT.maxLength;
            faceitInput.onclick = (e) => {
                if (!e.target.closest('.copy-btn')) {
                    if (!this.editMode) {
                        this.showToast('Для изменений\nперейдите в режим редактирования', true);
                    }
                }
            };
        }
        
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => {
                if (window.Team?.showTeamPage) Team.showTeamPage();
            };
        }
        
        const editToggle = document.getElementById('editToggle');
        if (editToggle) {
            editToggle.onclick = (e) => {
                e.preventDefault();
                this.toggleEditMode();
            };
        }
        
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.onclick = (e) => {
                e.preventDefault();
                this.applyChanges();
            };
        }
    },
    
    setupScreenObserver() {
        const profileScreen = document.getElementById('profileScreen');
        if (!profileScreen) return;
        
        if (this.screenObserver) {
            this.screenObserver.disconnect();
        }
        
        this.screenObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = profileScreen.classList.contains('active');
                    if (!isActive && this.editMode) {
                        console.log('👁️ Экран профиля скрыт, сбрасываем режим редактирования');
                        this.forceExitEditMode();
                    }
                }
            });
        });
        
        this.screenObserver.observe(profileScreen, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        console.log('👁️ Наблюдатель за экраном активирован');
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init() v3.6 FINAL');
        this.telegramId = this.getTelegramId();
        
        this.tempName = this.savedName;
        this.tempAge = this.savedAge;
        this.tempSteam = this.savedSteam;
        this.tempFaceitLink = this.savedFaceitLink;
        
        // 🔥 СНАЧАЛА ГРУЗИМ ПРОФИЛЬ, ПОТОМ АВАТАР И ДРУЗЕЙ
        this.loadProfileFromServer().then(() => {
            this.loadAvatar();
            this.loadFriends();
        });
        
        this.setupClickHandlers();
        this.updateLinksWithCopy();
        
        setTimeout(() => this.setupScreenObserver(), 200);
    }
};

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Profile.init());
} else {
    Profile.init();
}

window.Profile = Profile;

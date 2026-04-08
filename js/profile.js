// ============================================
// ПРОФИЛЬ - ОПТИМИЗИРОВАННЫЙ
// ============================================

console.log('🔥 PROFILE.JS ЗАГРУЖЕН');

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
        
        // Принудительный рефлоу
        toast.offsetHeight;
        toast.classList.add('show');
        
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },
    
    async loadProfileFromServer() {
        if (this.isProfileLoaded || this.isLoading) return;
        
        this.isLoading = true;
        
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) {
            this.isLoading = false;
            return;
        }
        
        // Сначала показываем кэш
        const cachedNick = localStorage.getItem('profile_nick');
        if (cachedNick) {
            this.savedName = cachedNick;
            this.savedAge = localStorage.getItem('profile_age') || '';
            this.savedSteam = localStorage.getItem('profile_steam') || '';
            this.savedFaceitLink = localStorage.getItem('profile_faceit') || '';
            this.updateDisplay();
        }
        
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
            if (ageInput) ageInput.readOnly = false;
            if (steamInput) steamInput.readOnly = false;
            if (faceitInput) faceitInput.readOnly = false;
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
            this.showToast('Ошибка: нет Telegram ID');
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        const dataToSend = {
            telegram_id: this.telegramId,
            nick: this.savedName,
            age: ageInput?.value || null,
            steam_link: steamInput?.value || null,
            faceit_link: faceitInput?.value || null
        };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.BACKEND_URL}/api/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.savedAge = ageInput?.value || '';
                this.savedSteam = steamInput?.value || '';
                this.savedFaceitLink = faceitInput?.value || '';
                
                localStorage.setItem('profile_age', this.savedAge);
                localStorage.setItem('profile_steam', this.savedSteam);
                localStorage.setItem('profile_faceit', this.savedFaceitLink);
                
                this.toggleEditMode();
                this.showToast('Профиль сохранен');
            } else {
                throw new Error(data.error || 'Ошибка');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            this.showToast('Ошибка сохранения');
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
        
        const profileName = document.getElementById('profileName');
        if (!profileName) return;
        
        const currentName = this.savedName === '-' ? '' : this.savedName;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = 'Введите никнейм';
        input.maxLength = 32;
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
            if (newName && newName.length >= 2 && newName.length <= 32) {
                this.savedName = newName;
                profileName.textContent = newName;
                localStorage.setItem('profile_nick', newName);
                this.showToast('Нажмите "Применить" для сохранения');
            } else if (newName) {
                this.showToast('Никнейм должен быть 2-32 символа');
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
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('ageValue')?.focus();
    },
    
    editSteam() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('steamDisplay')?.focus();
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        document.getElementById('faceitLinkDisplay')?.focus();
    },
    
    setupClickHandlers() {
        // Аватар
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.style.cursor = 'pointer';
            avatar.onclick = () => {
                if (this.editMode) {
                    if (window.Avatar?.select) Avatar.select();
                } else {
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            };
        }
        
        // Ник
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.style.cursor = 'pointer';
            profileName.onclick = () => this.editName();
        }
        
        // Возраст
        const ageCard = document.getElementById('ageCard');
        if (ageCard) {
            ageCard.style.cursor = 'pointer';
            ageCard.onclick = () => this.editAge();
        }
        
        // Steam
        const steamCard = document.getElementById('steamCard');
        if (steamCard) {
            steamCard.style.cursor = 'pointer';
            steamCard.onclick = () => this.editSteam();
        }
        
        // Faceit
        const faceitCard = document.getElementById('faceitCard');
        if (faceitCard) {
            faceitCard.style.cursor = 'pointer';
            faceitCard.onclick = () => this.editFaceitLink();
        }
        
        // Стрелка друзей
        const friendsArrow = document.querySelector('.friends-arrow');
        if (friendsArrow) {
            friendsArrow.onclick = () => {
                if (window.Team?.showTeamPage) Team.showTeamPage();
            };
        }
    },
    
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        console.log('🚀 Profile.init()');
        this.telegramId = this.getTelegramId();
        
        // Загружаем из кэша мгновенно
        const cachedNick = localStorage.getItem('profile_nick');
        if (cachedNick) {
            this.savedName = cachedNick;
            this.savedAge = localStorage.getItem('profile_age') || '';
            this.savedSteam = localStorage.getItem('profile_steam') || '';
            this.savedFaceitLink = localStorage.getItem('profile_faceit') || '';
            this.updateDisplay();
        }
        
        // Асинхронно подгружаем с сервера
        setTimeout(() => this.loadProfileFromServer(), 100);
        
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

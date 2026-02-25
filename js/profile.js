// ============================================
// ПРОФИЛЬ (Telegram Mini App версия) - РАБОЧАЯ ВЕРСИЯ
// ============================================

const Profile = {
    editMode: false,
    savedName: '-',
    savedAvatar: '👤',
    savedAge: '',
    savedSteam: '',
    savedFaceitLink: '',
    tempName: '-',
    tempAvatar: '👤',
    tempAge: '',
    tempSteam: '',
    tempFaceitLink: '',
    telegramId: null,
    
    generateRandomNick() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let nick = '';
        for (let i = 0; i < 6; i++) {
            nick += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nick;
    },
    
    getTelegramId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tg_id');
    },
    
    async loadProfileFromServer() {
        this.telegramId = this.getTelegramId();
        if (!this.telegramId) return;
        
        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/profile/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.savedName = data.nick || '-';
                this.savedAge = data.age || '';
                this.savedSteam = data.steam_link || '';
                this.savedFaceitLink = data.faceit_link || '';
                this.savedAvatar = data.avatar || '👤';
                
                this.tempName = this.savedName;
                this.tempAge = this.savedAge;
                this.tempSteam = this.savedSteam;
                this.tempFaceitLink = this.savedFaceitLink;
                this.tempAvatar = this.savedAvatar;
                
                this.updateDisplay();
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error);
        }
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
        
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) avatarDiv.innerHTML = this.savedAvatar;
    },
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const profileScreen = document.getElementById('profileScreen');
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        const profileName = document.getElementById('profileName');
        const nameInput = document.getElementById('editProfileName');
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        if (this.editMode) {
            // Включаем режим редактирования
            profileScreen.classList.add('editable');
            if (editToggle) editToggle.classList.add('active');
            if (applyBtn) applyBtn.classList.add('visible');
            
            // Делаем поля редактируемыми
            if (ageInput) ageInput.readOnly = false;
            if (steamInput) steamInput.readOnly = false;
            if (faceitInput) faceitInput.readOnly = false;
            
            // Показываем поле для ника, скрываем текст
            if (profileName && nameInput) {
                profileName.style.display = 'none';
                nameInput.style.display = 'inline-block';
                nameInput.value = this.tempName;
                setTimeout(() => nameInput.focus(), 100);
            }
        } else {
            // Выключаем режим редактирования
            profileScreen.classList.remove('editable');
            if (editToggle) editToggle.classList.remove('active');
            if (applyBtn) applyBtn.classList.remove('visible');
            
            // Делаем поля только для чтения
            if (ageInput) ageInput.readOnly = true;
            if (steamInput) steamInput.readOnly = true;
            if (faceitInput) faceitInput.readOnly = true;
            
            // Показываем текст, скрываем поле для ника
            if (profileName && nameInput) {
                nameInput.style.display = 'none';
                profileName.style.display = 'inline-block';
            }
        }
    },
    
    validateAge(ageStr) {
        if (ageStr === '') {
            this.tempAge = '';
            return true;
        }
        
        if (ageStr.length > 3) {
            alert('❌ Возраст должен быть не более 3 символов');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        const age = parseInt(ageStr);
        
        if (isNaN(age) || age < 0 || age > 100) {
            alert('❌ Возраст должен быть числом от 0 до 100');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        this.tempAge = ageStr;
        return true;
    },

    validateSteamLink(link) {
        if (link.length > 100) {
            alert('❌ Ссылка Steam должна быть не более 100 символов');
            return false;
        }
        return true;
    },

    validateFaceitLink(link) {
        if (link.length > 100) {
            alert('❌ Ссылка Faceit должна быть не более 100 символов');
            return false;
        }
        return true;
    },
    
    async applyChanges() {
        if (!this.telegramId) {
            this.telegramId = this.getTelegramId();
            if (!this.telegramId) return;
        }

        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        // Обновляем tempName из поля ввода
        const nameInput = document.getElementById('editProfileName');
        if (nameInput && nameInput.style.display !== 'none' && nameInput.value.trim() !== '') {
            this.tempName = nameInput.value.trim();
        }

        if (ageInput && !this.validateAge(ageInput.value)) return;
        if (steamInput && !this.validateSteamLink(steamInput.value)) return;
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) return;

        const dataToSend = {
            telegram_id: this.telegramId,
            nick: this.tempName,
            age: ageInput ? ageInput.value || null : null,
            steam_link: steamInput ? steamInput.value || null : null,
            faceit_link: faceitInput ? faceitInput.value || null : null
        };

        try {
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            const data = await response.json();
            
            if (data.status === 'ok') {
                this.savedName = this.tempName;
                this.savedAge = ageInput ? ageInput.value : '';
                this.savedSteam = steamInput ? steamInput.value : '';
                this.savedFaceitLink = faceitInput ? faceitInput.value : '';
                
                this.updateDisplay();
                this.toggleEditMode();
            }
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
        }
    },
    
    async saveNameFromInput() {
        const nameInput = document.getElementById('editProfileName');
        const profileName = document.getElementById('profileName');
        
        if (!nameInput || !profileName) return;

        const newName = nameInput.value.trim();
        
        if (newName === '') {
            nameInput.value = this.tempName;
            nameInput.style.display = 'none';
            profileName.style.display = 'inline-block';
            return;
        }
        
        if (newName.length >= 3 && newName.length <= 10) {
            if (!this.telegramId) {
                this.telegramId = this.getTelegramId();
                if (!this.telegramId) return;
            }
            
            try {
                const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        telegram_id: this.telegramId,
                        nick: newName
                    })
                });
                
                const data = await response.json();
                
                if (data.status === 'ok') {
                    this.tempName = newName;
                    this.savedName = newName;
                    profileName.textContent = newName;
                    
                    nameInput.style.display = 'none';
                    profileName.style.display = 'inline-block';
                } else {
                    nameInput.value = this.tempName;
                }
            } catch (error) {
                console.error('❌ Ошибка отправки:', error);
                nameInput.value = this.tempName;
            }
        } else {
            alert('❌ Никнейм должен быть от 3 до 10 символов');
            nameInput.value = this.tempName;
            nameInput.focus();
        }
    },
    
    setupListeners() {
        const nameInput = document.getElementById('editProfileName');
        if (nameInput) {
            nameInput.addEventListener('blur', () => this.saveNameFromInput());
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveNameFromInput();
                }
            });
        }
        
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.addEventListener('blur', (e) => {
                if (this.editMode) this.validateAge(e.target.value);
            });
        }
    },
    
    loadSavedValues() {
        this.loadProfileFromServer();
        setTimeout(() => this.setupListeners(), 200);
    },
    
    editName() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        const nameInput = document.getElementById('editProfileName');
        if (nameInput) nameInput.focus();
    },
    
    editAge() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('ageValue')?.focus();
    },
    
    editSteam() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('steamDisplay')?.focus();
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('faceitLinkDisplay')?.focus();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Profile.loadSavedValues();
});

window.Profile = Profile;

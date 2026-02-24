// ============================================
// ПРОФИЛЬ (Telegram Mini App версия) - С ВАЛИДАЦИЕЙ
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
    
    generateRandomNick() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let nick = '';
        for (let i = 0; i < 6; i++) {
            nick += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nick;
    },
    
    setInputsReadonly(readonly) {
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        [ageInput, steamInput, faceitInput].forEach(input => {
            if (input) {
                input.readOnly = readonly;
                const parentStat = input.closest('.stat-value');
                if (!readonly) {
                    input.classList.add('editable-input');
                    if (parentStat) parentStat.classList.add('editable-input');
                } else {
                    input.classList.remove('editable-input');
                    if (parentStat) parentStat.classList.remove('editable-input');
                }
            }
        });
    },
    
    // Добавляем обработчики для полей ввода
    setupInputListeners() {
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        [ageInput, steamInput, faceitInput].forEach(input => {
            if (input) {
                // Убираем старые обработчики
                input.removeEventListener('click', this.handleInputClick);
                input.removeEventListener('focus', this.handleInputFocus);
                
                // Добавляем новые
                input.addEventListener('click', (e) => {
                    if (!this.editMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Для изменений перейдите в раздел редактирования (карандаш)');
                    }
                });
                
                input.addEventListener('focus', (e) => {
                    if (!this.editMode) {
                        e.target.blur();
                    }
                });
            }
        });

        // Валидация возраста
        if (ageInput) {
            ageInput.removeEventListener('blur', this.handleAgeBlur);
            ageInput.addEventListener('blur', (e) => {
                if (this.editMode) {
                    this.validateAge(e.target.value);
                }
            });
        }
    },

    // Валидация возраста (улучшенная)
    validateAge(ageStr) {
        if (ageStr === '') {
            this.tempAge = '';
            return true;
        }
        
        // Проверяем длину
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

    // Валидация ссылки Steam
    validateSteamLink(link) {
        if (link.length > 100) {
            alert('❌ Ссылка Steam должна быть не более 100 символов');
            return false;
        }
        return true;
    },

    // Валидация ссылки Faceit
    validateFaceitLink(link) {
        if (link.length > 100) {
            alert('❌ Ссылка Faceit должна быть не более 100 символов');
            return false;
        }
        return true;
    },
    
    loadSavedValues() {
        if (this.savedName === '-') {
            this.savedName = this.generateRandomNick();
            this.tempName = this.savedName;
        }
        
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = this.savedName;
        
        const ageValueEl = document.getElementById('ageValue');
        if (ageValueEl) {
            ageValueEl.value = this.savedAge || '';
            ageValueEl.placeholder = '0-100';
            ageValueEl.maxLength = 3;
            ageValueEl.readOnly = true;
        }
        
        const steamDisplayEl = document.getElementById('steamDisplay');
        if (steamDisplayEl) {
            steamDisplayEl.value = this.savedSteam || '';
            steamDisplayEl.placeholder = 'введите ссылку на ваш профиль steam';
            steamDisplayEl.maxLength = 100; // Увеличил до 100
            steamDisplayEl.readOnly = true;
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl) {
            faceitLinkDisplayEl.value = this.savedFaceitLink || '';
            faceitLinkDisplayEl.placeholder = 'введите ссылку на ваш профиль faceit / пропустите';
            faceitLinkDisplayEl.maxLength = 100; // Увеличил до 100
            faceitLinkDisplayEl.readOnly = true;
        }
        
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            avatarDiv.innerHTML = this.savedAvatar;
        }
        
        this.tempName = this.savedName;
        this.tempAvatar = this.savedAvatar;
        this.tempAge = this.savedAge;
        this.tempSteam = this.savedSteam;
        this.tempFaceitLink = this.savedFaceitLink;
        
        // Настраиваем обработчики
        this.setupInputListeners();
    },
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const elements = [
            document.getElementById('profileName'),
            document.getElementById('profileAvatar'),
            document.getElementById('ageCard'),
            document.getElementById('steamCard'),
            document.getElementById('faceitLinkCard')
        ];
        
        const editToggle = document.getElementById('editToggle');
        const applyBtn = document.getElementById('applyBtn');
        
        if (this.editMode) {
            if (editToggle) editToggle.classList.add('active');
            if (applyBtn) applyBtn.classList.add('visible');
            elements.forEach(el => {
                if (el) el.classList.add('editable');
            });
            this.setInputsReadonly(false);
        } else {
            if (editToggle) editToggle.classList.remove('active');
            if (applyBtn) applyBtn.classList.remove('visible');
            elements.forEach(el => {
                if (el) el.classList.remove('editable');
            });
            this.setInputsReadonly(true);
        }
    },
    
    applyChanges() {
        // Проверяем возраст
        const ageInput = document.getElementById('ageValue');
        if (ageInput && !this.validateAge(ageInput.value)) {
            return;
        }

        // Проверяем ссылку Steam
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput && !this.validateSteamLink(steamInput.value)) {
            return;
        }

        // Проверяем ссылку Faceit
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) {
            return;
        }

        this.savedName = this.tempName;
        this.savedAvatar = this.tempAvatar;
        this.savedAge = document.getElementById('ageValue').value;
        this.savedSteam = document.getElementById('steamDisplay').value;
        this.savedFaceitLink = document.getElementById('faceitLinkDisplay').value;
        
        this.loadSavedValues();
        alert('✅ Изменения сохранены');
        this.toggleEditMode();
    },
    
    editName() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        
        const newName = prompt('Введите новый никнейм (3-10 символов):', this.tempName);
        
        if (newName === null) return;
        
        if (newName.length >= 3 && newName.length <= 10) {
            this.tempName = newName;
            document.getElementById('profileName').textContent = newName;
            alert('✅ Никнейм изменен');
        } else {
            alert('❌ Никнейм должен быть от 3 до 10 символов');
        }
    },
    
    editAge() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('ageValue').focus();
    },
    
    editSteam() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('steamDisplay').focus();
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('faceitLinkDisplay').focus();
    },
    
    selectAvatar() {
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        alert('Функция выбора аватара будет доступна позже');
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('profileName')) {
            Profile.loadSavedValues();
        }
    }, 100);
});

window.Profile = Profile;

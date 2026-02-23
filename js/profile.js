// ============================================
// ПРОФИЛЬ (Telegram Mini App версия) - С СООБЩЕНИЕМ ДЛЯ INPUT
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
                input.addEventListener('click', (e) => {
                    if (!this.editMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        App.showAlert('Для изменений перейдите в раздел редактирования (карандаш)');
                    }
                });
                
                input.addEventListener('focus', (e) => {
                    if (!this.editMode) {
                        e.target.blur(); // Убираем фокус
                    }
                });
            }
        });
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
            steamDisplayEl.maxLength = 50;
            steamDisplayEl.readOnly = true;
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl) {
            faceitLinkDisplayEl.value = this.savedFaceitLink || '';
            faceitLinkDisplayEl.placeholder = 'введите ссылку на ваш профиль faceit / пропустите';
            faceitLinkDisplayEl.maxLength = 50;
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
        
        // Настраиваем обработчики после загрузки
        this.setupInputListeners();
    },
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        console.log('editMode =', this.editMode);
        
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
            App.hapticFeedback('light');
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
        this.savedName = this.tempName;
        this.savedAvatar = this.tempAvatar;
        this.savedAge = document.getElementById('ageValue').value;
        this.savedSteam = document.getElementById('steamDisplay').value;
        this.savedFaceitLink = document.getElementById('faceitLinkDisplay').value;
        
        this.loadSavedValues();
        App.showAlert('Изменения сохранены');
        this.toggleEditMode();
    },
    
    editName() {
        if (!this.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        
        App.showPopup({
            title: 'Изменить никнейм',
            message: 'Введите новый никнейм (3-10 символов)',
            buttons: [
                { id: 'cancel', type: 'cancel', text: 'Отмена' },
                { id: 'ok', type: 'ok', text: 'Сохранить' }
            ]
        }, (buttonId) => {
            if (buttonId === 'ok') {
                const newName = prompt('Введите новый никнейм:', this.tempName);
                if (newName && newName.length >= 3 && newName.length <= 10) {
                    this.tempName = newName;
                    document.getElementById('profileName').textContent = newName;
                    App.hapticFeedback('medium');
                }
            }
        });
    },
    
    editAge() {
        if (!this.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('ageValue').focus();
    },
    
    editSteam() {
        if (!this.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('steamDisplay').focus();
    },
    
    editFaceitLink() {
        if (!this.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        document.getElementById('faceitLinkDisplay').focus();
    },
    
    selectAvatar() {
        if (!this.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        
        App.showPopup({
            title: 'Выбор аватара',
            message: 'Функция будет доступна позже',
            buttons: [{ id: 'ok', type: 'ok', text: 'ОК' }]
        });
    }
};

window.Profile = Profile;

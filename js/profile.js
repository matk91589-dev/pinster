// ============================================
// ПРОФИЛЬ (Telegram Mini App версия) - С МОДАЛЬНЫМ ОКНОМ ДЛЯ ВВОДА
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
    
    // Создаем модальное окно для ввода ника
    showNameInputModal() {
        // Создаем затемнение
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'name-input-modal';
        modal.style.cssText = `
            background: #1A1D24;
            border: 1px solid #2A2F3A;
            border-radius: 16px;
            padding: 24px;
            width: 280px;
            max-width: 90%;
            transform: scale(0.9);
            transition: transform 0.2s ease;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        `;

        // Заголовок
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            color: #F5F5F5;
            margin-bottom: 16px;
            text-align: center;
            font-family: 'Montserrat', sans-serif;
        `;
        title.textContent = 'Изменить никнейм';

        // Поле ввода
        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.tempName;
        input.placeholder = 'Введите никнейм (3-10 символов)';
        input.style.cssText = `
            width: 100%;
            background: #111317;
            border: 1px solid #2A2F3A;
            border-radius: 8px;
            padding: 12px 16px;
            color: #F5F5F5;
            font-size: 14px;
            font-family: 'Montserrat', sans-serif;
            outline: none;
            margin-bottom: 20px;
            box-sizing: border-box;
        `;
        input.maxLength = 10;

        input.addEventListener('focus', () => {
            input.style.borderColor = '#FF5500';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#2A2F3A';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                okBtn.click();
            }
        });

        // Кнопки
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        `;

        // Кнопка отмены
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.style.cssText = `
            flex: 1;
            background: transparent;
            border: 1px solid #2A2F3A;
            border-radius: 8px;
            padding: 12px;
            color: #9BA1B0;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Montserrat', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#2A2F3A';
        });

        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'transparent';
        });

        cancelBtn.addEventListener('click', () => {
            this.closeModal(overlay);
        });

        // Кнопка сохранения
        const okBtn = document.createElement('button');
        okBtn.textContent = 'Сохранить';
        okBtn.style.cssText = `
            flex: 1;
            background: #FF5500;
            border: none;
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Montserrat', sans-serif;
            cursor: pointer;
            transition: background 0.2s ease;
        `;

        okBtn.addEventListener('mouseenter', () => {
            okBtn.style.background = '#FF6B4A';
        });

        okBtn.addEventListener('mouseleave', () => {
            okBtn.style.background = '#FF5500';
        });

        okBtn.addEventListener('click', () => {
            const newName = input.value.trim();
            if (newName.length >= 3 && newName.length <= 10) {
                this.tempName = newName;
                document.getElementById('profileName').textContent = newName;
                App.hapticFeedback('medium');
                this.closeModal(overlay);
            } else {
                App.showAlert('Никнейм должен быть от 3 до 10 символов');
                input.focus();
            }
        });

        // Собираем модалку
        buttonsDiv.appendChild(cancelBtn);
        buttonsDiv.appendChild(okBtn);
        
        modal.appendChild(title);
        modal.appendChild(input);
        modal.appendChild(buttonsDiv);
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Анимация появления
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
            input.focus();
        }, 10);
    },

    closeModal(overlay) {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
            overlay.remove();
        }, 200);
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
        
        // Показываем красивое модальное окно вместо prompt
        this.showNameInputModal();
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

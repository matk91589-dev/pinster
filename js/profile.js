// ============================================
// ПРОФИЛЬ - ИСПРАВЛЕННАЯ ВЕРСИЯ (С TOAST СВЕРХУ)
// ============================================

const Profile = {
    editMode: false,
    savedName: '-',
    savedAvatar: '<div class="tg-avatar-svg"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#ffffff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff"/></svg></div>',
    savedAge: '',
    savedSteam: '',
    savedFaceitLink: '',
    tempName: '-',
    tempAvatar: '<div class="tg-avatar-svg"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#ffffff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff"/></svg></div>',
    tempAge: '',
    tempSteam: '',
    tempFaceitLink: '',
    telegramId: null,
    toastTimeout: null,
    
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
    
    // Toast уведомление (СВЕРХУ)
    showToast(message) {
        // Очищаем предыдущий таймер
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        // Удаляем существующий тост
        const existingToast = document.querySelector('.profile-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Создаем новый
        const toast = document.createElement('div');
        toast.className = 'profile-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Запускаем анимацию
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Убираем через 1 секунду
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 1000);
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
                // Если с сервера приходит аватарка, используем её, иначе оставляем SVG
                if (data.avatar) {
                    this.savedAvatar = data.avatar;
                }
                
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
        if (avatarDiv) {
            avatarDiv.innerHTML = this.savedAvatar;
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
        
        if (this.editMode) {
            // ВКЛЮЧАЕМ режим редактирования
            profileScreen.classList.add('editable');
            if (editToggle) editToggle.classList.add('active');
            
            // ПОКАЗЫВАЕМ кнопку "Применить"
            if (applyBtn) {
                applyBtn.classList.add('visible');
                applyBtn.style.display = 'inline-block';
            }
            
            // Делаем поля редактируемыми
            if (ageInput) ageInput.readOnly = false;
            if (steamInput) steamInput.readOnly = false;
            if (faceitInput) faceitInput.readOnly = false;
            
            // Подсвечиваем ник оранжевым
            if (profileName) {
                profileName.classList.add('editable');
            }
        } else {
            // ВЫКЛЮЧАЕМ режим редактирования
            profileScreen.classList.remove('editable');
            if (editToggle) editToggle.classList.remove('active');
            
            // ПОЛНОСТЬЮ СКРЫВАЕМ кнопку "Применить"
            if (applyBtn) {
                applyBtn.classList.remove('visible');
                applyBtn.style.display = 'none';
            }
            
            // Делаем поля только для чтения
            if (ageInput) ageInput.readOnly = true;
            if (steamInput) steamInput.readOnly = true;
            if (faceitInput) faceitInput.readOnly = true;
            
            // Убираем подсветку с ника
            if (profileName) {
                profileName.classList.remove('editable');
            }
        }
    },
    
    validateAge(ageStr) {
        // Разрешаем пустую строку
        if (ageStr === '') {
            this.tempAge = '';
            return true;
        }
        
        if (ageStr.length > 3) {
            this.showToast('❌ Возраст должен быть не более 3 символов');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        const age = parseInt(ageStr);
        
        if (isNaN(age) || age < 0 || age > 100) {
            this.showToast('❌ Возраст должен быть числом от 0 до 100');
            document.getElementById('ageValue').value = this.tempAge;
            return false;
        }
        
        this.tempAge = ageStr;
        return true;
    },

    validateSteamLink(link) {
        // Разрешаем пустую строку
        if (link === '') {
            this.tempSteam = '';
            return true;
        }
        
        if (link.length > 100) {
            this.showToast('❌ Ссылка Steam должна быть не более 100 символов');
            return false;
        }
        return true;
    },

    validateFaceitLink(link) {
        // Разрешаем пустую строку
        if (link === '') {
            this.tempFaceitLink = '';
            return true;
        }
        
        if (link.length > 100) {
            this.showToast('❌ Ссылка Faceit должна быть не более 100 символов');
            return false;
        }
        return true;
    },
    
    async applyChanges() {
        // Блокируем кнопку на время отправки
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.style.pointerEvents = 'none';
            applyBtn.style.opacity = '0.5';
        }
        
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
        const profileName = document.getElementById('profileName');

        if (ageInput && !this.validateAge(ageInput.value)) {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        if (steamInput && !this.validateSteamLink(steamInput.value)) {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }
        
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) {
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
                
                if (profileName) {
                    profileName.textContent = this.savedName;
                }
                
                // ВЫКЛЮЧАЕМ режим редактирования (кнопка скроется)
                this.toggleEditMode();
            }
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
        } finally {
            // Разблокируем кнопку (она уже будет скрыта)
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
        }
    },
    
    // Редактирование ника без плашки - просто в строку
    editName() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        
        const profileName = document.getElementById('profileName');
        if (!profileName) return;
        
        // Создаем компактное поле ввода прямо на месте текста
        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.value = this.tempName;
        tempInput.maxLength = 10;
        tempInput.style.cssText = `
            width: 100%;
            background: transparent;
            border: none;
            color: #FF5500;
            font-size: clamp(16px, 5vw, 20px);
            font-weight: 600;
            font-family: 'Montserrat', sans-serif;
            outline: none;
            padding: 4px 0;
            margin: 0;
        `;
        
        // Заменяем текст на поле ввода
        profileName.style.display = 'none';
        profileName.parentNode.insertBefore(tempInput, profileName.nextSibling);
        
        // Фокус на поле
        setTimeout(() => tempInput.focus(), 50);
        
        // Обработчик потери фокуса
        const blurHandler = () => {
            setTimeout(() => {
                if (!tempInput.matches(':focus')) {
                    this.saveNameFromTempInput(tempInput, profileName);
                }
            }, 100);
        };
        
        // Обработчик Enter
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveNameFromTempInput(tempInput, profileName);
            }
        };
        
        tempInput.addEventListener('blur', blurHandler, { once: true });
        tempInput.addEventListener('keypress', keyHandler, { once: true });
    },
    
    // Сохранение из временного поля
    async saveNameFromTempInput(tempInput, profileName) {
        const newName = tempInput.value.trim();
        
        if (newName === '') {
            tempInput.remove();
            profileName.style.display = 'inline-block';
            return;
        }
        
        if (newName.length >= 3 && newName.length <= 10) {
            if (!this.telegramId) {
                this.telegramId = this.getTelegramId();
                if (!this.telegramId) {
                    tempInput.remove();
                    profileName.style.display = 'inline-block';
                    return;
                }
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
                } else {
                    this.showToast('❌ Ошибка при сохранении ника');
                }
            } catch (error) {
                console.error('❌ Ошибка отправки:', error);
                this.showToast('❌ Не удалось сохранить ник');
            }
        } else {
            this.showToast('❌ Никнейм должен быть от 3 до 10 символов');
        }
        
        // Удаляем временное поле и показываем текст
        tempInput.remove();
        profileName.style.display = 'inline-block';
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
    
    // НОВЫЙ МЕТОД: обработка кликов по всем элементам профиля
    setupClickHandlers() {
        // Аватарка - ТЕПЕРЬ ТОЖЕ ПОКАЗЫВАЕТ ТОСТ
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.addEventListener('click', (e) => {
                if (!this.editMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        // Ник (есть встроенный обработчик, но добавим для надежности)
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.addEventListener('click', (e) => {
                if (!this.editMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        // Возраст
        const ageCard = document.getElementById('ageCard');
        if (ageCard) {
            ageCard.addEventListener('click', (e) => {
                if (!this.editMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        // Steam
        const steamCard = document.getElementById('steamCard');
        if (steamCard) {
            steamCard.addEventListener('click', (e) => {
                if (!this.editMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        // Faceit
        const faceitCard = document.getElementById('faceitLinkCard');
        if (faceitCard) {
            faceitCard.addEventListener('click', (e) => {
                if (!this.editMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
    },
    
    setupListeners() {
        const ageInput = document.getElementById('ageValue');
        if (ageInput) {
            ageInput.addEventListener('blur', (e) => {
                if (this.editMode) this.validateAge(e.target.value);
            });
        }
        
        // Скрываем кнопку "Применить" при загрузке
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.style.display = 'none';
        }
    },
    
    loadSavedValues() {
        this.loadProfileFromServer();
        setTimeout(() => {
            this.setupListeners();
            this.setupClickHandlers(); // Добавляем обработчики кликов
        }, 200);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Profile.loadSavedValues();
});

window.Profile = Profile;

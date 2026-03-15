// ============================================
// ПРОФИЛЬ - С ВАЛИДАЦИЕЙ ЧЕРЕЗ КРАСНУЮ РАМКУ
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
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        const existingToast = document.querySelector('.profile-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
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
    
    async loadProfileFromServer() {
        this.telegramId = this.getTelegramId();
        console.log('📥 Загрузка профиля для telegram_id:', this.telegramId);
        
        if (!this.telegramId) {
            console.error('❌ Нет telegram_id');
            return;
        }
        
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
            console.log('📦 Данные профиля с сервера:', data);
            
            if (data.status === 'ok') {
                // Сохраняем данные
                this.savedName = data.nick || '-';
                this.savedAge = data.age || '';
                this.savedSteam = data.steam_link || '';
                this.savedFaceitLink = data.faceit_link || '';
                this.savedAvatarUrl = data.avatar || null;  // 👈 СОХРАНЯЕМ АВАТАРКУ
                
                this.tempName = this.savedName;
                this.tempAge = this.savedAge;
                this.tempSteam = this.savedSteam;
                this.tempFaceitLink = this.savedFaceitLink;
                this.tempAvatarUrl = this.savedAvatarUrl;
                
                // Обновляем отображение
                this.updateDisplay();
                console.log('✅ Профиль обновлен');
            } else {
                console.error('❌ Ошибка в ответе сервера:', data);
            }
            
            setTimeout(() => {
                if (typeof Search !== 'undefined' && Search.checkMatchStatus) {
                    Search.checkMatchStatus();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error);
        }
    },
    
    updateDisplay() {
        console.log('🔄 Обновление отображения профиля');
        
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) {
            profileNameEl.textContent = this.savedName;
        }
        
        const ageValueEl = document.getElementById('ageValue');
        if (ageValueEl) {
            ageValueEl.value = this.savedAge || '';
        }
        
        const steamDisplayEl = document.getElementById('steamDisplay');
        if (steamDisplayEl) {
            steamDisplayEl.value = this.savedSteam || '';
        }
        
        const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplayEl) {
            faceitLinkDisplayEl.value = this.savedFaceitLink || '';
        }
        
        // 👇 ОБНОВЛЯЕМ АВАТАРКУ
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            if (this.savedAvatarUrl) {
                // Если есть сохраненная аватарка - показываем её
                avatarDiv.innerHTML = `<img src="${this.savedAvatarUrl}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                // Если нет - показываем заглушку
                avatarDiv.innerHTML = this.savedAvatar;
            }
        }
        
        this.clearAllErrors();
    },
    
    // 👇 ФУНКЦИЯ ДЛЯ ВЫБОРА АВАТАРКИ
    editAvatar() {
        if (!this.editMode) {
            this.showToast('Для изменений перейдите в режим редактирования');
            return;
        }
        
        // Создаем скрытый input для загрузки файла
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Проверяем размер (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('❌ Файл слишком большой (макс 5MB)');
                fileInput.remove();
                return;
            }
            
            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                this.showToast('❌ Можно загружать только изображения');
                fileInput.remove();
                return;
            }
            
            // Показываем превью
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarDiv = document.getElementById('profileAvatar');
                if (avatarDiv) {
                    avatarDiv.innerHTML = `<img src="${e.target.result}" alt="avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    this.tempAvatarUrl = e.target.result;
                }
            };
            reader.readAsDataURL(file);
            
            // Здесь потом будет загрузка на сервер
            this.showToast('✅ Аватарка выбрана, сохраните профиль');
            
            fileInput.remove();
        };
        
        fileInput.click();
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
        
        this.clearAllErrors();
        
        if (this.editMode) {
            profileScreen.classList.add('editable');
            if (editToggle) editToggle.classList.add('active');
            
            if (applyBtn) {
                applyBtn.classList.add('visible');
                applyBtn.style.display = 'inline-block';
            }
            
            if (ageInput) ageInput.readOnly = false;
            if (steamInput) steamInput.readOnly = false;
            if (faceitInput) faceitInput.readOnly = false;
            
            if (profileName) {
                profileName.classList.add('editable');
            }
            
            // Подсвечиваем аватарку
            if (avatar) {
                avatar.classList.add('editable-avatar');
            }
        } else {
            profileScreen.classList.remove('editable');
            if (editToggle) editToggle.classList.remove('active');
            
            if (applyBtn) {
                applyBtn.classList.remove('visible');
                applyBtn.style.display = 'none';
            }
            
            if (ageInput) ageInput.readOnly = true;
            if (steamInput) steamInput.readOnly = true;
            if (faceitInput) faceitInput.readOnly = true;
            
            if (profileName) {
                profileName.classList.remove('editable');
            }
            
            // Убираем подсветку аватарки
            if (avatar) {
                avatar.classList.remove('editable-avatar');
            }
            
            // Если были изменения аватарки, но не сохранили - откатываем
            if (this.tempAvatarUrl !== this.savedAvatarUrl) {
                this.tempAvatarUrl = this.savedAvatarUrl;
                this.updateDisplay();
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
        const profileName = document.getElementById('profileName');

        let isValid = true;
        
        if (ageInput && !this.validateAge(ageInput.value)) {
            isValid = false;
        }
        
        if (steamInput && !this.validateSteamLink(steamInput.value)) {
            isValid = false;
        }
        
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) {
            isValid = false;
        }
        
        if (!isValid) {
            if (applyBtn) {
                applyBtn.style.pointerEvents = 'auto';
                applyBtn.style.opacity = '1';
            }
            return;
        }

        // 👇 СОБИРАЕМ ДАННЫЕ ВКЛЮЧАЯ АВАТАРКУ
        const dataToSend = {
            telegram_id: this.telegramId,
            nick: this.tempName,
            age: ageInput ? ageInput.value || null : null,
            steam_link: steamInput ? steamInput.value || null : null,
            faceit_link: faceitInput ? faceitInput.value || null : null,
            avatar: this.tempAvatarUrl || null  // 👈 ОТПРАВЛЯЕМ АВАТАРКУ
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
                this.savedAvatarUrl = this.tempAvatarUrl;  // 👈 СОХРАНЯЕМ АВАТАРКУ
                
                if (profileName) {
                    profileName.textContent = this.savedName;
                }
                
                this.toggleEditMode();
                this.showToast('✅ Профиль сохранен');
            }
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
            this.showToast('❌ Ошибка сохранения');
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
        
        profileName.style.display = 'none';
        profileName.parentNode.insertBefore(tempInput, profileName.nextSibling);
        
        setTimeout(() => tempInput.focus(), 50);
        
        const blurHandler = () => {
            setTimeout(() => {
                if (!tempInput.matches(':focus')) {
                    this.saveNameFromTempInput(tempInput, profileName);
                }
            }, 100);
        };
        
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveNameFromTempInput(tempInput, profileName);
            }
        };
        
        tempInput.addEventListener('blur', blurHandler, { once: true });
        tempInput.addEventListener('keypress', keyHandler, { once: true });
    },
    
    async saveNameFromTempInput(tempInput, profileName) {
        const newName = tempInput.value.trim();
        
        if (newName === '') {
            tempInput.remove();
            profileName.style.display = 'inline-block';
            return;
        }
        
        if (newName.length >= 3 && newName.length <= 10) {
            this.tempName = newName;
            profileName.textContent = newName;
            this.showToast('✅ Нажмите "Применить" для сохранения');
        } else {
            this.showToast('❌ Никнейм должен быть от 3 до 10 символов');
        }
        
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
    
    setupClickHandlers() {
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.addEventListener('click', (e) => {
                if (this.editMode) {
                    this.editAvatar();
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.addEventListener('click', (e) => {
                if (this.editMode) {
                    this.editName();
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        const ageCard = document.getElementById('ageCard');
        if (ageCard) {
            ageCard.addEventListener('click', (e) => {
                if (this.editMode) {
                    this.editAge();
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        const steamCard = document.getElementById('steamCard');
        if (steamCard) {
            steamCard.addEventListener('click', (e) => {
                if (this.editMode) {
                    this.editSteam();
                } else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showToast('Для изменений перейдите в режим редактирования');
                }
            });
        }
        
        const faceitCard = document.getElementById('faceitLinkCard');
        if (faceitCard) {
            faceitCard.addEventListener('click', (e) => {
                if (this.editMode) {
                    this.editFaceitLink();
                } else {
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
            
            ageInput.addEventListener('focus', () => {
                if (this.editMode) {
                    const container = ageInput.closest('.stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            });
            
            ageInput.addEventListener('input', (e) => {
                if (this.editMode) {
                    const val = e.target.value;
                    const container = ageInput.closest('.stat-value');
                    
                    if (val === '' || (val.length <= 3 && !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100)) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            });
        }
        
        const steamInput = document.getElementById('steamDisplay');
        if (steamInput) {
            steamInput.addEventListener('blur', (e) => {
                if (this.editMode) this.validateSteamLink(e.target.value);
            });
            
            steamInput.addEventListener('focus', () => {
                if (this.editMode) {
                    const container = steamInput.closest('.profile-stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            });
            
            steamInput.addEventListener('input', (e) => {
                if (this.editMode) {
                    const val = e.target.value;
                    const container = steamInput.closest('.profile-stat-value');
                    
                    if (val.length <= 100) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            });
        }
        
        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput) {
            faceitInput.addEventListener('blur', (e) => {
                if (this.editMode) this.validateFaceitLink(e.target.value);
            });
            
            faceitInput.addEventListener('focus', () => {
                if (this.editMode) {
                    const container = faceitInput.closest('.profile-stat-value');
                    this.removeErrorMessage(container);
                    container?.classList.remove('error');
                }
            });
            
            faceitInput.addEventListener('input', (e) => {
                if (this.editMode) {
                    const val = e.target.value;
                    const container = faceitInput.closest('.profile-stat-value');
                    
                    if (val.length <= 100) {
                        this.removeErrorMessage(container);
                        container?.classList.remove('error');
                    }
                }
            });
        }
        
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.style.display = 'none';
        }
    },
    
    loadSavedValues() {
        console.log('🚀 Загружаем сохраненные значения профиля');
        this.loadProfileFromServer();
        setTimeout(() => {
            this.setupListeners();
            this.setupClickHandlers();
        }, 200);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Profile: DOM загружен');
    Profile.loadSavedValues();
});

window.Profile = Profile;

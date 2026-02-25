// ============================================
// ПРОФИЛЬ (Telegram Mini App версия) - С АЛЕРТАМИ ДЛЯ ОТЛАДКИ
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
    
    setInputsReadonly(readonly) {
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        [ageInput, steamInput, faceitInput].forEach(input => {
            if (input) {
                input.readOnly = readonly;
                const parentStat = input.closest('.stat-value') || input.closest('.profile-stat-card');
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
    
    // Получаем telegram_id из URL
    getTelegramId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tg_id');
    },
    
    // Загружаем профиль с сервера
    async loadProfileFromServer() {
        alert('1. loadProfileFromServer начата');
        this.telegramId = this.getTelegramId();
        alert('2. telegramId из URL: ' + (this.telegramId || 'НЕТ'));
        
        if (!this.telegramId) {
            alert('❌ Нет telegram_id в URL');
            return;
        }
        
        try {
            alert('3. Отправка запроса к /api/profile/get');
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/profile/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            alert('4. Статус ответа: ' + response.status);
            const data = await response.json();
            alert('5. Данные получены: ' + JSON.stringify(data));
            
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
                alert('6. Профиль обновлён на странице');
            } else {
                alert('❌ Ошибка загрузки: ' + JSON.stringify(data));
            }
        } catch (error) {
            alert('❌ Ошибка загрузки: ' + error.message);
        }
    },
    
    // Обновляем отображение
    updateDisplay() {
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = this.savedName;
        
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
        
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            avatarDiv.innerHTML = this.savedAvatar;
        }
    },
    
    // Добавляем обработчики для полей ввода
    setupInputListeners() {
        const ageInput = document.getElementById('ageValue');
        const steamInput = document.getElementById('steamDisplay');
        const faceitInput = document.getElementById('faceitLinkDisplay');
        
        [ageInput, steamInput, faceitInput].forEach(input => {
            if (input) {
                // Убираем старые обработчики
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                newInput.addEventListener('click', (e) => {
                    if (!this.editMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Для изменений перейдите в раздел редактирования (карандаш)');
                    }
                });
                
                newInput.addEventListener('focus', (e) => {
                    if (!this.editMode) {
                        e.target.blur();
                    }
                });

                // Валидация возраста
                if (newInput.id === 'ageValue') {
                    newInput.addEventListener('blur', (e) => {
                        if (this.editMode) {
                            this.validateAge(e.target.value);
                        }
                    });
                }

                // Обновляем ссылки на элементы
                if (newInput.id === 'ageValue') document.getElementById('ageValue') = newInput;
                if (newInput.id === 'steamDisplay') document.getElementById('steamDisplay') = newInput;
                if (newInput.id === 'faceitLinkDisplay') document.getElementById('faceitLinkDisplay') = newInput;
            }
        });
    },

    // Валидация возраста
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
    
    // Настройка поля для ввода ника
    setupNameInputListener() {
        const nameInput = document.getElementById('editProfileName');
        if (!nameInput) return;

        // Убираем старые обработчики
        const newNameInput = nameInput.cloneNode(true);
        nameInput.parentNode.replaceChild(newNameInput, nameInput);
        document.getElementById('editProfileName') = newNameInput;

        // Обработчик потери фокуса
        newNameInput.addEventListener('blur', () => {
            this.saveNameFromInput();
        });

        // Обработчик нажатия Enter
        newNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveNameFromInput();
            }
        });
    },

    // Сохранение имени из поля ввода
    saveNameFromInput() {
        const nameInput = document.getElementById('editProfileName');
        const profileName = document.getElementById('profileName');
        
        if (!nameInput || !profileName) return;

        const newName = nameInput.value.trim();
        
        if (newName === '') {
            // Если пусто, возвращаем старое имя
            nameInput.value = this.tempName;
            nameInput.style.display = 'none';
            profileName.style.display = 'inline-block';
            return;
        }
        
        if (newName.length >= 3 && newName.length <= 10) {
            this.tempName = newName;
            profileName.textContent = newName;
            alert('✅ Никнейм изменен');
            
            // Скрываем поле ввода, показываем текст
            nameInput.style.display = 'none';
            profileName.style.display = 'inline-block';
        } else {
            alert('❌ Никнейм должен быть от 3 до 10 символов');
            nameInput.value = this.tempName;
            nameInput.focus();
        }
    },
    
    loadSavedValues() {
        alert('🔄 loadSavedValues начата');
        this.telegramId = this.getTelegramId();
        alert('📱 Telegram ID из URL: ' + (this.telegramId || 'НЕТ'));
        
        this.loadProfileFromServer();
        
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            avatarDiv.innerHTML = this.savedAvatar;
        }
        
        setTimeout(() => {
            this.setupInputListeners();
            this.setupNameInputListener();
        }, 100);
    },
    
    toggleEditMode() {
        alert('✏️ toggleEditMode: ' + (this.editMode ? 'выключение' : 'включение'));
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
        const profileName = document.getElementById('profileName');
        const nameInput = document.getElementById('editProfileName');
        
        if (this.editMode) {
            if (editToggle) editToggle.classList.add('active');
            if (applyBtn) applyBtn.classList.add('visible');
            elements.forEach(el => {
                if (el) el.classList.add('editable');
            });
            this.setInputsReadonly(false);
            
            if (profileName && nameInput) {
                profileName.style.display = 'none';
                nameInput.style.display = 'inline-block';
                nameInput.value = this.tempName;
                setTimeout(() => nameInput.focus(), 100);
            }
        } else {
            if (editToggle) editToggle.classList.remove('active');
            if (applyBtn) applyBtn.classList.remove('visible');
            elements.forEach(el => {
                if (el) el.classList.remove('editable');
            });
            this.setInputsReadonly(true);
            
            if (profileName && nameInput) {
                nameInput.style.display = 'none';
                profileName.style.display = 'inline-block';
            }
        }
    },
    
    async applyChanges() {
        alert('🔵 ШАГ 1: applyChanges вызвана!');
        
        if (!this.telegramId) {
            alert('🔵 ШАГ 2: telegramId нет, пробуем получить из URL');
            this.telegramId = this.getTelegramId();
            alert('🔵 ШАГ 3: telegramId = ' + (this.telegramId || 'НЕТ'));
            
            if (!this.telegramId) {
                alert('❌ Ошибка: нет telegram_id');
                return;
            }
        } else {
            alert('🔵 ШАГ 2: telegramId уже есть = ' + this.telegramId);
        }

        const ageInput = document.getElementById('ageValue');
        alert('🔵 ШАГ 4: возраст = ' + (ageInput ? ageInput.value : 'поле не найдено'));

        if (ageInput && !this.validateAge(ageInput.value)) {
            alert('🔵 ШАГ 5: возраст не прошёл валидацию');
            return;
        }
        alert('🔵 ШАГ 5: возраст прошёл валидацию');

        const steamInput = document.getElementById('steamDisplay');
        if (steamInput && !this.validateSteamLink(steamInput.value)) {
            alert('🔵 ШАГ 6: ссылка Steam не прошла валидацию');
            return;
        }
        alert('🔵 ШАГ 6: ссылка Steam прошла валидацию');

        const faceitInput = document.getElementById('faceitLinkDisplay');
        if (faceitInput && !this.validateFaceitLink(faceitInput.value)) {
            alert('🔵 ШАГ 7: ссылка Faceit не прошла валидацию');
            return;
        }
        alert('🔵 ШАГ 7: ссылка Faceit прошла валидацию');

        const dataToSend = {
            telegram_id: this.telegramId,
            nick: this.tempName,
            age: ageInput ? ageInput.value || null : null,
            steam_link: steamInput ? steamInput.value || null : null,
            faceit_link: faceitInput ? faceitInput.value || null : null
        };
        alert('🔵 ШАГ 8: данные для отправки: ' + JSON.stringify(dataToSend));

        try {
            alert('🔵 ШАГ 9: отправка запроса...');
            const response = await fetch('https://matk91589-dev-pingster-backend-e306.twc1.net/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            alert('🔵 ШАГ 10: статус ответа: ' + response.status);
            
            const data = await response.json();
            alert('🔵 ШАГ 11: ответ сервера: ' + JSON.stringify(data));
            
            if (data.status === 'ok') {
                this.savedName = this.tempName;
                this.savedAvatar = this.tempAvatar;
                this.savedAge = ageInput ? ageInput.value : '';
                this.savedSteam = steamInput ? steamInput.value : '';
                this.savedFaceitLink = faceitInput ? faceitInput.value : '';
                
                this.updateDisplay();
                alert('✅ ШАГ 12: Изменения сохранены!');
                this.toggleEditMode();
            } else {
                alert('❌ ШАГ 12: Ошибка при сохранении: ' + JSON.stringify(data));
            }
        } catch (error) {
            alert('❌ ОШИБКА: ' + error.message);
        }
    },
    
    editName() {
        alert('📝 editName');
        if (!this.editMode) {
            alert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        
        const nameInput = document.getElementById('editProfileName');
        if (nameInput) {
            nameInput.focus();
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
    },

    editFaceitAge() {
        document.getElementById('faceitAgeValue').focus();
    },

    editPremierAge() {
        document.getElementById('premierAgeValue').focus();
    },

    editPrimeAge() {
        document.getElementById('primeAgeValue').focus();
    },

    editPublicAge() {
        document.getElementById('publicAgeValue').focus();
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    alert('🔥 Profile.js загружен');
    setTimeout(() => {
        if (document.getElementById('profileName')) {
            Profile.loadSavedValues();
        } else {
            alert('❌ Элемент profileName не найден');
        }
    }, 500);
});

window.Profile = Profile;

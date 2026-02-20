// ============================================
// ФУНКЦИИ ПРОФИЛЯ
// ============================================

// Генерация случайного ника из 6 символов (буквы + цифры)
function generateRandomNick() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nick = '';
    for (let i = 0; i < 6; i++) {
        nick += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nick;
}

// Функция для блокировки/разблокировки полей ввода
function setInputsReadonly(readonly) {
    const ageInput = document.getElementById('ageValue');
    const steamInput = document.getElementById('steamDisplay');
    const faceitInput = document.getElementById('faceitLinkDisplay');
    
    if (ageInput) {
        ageInput.readOnly = readonly;
        if (!readonly) {
            ageInput.classList.add('editable-input');
        } else {
            ageInput.classList.remove('editable-input');
        }
    }
    
    if (steamInput) {
        steamInput.readOnly = readonly;
        if (!readonly) {
            steamInput.classList.add('editable-input');
        } else {
            steamInput.classList.remove('editable-input');
        }
    }
    
    if (faceitInput) {
        faceitInput.readOnly = readonly;
        if (!readonly) {
            faceitInput.classList.add('editable-input');
        } else {
            faceitInput.classList.remove('editable-input');
        }
    }
}

function loadSavedValues() {
    // Если нет сохраненного ника, генерируем случайный
    if (savedName === '-') {
        savedName = generateRandomNick();
        tempName = savedName;
    }
    
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = savedName;
    
    // Для input'ов используем value, а не textContent
    const ageValueEl = document.getElementById('ageValue');
    if (ageValueEl) {
        if (savedAge && savedAge !== '-') {
            ageValueEl.value = savedAge;
        } else {
            ageValueEl.placeholder = '0-100';
            ageValueEl.value = '';
        }
        ageValueEl.maxLength = 3; // Ограничение на 3 символа
        ageValueEl.readOnly = true; // По умолчанию заблокировано
    }
    
    const steamDisplayEl = document.getElementById('steamDisplay');
    if (steamDisplayEl) {
        if (savedSteam && savedSteam !== '-') {
            steamDisplayEl.value = savedSteam;
        } else {
            steamDisplayEl.placeholder = 'введите ссылку на ваш профиль steam';
            steamDisplayEl.value = '';
        }
        steamDisplayEl.maxLength = 50; // Ограничение на 50 символов
        steamDisplayEl.readOnly = true; // По умолчанию заблокировано
    }
    
    const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
    if (faceitLinkDisplayEl) {
        if (savedFaceitLink && savedFaceitLink !== '-') {
            faceitLinkDisplayEl.value = savedFaceitLink;
        } else {
            faceitLinkDisplayEl.placeholder = 'введите ссылку на ваш профиль faceit / пропустите';
            faceitLinkDisplayEl.value = '';
        }
        faceitLinkDisplayEl.maxLength = 50; // Ограничение на 50 символов
        faceitLinkDisplayEl.readOnly = true; // По умолчанию заблокировано
    }
    
    const coinsAmountEl = document.getElementById('coinsAmount');
    if (coinsAmountEl) coinsAmountEl.textContent = coins;
    
    const avatarDiv = document.getElementById('profileAvatar');
    if (avatarDiv) {
        if (savedAvatar && savedAvatar.startsWith('http')) {
            avatarDiv.innerHTML = `<img src="${savedAvatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            avatarDiv.className = 'profile-avatar';
        } else {
            avatarDiv.innerHTML = savedAvatar;
            avatarDiv.className = 'profile-avatar';
            ownedFrames.forEach(frameId => {
                const frame = frames.find(f => f.id === frameId);
                if (frame) avatarDiv.classList.add(frame.class);
            });
        }
    }
    
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.className = 'profile-name';
        ownedNicks.forEach(nickId => {
            const nick = nicks.find(n => n.id === nickId);
            if (nick) profileName.classList.add(nick.class);
        });
    }
    
    tempName = savedName;
    tempAvatar = savedAvatar;
    tempAge = savedAge;
    tempSteam = savedSteam;
    tempFaceitLink = savedFaceitLink;
}

function toggleEditMode() {
    editMode = !editMode;
    console.log('editMode =', editMode);
    
    const elements = [
        document.getElementById('profileName'),
        document.getElementById('profileAvatar'),
        document.getElementById('ageCard'),
        document.getElementById('steamCard'),
        document.getElementById('faceitLinkCard')
    ];
    
    const editToggle = document.getElementById('editToggle');
    const applyBtn = document.getElementById('applyBtn');
    
    if (editMode) {
        if (editToggle) editToggle.classList.add('active');
        if (applyBtn) applyBtn.classList.add('visible');
        elements.forEach(el => {
            if (el) el.classList.add('editable');
        });
        // Разблокируем поля ввода
        setInputsReadonly(false);
    } else {
        if (editToggle) editToggle.classList.remove('active');
        if (applyBtn) applyBtn.classList.remove('visible');
        elements.forEach(el => {
            if (el) el.classList.remove('editable');
        });
        // Блокируем поля ввода
        setInputsReadonly(true);
    }
}

function applyChanges() {
    // Сохраняем значения из input'ов
    savedName = tempName;
    savedAvatar = tempAvatar;
    savedAge = document.getElementById('ageValue').value;
    savedSteam = document.getElementById('steamDisplay').value;
    savedFaceitLink = document.getElementById('faceitLinkDisplay').value;
    
    loadSavedValues();
    saveUserToDB();
    toggleEditMode();
}

function editName() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    const newName = prompt('Введите новый никнейм (3-10 символов):', tempName === '-' ? '' : tempName);
    if (newName && newName.length >= CONFIG.APP.MIN_NAME_LENGTH && newName.length <= CONFIG.APP.MAX_NAME_LENGTH) {
        tempName = newName;
        document.getElementById('profileName').textContent = newName;
    }
}

function editAge() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    // Поле уже разблокировано, можно редактировать напрямую
    const ageInput = document.getElementById('ageValue');
    ageInput.focus();
}

function editSteam() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    // Поле уже разблокировано, можно редактировать напрямую
    const steamInput = document.getElementById('steamDisplay');
    steamInput.focus();
}

function editFaceitLink() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    // Поле уже разблокировано, можно редактировать напрямую
    const faceitInput = document.getElementById('faceitLinkDisplay');
    faceitInput.focus();
}

function selectAvatar() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handleFileSelect(e.target.files[0]);
    input.click();
}

function editFaceitAge() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    const newAge = prompt('Введите возраст:', document.getElementById('faceitAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('faceitAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPremierAge() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    const newAge = prompt('Введите возраст:', document.getElementById('premierAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('premierAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPrimeAge() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    const newAge = prompt('Введите возраст:', document.getElementById('primeAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('primeAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPublicAge() {
    if (!editMode) {
        alert('Сначала включите режим редактирования (карандаш)');
        return;
    }
    const newAge = prompt('Введите возраст:', document.getElementById('publicAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('publicAgeValue').value = newAge;
        tempAge = newAge;
    }
}

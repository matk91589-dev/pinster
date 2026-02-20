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
    }
    
    const steamDisplayEl = document.getElementById('steamDisplay');
    if (steamDisplayEl) {
        if (savedSteam && savedSteam !== '-') {
            steamDisplayEl.value = savedSteam;
        } else {
            steamDisplayEl.placeholder = 'введите ссылку на ваш профиль steam';
            steamDisplayEl.value = '';
        }
    }
    
    const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
    if (faceitLinkDisplayEl) {
        if (savedFaceitLink && savedFaceitLink !== '-') {
            faceitLinkDisplayEl.value = savedFaceitLink;
        } else {
            faceitLinkDisplayEl.placeholder = 'введите ссылку на ваш профиль faceit / пропустите';
            faceitLinkDisplayEl.value = '';
        }
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
    } else {
        if (editToggle) editToggle.classList.remove('active');
        if (applyBtn) applyBtn.classList.remove('visible');
        elements.forEach(el => {
            if (el) el.classList.remove('editable');
        });
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
    if (!editMode) return;
    const newName = prompt('Введите новый никнейм (3-10 символов):', tempName === '-' ? '' : tempName);
    if (newName && newName.length >= CONFIG.APP.MIN_NAME_LENGTH && newName.length <= CONFIG.APP.MAX_NAME_LENGTH) {
        tempName = newName;
        document.getElementById('profileName').textContent = newName;
    }
}

function editAge() {
    if (!editMode) return;
    const newAge = prompt('Введите возраст (0-100):', document.getElementById('ageValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('ageValue').value = newAge;
        tempAge = newAge;
    }
}

function editSteam() {
    if (!editMode) return;
    const newSteam = prompt('Введите ссылку на Steam:', document.getElementById('steamDisplay').value || '');
    if (newSteam !== null) {
        document.getElementById('steamDisplay').value = newSteam;
        tempSteam = newSteam;
    }
}

function editFaceitLink() {
    if (!editMode) return;
    const newLink = prompt('Введите ссылку на Faceit:', document.getElementById('faceitLinkDisplay').value || '');
    if (newLink !== null) {
        document.getElementById('faceitLinkDisplay').value = newLink;
        tempFaceitLink = newLink;
    }
}

function editFaceitAge() {
    const newAge = prompt('Введите возраст:', document.getElementById('faceitAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('faceitAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPremierAge() {
    const newAge = prompt('Введите возраст:', document.getElementById('premierAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('premierAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPrimeAge() {
    const newAge = prompt('Введите возраст:', document.getElementById('primeAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('primeAgeValue').value = newAge;
        tempAge = newAge;
    }
}

function editPublicAge() {
    const newAge = prompt('Введите возраст:', document.getElementById('publicAgeValue').value || '');
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('publicAgeValue').value = newAge;
        tempAge = newAge;
    }
}

// ============================================
// ФУНКЦИИ ПРОФИЛЯ
// ============================================

function loadSavedValues() {
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = savedName;
    
    const ageValueEl = document.getElementById('ageValue');
    if (ageValueEl) ageValueEl.textContent = savedAge;
    
    const steamDisplayEl = document.getElementById('steamDisplay');
    if (steamDisplayEl) steamDisplayEl.textContent = savedSteam;
    
    const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
    if (faceitLinkDisplayEl) faceitLinkDisplayEl.textContent = savedFaceitLink;
    
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
    savedName = tempName;
    savedAvatar = tempAvatar;
    savedAge = tempAge;
    savedSteam = tempSteam;
    savedFaceitLink = tempFaceitLink;
    
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
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        tempAge = newAge;
        document.getElementById('ageValue').textContent = newAge;
    }
}

function editSteam() {
    if (!editMode) return;
    const newSteam = prompt('Введите ссылку на Steam:', tempSteam === '-' ? '' : tempSteam);
    if (newSteam) {
        tempSteam = newSteam;
        document.getElementById('steamDisplay').textContent = newSteam;
    }
}

function editFaceitLink() {
    if (!editMode) return;
    const newLink = prompt('Введите ссылку на Faceit:', tempFaceitLink === '-' ? '' : tempFaceitLink);
    if (newLink !== null) {
        tempFaceitLink = newLink || '-';
        document.getElementById('faceitLinkDisplay').textContent = tempFaceitLink;
    }
}

function editFaceitAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('faceitAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPremierAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('premierAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPrimeAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('primeAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}

function editPublicAge() {
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= CONFIG.APP.MAX_AGE) {
        document.getElementById('publicAgeValue').textContent = newAge;
        tempAge = newAge;
    }
}
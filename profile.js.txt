// ============================================
// ЗАГРУЗКА АВАТАРКИ
// ============================================
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

function handleFileSelect(file) {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой! Максимум 5MB');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Можно загружать только изображения!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const avatarDiv = document.getElementById('profileAvatar');
        if (avatarDiv) {
            avatarDiv.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
        
        const startAvatar = document.getElementById('startAvatar');
        if (startAvatar) {
            startAvatar.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
        uploadAvatar(file);
    };
    reader.readAsDataURL(file);
}

function setupDragAndDrop() {
    const avatarDiv = document.getElementById('profileAvatar');
    if (!avatarDiv) return; // Важно: проверяем существование элемента
    
    avatarDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        avatarDiv.style.border = '3px dashed #FF6B4A';
    });
    
    avatarDiv.addEventListener('dragleave', () => {
        avatarDiv.style.border = '';
    });
    
    avatarDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        avatarDiv.style.border = '';
        
        if (!editMode) {
            alert('Сначала включите режим редактирования');
            return;
        }
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    });
}

async function uploadAvatar(file) {
    if (!file) return;
    
    console.log('Загружаем аватарку...');
    
    if (savedAvatar && savedAvatar.includes('supabase')) {
        try {
            const oldFilePath = savedAvatar.split('/avatars/')[1];
            if (oldFilePath) {
                await supabaseClient.storage.from('avatars').remove([oldFilePath]);
            }
        } catch (e) {
            console.log('Не удалось удалить старую аватарку', e);
        }
    }
    
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    try {
        const { error: uploadError } = await supabaseClient
            .storage
            .from('avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        console.log('Аватарка загружена:', publicUrl);
        
        savedAvatar = publicUrl;
        tempAvatar = publicUrl;
        
        if (typeof saveUserToDB === 'function') await saveUserToDB();
        alert('✅ Аватарка загружена!');
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('❌ Ошибка при загрузке: ' + error.message);
        if (typeof loadSavedValues === 'function') loadSavedValues();
    }
}

// ============================================
// ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ СЛУЧАЙНОГО НИКА
// ============================================
function generateRandomName() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const length = Math.floor(Math.random() * 3) + 5;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
}

// ============================================
// ЗАГРУЗКА ЗНАЧЕНИЙ В ПРОФИЛЬ
// ============================================
function loadSavedValues() {
    // Проверяем существование всех элементов перед обращением
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = savedName;
    
    const ageValueEl = document.getElementById('ageValue');
    if (ageValueEl) ageValueEl.textContent = savedAge === '-' ? '' : savedAge;
    
    const steamDisplayEl = document.getElementById('steamDisplay');
    if (steamDisplayEl) steamDisplayEl.textContent = savedSteam === '-' ? '' : savedSteam;
    
    const faceitLinkDisplayEl = document.getElementById('faceitLinkDisplay');
    if (faceitLinkDisplayEl) faceitLinkDisplayEl.textContent = savedFaceitLink === '-' ? '' : savedFaceitLink;
    
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
            if (ownedFrames && ownedFrames.length) {
                ownedFrames.forEach(frameId => {
                    const frame = frames.find(f => f.id === frameId);
                    if (frame) avatarDiv.classList.add(frame.class);
                });
            }
        }
    }
    
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.className = 'profile-name';
        if (ownedNicks && ownedNicks.length) {
            ownedNicks.forEach(nickId => {
                const nick = nicks.find(n => n.id === nickId);
                if (nick) profileName.classList.add(nick.class);
            });
        }
    }
    
    tempName = savedName;
    tempAvatar = savedAvatar;
    tempAge = savedAge;
    tempSteam = savedSteam;
    tempFaceitLink = savedFaceitLink;
}

// ============================================
// РЕЖИМ РЕДАКТИРОВАНИЯ
// ============================================
function toggleEditMode() {
    editMode = !editMode;
    console.log('editMode =', editMode);
    
    const elements = [
        document.getElementById('profileName'),
        document.getElementById('profileAvatar'),
        document.getElementById('ageCard'),
        document.getElementById('steamCard'),
        document.getElementById('faceitLinkCard')
    ].filter(el => el !== null); // Убираем null элементы
    
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

// ============================================
// ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ
// ============================================
function applyChanges() {
    savedName = tempName;
    savedAvatar = tempAvatar;
    savedAge = tempAge;
    savedSteam = tempSteam;
    savedFaceitLink = tempFaceitLink;
    
    if (typeof loadSavedValues === 'function') loadSavedValues();
    if (typeof saveUserToDB === 'function') saveUserToDB();
    toggleEditMode();
}

// ============================================
// РЕДАКТИРОВАНИЕ ПОЛЕЙ
// ============================================
function editName() {
    if (!editMode) return;
    const newName = prompt('Введите новый никнейм (3-10 символов):', tempName === '-' ? '' : tempName);
    if (newName && newName.length >= 3 && newName.length <= 10) {
        tempName = newName;
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = newName;
    }
}

function editAge() {
    if (!editMode) return;
    const newAge = prompt('Введите возраст:', tempAge === '-' ? '' : tempAge);
    if (newAge && !isNaN(newAge) && newAge >= 0 && newAge <= 100) {
        tempAge = newAge;
        const ageValue = document.getElementById('ageValue');
        if (ageValue) ageValue.textContent = newAge;
    }
}

function editSteam() {
    if (!editMode) return;
    const newSteam = prompt('Введите ссылку на Steam:', tempSteam === '-' ? '' : tempSteam);
    if (newSteam) {
        tempSteam = newSteam;
        const steamDisplay = document.getElementById('steamDisplay');
        if (steamDisplay) steamDisplay.textContent = newSteam;
    }
}

function editFaceitLink() {
    if (!editMode) return;
    const newLink = prompt('Введите ссылку на Faceit:', tempFaceitLink === '-' ? '' : tempFaceitLink);
    if (newLink !== null) {
        tempFaceitLink = newLink || '-';
        const faceitLinkDisplay = document.getElementById('faceitLinkDisplay');
        if (faceitLinkDisplay) faceitLinkDisplay.textContent = tempFaceitLink;
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
// ============================================
function initProfile() {
    // Проверяем что элементы существуют перед инициализацией
    if (savedName === '-') {
        savedName = generateRandomName();
        tempName = savedName;
    }
    
    // Загружаем значения с проверкой
    if (typeof loadSavedValues === 'function') {
        // Добавляем небольшую задержку чтобы DOM точно загрузился
        setTimeout(loadSavedValues, 50);
    }
}

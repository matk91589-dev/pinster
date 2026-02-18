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
    
    if (file.size > CONFIG.APP.MAX_FILE_SIZE) {
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
        avatarDiv.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        const startAvatar = document.getElementById('startAvatar');
        if (startAvatar) startAvatar.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        uploadAvatar(file);
    };
    reader.readAsDataURL(file);
}

function setupDragAndDrop() {
    const avatarDiv = document.getElementById('profileAvatar');
    if (!avatarDiv) return;
    
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
        
        await saveUserToDB();
        alert('✅ Аватарка загружена!');
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('❌ Ошибка при загрузке: ' + error.message);
        loadSavedValues();
    }
}
// ============================================
// SUPABASE КОНФИГУРАЦИЯ
// ============================================
const supabaseUrl = 'https://foeacrrojoeymtvwbkqe.supabase.co';
const supabaseKey = 'sb_publishable__rPXE3FM5T9SZIKlagR6lA_WvjiAhJT';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ============================================
// РАБОТА С БАЗОЙ ДАННЫХ (только avatars)
// ============================================

// Сохраняем данные пользователя в localStorage (временное решение)
function saveUserToLocalStorage() {
    const userData = {
        savedName,
        savedAvatar,
        savedAge,
        savedSteam,
        savedFaceitLink,
        coins,
        ownedNicks,
        ownedFrames
    };
    localStorage.setItem('pingster_user', JSON.stringify(userData));
    console.log('Данные сохранены в localStorage');
}

// Загружаем данные пользователя из localStorage
function loadUserFromLocalStorage() {
    const savedData = localStorage.getItem('pingster_user');
    if (savedData) {
        try {
            const user = JSON.parse(savedData);
            savedName = user.savedName || '-';
            savedAvatar = user.savedAvatar || '👤';
            savedAge = user.savedAge || '-';
            savedSteam = user.savedSteam || '-';
            savedFaceitLink = user.savedFaceitLink || '-';
            coins = user.coins || 1000;
            ownedNicks = user.ownedNicks || [];
            ownedFrames = user.ownedFrames || [];
            
            console.log('Данные загружены из localStorage');
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
        }
    }
}

// Загрузка аватарки в Supabase (работает с таблицей avatars)
async function uploadAvatarToSupabase(file, telegramId) {
    if (!file || !telegramId) return null;
    
    try {
        // Сначала проверяем, есть ли уже запись для этого telegram_id
        const { data: existing, error: selectError } = await supabaseClient
            .from('avatars')
            .select('*')
            .eq('telegram_id', telegramId)
            .maybeSingle();
        
        if (selectError) throw selectError;
        
        // Загружаем файл в storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${telegramId}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabaseClient
            .storage
            .from('avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Получаем публичный URL
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        // Сохраняем ссылку в таблицу avatars
        if (existing) {
            // Обновляем существующую запись
            const { error: updateError } = await supabaseClient
                .from('avatars')
                .update({ avatar_url: publicUrl })
                .eq('telegram_id', telegramId);
            
            if (updateError) throw updateError;
        } else {
            // Создаем новую запись
            const { error: insertError } = await supabaseClient
                .from('avatars')
                .insert({ telegram_id: telegramId, avatar_url: publicUrl });
            
            if (insertError) throw insertError;
        }
        
        console.log('Аватарка загружена в Supabase');
        return publicUrl;
        
    } catch (error) {
        console.error('Ошибка загрузки в Supabase:', error);
        return null;
    }
}

// Получение аватарки из Supabase
async function getAvatarFromSupabase(telegramId) {
    if (!telegramId) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('avatars')
            .select('avatar_url')
            .eq('telegram_id', telegramId)
            .maybeSingle();
        
        if (error) throw error;
        
        return data?.avatar_url || null;
        
    } catch (error) {
        console.error('Ошибка получения аватарки:', error);
        return null;
    }
}

// ============================================
// ВРЕМЕННЫЕ ФУНКЦИИ ДЛЯ СОВМЕСТИМОСТИ
// ============================================
async function saveUserToDB() {
    saveUserToLocalStorage();
}

async function loadUserFromDB() {
    loadUserFromLocalStorage();
    
    // Пробуем загрузить аватарку из Supabase если есть telegramId
    if (typeof currentUserId !== 'undefined' && currentUserId) {
        const avatarUrl = await getAvatarFromSupabase(currentUserId);
        if (avatarUrl) {
            savedAvatar = avatarUrl;
            tempAvatar = avatarUrl;
            if (typeof loadSavedValues === 'function') loadSavedValues();
        }
    }
}

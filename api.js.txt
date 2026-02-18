// ============================================
// SUPABASE КОНФИГУРАЦИЯ
// ============================================
const supabaseUrl = 'https://foeacrrojoeymtvwbkqe.supabase.co';
const supabaseKey = 'sb_publishable__rPXE3FM5T9SZIKlagR6lA_WvjiAhJT';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ============================================
// РАБОТА ТОЛЬКО С АВАТАРКАМИ (таблица avatars)
// ============================================

// Загрузка аватарки в Supabase
async function uploadAvatar(file, userId) {
    if (!file || !userId) return null;
    
    try {
        console.log('Загружаем аватарку для пользователя:', userId);
        
        // Создаем уникальное имя файла
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Загружаем в Storage
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
        
        console.log('✅ Аватарка загружена в Storage');
        
        // Сохраняем ссылку в таблицу avatars
        const { error: dbError } = await supabaseClient
            .from('avatars')
            .insert([
                { 
                    telegram_id: userId, 
                    avatar_url: publicUrl 
                }
            ]);
        
        if (dbError) {
            // Если запись уже существует - обновляем
            if (dbError.code === '23505') { // unique violation
                const { error: updateError } = await supabaseClient
                    .from('avatars')
                    .update({ avatar_url: publicUrl })
                    .eq('telegram_id', userId);
                
                if (updateError) throw updateError;
                console.log('✅ Ссылка обновлена в таблице avatars');
            } else {
                throw dbError;
            }
        } else {
            console.log('✅ Ссылка сохранена в таблице avatars');
        }
        
        return publicUrl;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки аватарки:', error);
        return null;
    }
}

// Получение аватарки из Supabase
async function getAvatar(userId) {
    if (!userId) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('avatars')
            .select('avatar_url')
            .eq('telegram_id', userId)
            .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
            console.log('✅ Аватарка найдена в таблице avatars');
            return data.avatar_url;
        } else {
            console.log('ℹ️ Аватарка не найдена');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Ошибка получения аватарки:', error);
        return null;
    }
}

// ============================================
// ПУСТЫЕ ФУНКЦИИ ДЛЯ СОВМЕСТИМОСТИ (ничего не делают)
// ============================================
async function saveUserToDB() {
    // Ничего не сохраняем
    console.log('ℹ️ Сохранение в БД отключено');
}

async function loadUserFromDB() {
    // Ничего не загружаем
    console.log('ℹ️ Загрузка из БД отключена');
}

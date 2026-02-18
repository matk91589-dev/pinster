// ============================================
// SUPABASE КОНФИГУРАЦИЯ
// ============================================
const supabaseUrl = 'https://foeacrrojoeymtvwbkqe.supabase.co';
const supabaseKey = 'sb_publishable__rPXE3FM5T9SZIKlagR6lA_WvjiAhJT';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ============================================
// РАБОТА С БАЗОЙ ДАННЫХ
// ============================================
async function saveUserToDB() {
    console.log('Сохраняем данные...');
    
    try {
        let { data: user, error: selectError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', savedName === '-' ? 'pingster_user' : savedName)
            .maybeSingle();
        
        if (selectError) throw selectError;
        
        const userData = {
            username: savedName === '-' ? 'pingster_user' : savedName,
            avatar: savedAvatar.startsWith('http') ? null : savedAvatar,
            avatar_url: savedAvatar.startsWith('http') ? savedAvatar : null,
            age: savedAge === '-' ? null : parseInt(savedAge),
            steam_link: savedSteam === '-' ? null : savedSteam,
            faceit_link: savedFaceitLink === '-' ? null : savedFaceitLink,
            coins: coins,
            owned_nicks: ownedNicks,
            owned_frames: ownedFrames
        };
        
        if (user) {
            const { error } = await supabaseClient
                .from('users')
                .update(userData)
                .eq('id', user.id);
            if (error) throw error;
            console.log('Данные обновлены');
        } else {
            const { error } = await supabaseClient
                .from('users')
                .insert(userData);
            if (error) throw error;
            console.log('Новый пользователь создан');
        }
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка: ' + error.message);
    }
}

async function loadUserFromDB() {
    console.log('Загружаем данные...');
    
    try {
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', 'pingster_user')
            .maybeSingle();
        
        if (error) throw error;
        
        if (user) {
            savedName = user.username || '-';
            savedAge = user.age?.toString() || '-';
            savedSteam = user.steam_link || '-';
            savedFaceitLink = user.faceit_link || '-';
            coins = user.coins || 1000;
            ownedNicks = user.owned_nicks || [];
            ownedFrames = user.owned_frames || [];
            
            if (user.avatar_url) {
                savedAvatar = user.avatar_url;
            } else if (user.avatar) {
                savedAvatar = user.avatar;
            } else {
                savedAvatar = '👤';
            }
            
            if (typeof loadSavedValues === 'function') loadSavedValues();
            if (typeof renderShop === 'function') renderShop();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

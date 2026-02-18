// ============================================
// КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

const CONFIG = {
    // Настройки Supabase
    SUPABASE: {
        URL: 'https://foeacrrojoeymtvwbkqe.supabase.co',
        KEY: 'sb_publishable__rPXE3FM5T9SZIKlagR6lA_WvjiAhJT'
    },
    
    // Настройки приложения
    APP: {
        MAX_NAME_LENGTH: 10,
        MIN_NAME_LENGTH: 3,
        MAX_AGE: 100,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        DEFAULT_USERNAME: 'pingster_user'
    },
    
    // Константы для поиска
    SEARCH: {
        TIMER_UPDATE_INTERVAL: 1000 // 1 секунда
    }
};
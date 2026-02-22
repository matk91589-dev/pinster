// ============================================
// КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

const CONFIG = {
    APP: {
        MAX_NAME_LENGTH: 10,
        MIN_NAME_LENGTH: 3,
        MAX_AGE: 100,
        DEFAULT_USERNAME: 'pingster_user'
    },
    
    SEARCH: {
        TIMER_UPDATE_INTERVAL: 1000 // 1 секунда
    },
    
    // Настройки Telegram (опционально)
    TELEGRAM: {
        BOT_TOKEN: '', // если понадобится
        BACK_BUTTON: true
    }
};

// Заморозка объекта для защиты от изменений
Object.freeze(CONFIG);

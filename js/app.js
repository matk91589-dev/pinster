// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

(function() {
    // Telegram Mini App init (обязательно в самом начале)
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();                    // растягиваем на весь экран
        if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes(); // убираем свайп закрытия
        }
        
        // Адаптация под тему Telegram
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        
        // Слушаем изменения темы
        tg.onEvent('themeChanged', () => {
            document.body.style.backgroundColor = tg.themeParams.bg_color || '#0D0F15';
        });
    }

    // Запуск после полной загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Запуск Pingster...');
        
        // Инициализация модулей (с защитой от ошибок)
        try {
            if (typeof Shop !== 'undefined') Shop.init();
            if (typeof Friends !== 'undefined') Friends.init();
            if (typeof Search !== 'undefined') Search.init();
        } catch (e) {
            console.error('Ошибка инициализации модулей:', e);
        }
        
        // Сбрасываем иконку настроек
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.remove('active');
        }
        
        console.log('Pingster готов к работе!');
    });
})();

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Запуск Pingster...');
    
    // Инициализация модулей
    if (typeof Shop !== 'undefined') Shop.init();
    if (typeof Friends !== 'undefined') Friends.init();
    if (typeof Search !== 'undefined') Search.init();
    
    // Сбрасываем иконку настроек
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    console.log('Pingster готов к работе!');
});

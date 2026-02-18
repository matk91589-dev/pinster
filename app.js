// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

window.onload = async function() {
    console.log('Запуск Pingster...');
    
    // Инициализация
    setupDragAndDrop();
    await loadUserFromDB();
    generateFriends();
    
    // Сбрасываем иконку настроек при загрузке
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
        settingsIcon.classList.remove('active');
    }
    
    console.log('Pingster готов к работе!');
};
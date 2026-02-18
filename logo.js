// ============================================
// ФУНКЦИИ ДЛЯ ЛОГОТИПА
// ============================================

function handleLogoClick() {
    if (document.getElementById('searchScreen') && document.getElementById('searchScreen').style.display === 'flex') {
        alert('Сначала отмените поиск');
        return;
    }
    
    // Возвращаемся на главный экран
    hideAllScreens();
    document.getElementById('mainScreen').style.display = 'flex';
    
    // Сбрасываем иконку настроек
    document.getElementById('settingsIcon').classList.remove('active');
}
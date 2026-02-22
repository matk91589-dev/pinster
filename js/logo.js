// ============================================
// ФУНКЦИИ ДЛЯ ЛОГОТИПА
// ============================================

const Logo = {
    handleClick() {
        // Проверяем, не в поиске ли мы
        if (App.currentScreen === 'searchScreen') {
            App.showConfirm('Поиск ещё не завершён. Отменить?', (confirmed) => {
                if (confirmed) {
                    Search.cancel();
                }
            });
            return;
        }
        
        // Возвращаемся на главный экран
        App.showScreen('mainScreen', true);
        
        // Сбрасываем иконку настроек
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.classList.remove('active');
        }
        
        App.hapticFeedback('light');
    }
};

window.Logo = Logo;

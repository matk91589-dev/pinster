// ============================================
// ТЕСТОВЫЙ СВАЙП - ТОЛЬКО ДЛЯ ПРОВЕРКИ СТИЛЕЙ
// ============================================

const Swipe = {
    init() {
        console.log('🔥 Тестовый Swipe инициализирован');
        
        // Заполняем карточку тестовыми данными
        document.getElementById('swipePlayerId').textContent = '12345678';
        document.getElementById('swipePlayerNick').textContent = 'TestPlayer';
        document.getElementById('swipeRatingValue').textContent = '2500';
        document.getElementById('swipeRank').textContent = '2500 ELO';
        document.getElementById('swipeAge').textContent = '21 лет';
        document.getElementById('swipeStyle').textContent = 'Tryhard';
        document.getElementById('swipeSteamLink').textContent = 'https://steamcommunity.com/id/test';
        document.getElementById('swipeFaceitLink').textContent = 'https://www.faceit.com/players/test';
        document.getElementById('swipeComment').textContent = 'Ищу нормальных тиммейтов, играю вечером, микрофон есть, не токсик';
        
        // Показываем свайп-экран
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('swipeScreen').classList.add('active');
        
        // НИКАКИХ ИЗМЕНЕНИЙ СТИЛЕЙ!
    },
    
    // Пустые методы для совместимости
    startWithOpponent() {},
    acceptPlayer() {},
    rejectPlayer() {},
    destroy() {}
};

document.addEventListener('DOMContentLoaded', () => {
    window.Swipe = Swipe;
    console.log('✅ Тестовый Swipe загружен');
    
    // Автоматически показываем тестовую карточку
    setTimeout(() => Swipe.init(), 500);
});

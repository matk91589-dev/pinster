// ============================================
// СВАЙП - МИНИМАЛЬНАЯ ВЕРСИЯ БЕЗ ЛОМКИ СТИЛЕЙ
// ============================================

const Swipe = {
    card: null,
    isDragging: false,
    startX: 0,
    currentX: 0,
    SWIPE_THRESHOLD: 0.25,
    ANIMATION_DURATION: 250,
    MIN_THRESHOLD_PX: 150,
    
    currentPlayer: null,
    currentMatchId: null,
    mode: null,
    
    init(mode) {
        console.log('🔥 Минимальный Swipe инициализирован');
        this.card = document.getElementById('swipeCard');
        
        if (!this.card) {
            console.error('❌ Карточка не найдена');
            return;
        }
        
        this.setupEventListeners();
        
        // Заполняем тестовыми данными (можно убрать потом)
        document.getElementById('swipePlayerId').textContent = '12345678';
        document.getElementById('swipePlayerNick').textContent = 'TestPlayer';
        document.getElementById('swipeRatingValue').textContent = '2500';
        document.getElementById('swipeRank').textContent = '2500 ELO';
        document.getElementById('swipeAge').textContent = '21 лет';
        document.getElementById('swipeStyle').textContent = 'Tryhard';
        document.getElementById('swipeSteamLink').textContent = 'https://steamcommunity.com/id/test';
        document.getElementById('swipeFaceitLink').textContent = 'https://www.faceit.com/players/test';
        document.getElementById('swipeComment').textContent = 'Ищу нормальных тиммейтов, играю вечером, микрофон есть';
    },
    
    setupEventListeners() {
        this.card.addEventListener('pointerdown', this.onDragStart.bind(this));
        this.card.addEventListener('pointermove', this.onDragMove.bind(this));
        this.card.addEventListener('pointerup', this.onDragEnd.bind(this));
    },
    
    onDragStart(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.card.style.transition = 'none';
        e.preventDefault();
    },
    
    onDragMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        this.currentX = deltaX;
        
        // Только трансформ, НЕ ТРОГАЕМ width/height/padding/margin
        this.card.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 30}deg)`;
        e.preventDefault();
    },
    
    onDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const threshold = Math.min(window.innerWidth * this.SWIPE_THRESHOLD, this.MIN_THRESHOLD_PX);
        
        if (Math.abs(this.currentX) > threshold) {
            // Свайп завершен
            this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms ease`;
            if (this.currentX > 0) {
                this.card.style.transform = 'translateX(200%) rotate(12deg)';
            } else {
                this.card.style.transform = 'translateX(-200%) rotate(-12deg)';
            }
        } else {
            // Возвращаем
            this.card.style.transition = `transform ${this.ANIMATION_DURATION}ms ease`;
            this.card.style.transform = 'translateX(0) rotate(0)';
            this.currentX = 0;
        }
        
        setTimeout(() => {
            this.card.style.transition = '';
        }, this.ANIMATION_DURATION);
    },
    
    startWithOpponent(opponent, matchId) {
        this.currentPlayer = opponent;
        this.currentMatchId = matchId;
        this.init();
    },
    
    showConnectionMode() {},
    acceptPlayer() {},
    rejectPlayer() {},
    destroy() {}
};

document.addEventListener('DOMContentLoaded', () => {
    window.Swipe = Swipe;
    console.log('✅ Минимальный Swipe загружен');
    
    // Автоматически показываем карточку для теста
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('swipeScreen').classList.add('active');
        Swipe.init();
    }, 500);
});

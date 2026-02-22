// ============================================
// ДРУЗЬЯ (Telegram Mini App версия)
// ============================================

const Friends = {
    list: [],
    count: 0,
    
    init() {
        this.loadFriends();
    },
    
    loadFriends() {
        // Тестовые данные
        this.list = [
            { name: 'Player1', id: '1234' },
            { name: 'Player2', id: '5678' }
        ];
        this.count = this.list.length;
        this.render();
    },
    
    render() {
        const friendsList = document.getElementById('friendsList');
        const friendsCount = document.getElementById('friendsCount');
        
        if (friendsList) {
            friendsList.innerHTML = this.list.map(f => `
                <div class="friend-item">
                    <div class="friend-avatar">👤</div>
                    <div class="friend-info">
                        <div class="friend-name-row">
                            <span class="friend-name">${f.name}</span>
                            <span class="friend-id">${f.id}</span>
                        </div>
                        <div class="friend-steam">steamcommunity.com/id/${f.name.toLowerCase()}</div>
                    </div>
                </div>
            `).join('');
        }
        
        if (friendsCount) {
            const word = this.count === 1 ? 'друг' : 
                        this.count >= 2 && this.count <= 4 ? 'друга' : 'друзей';
            friendsCount.textContent = `${this.count} ${word}`;
        }
    },
    
    enterSearchMode() {
        App.showScreen('faceitScreen', false);
        App.hapticFeedback('light');
    }
};

window.Friends = Friends;

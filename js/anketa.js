// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН');

const Anketa = {
    currentTab: 'my',
    
    init() {
        console.log('🚀 Anketa.init()');
        this.loadMyAnketas();
    },
    
    switchTab(tab, element) {
        this.currentTab = tab;
        
        // Обновляем табы
        document.querySelectorAll('#anketaScreen .team-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');
        
        // Показываем нужный контент
        const myTab = document.getElementById('anketaMyTab');
        const likesTab = document.getElementById('anketaLikesTab');
        
        if (tab === 'my') {
            if (myTab) myTab.style.display = 'block';
            if (likesTab) likesTab.style.display = 'none';
            this.loadMyAnketas();
        } else {
            if (myTab) myTab.style.display = 'none';
            if (likesTab) likesTab.style.display = 'block';
            this.loadLikes();
        }
    },
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }
        
        // Загружаем анкеты через API профиля
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/profile/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(profile => {
            if (profile.status !== 'ok') {
                container.innerHTML = '<div class="anketa-empty">Заполните профиль чтобы создать анкету</div>';
                return;
            }
            
            // Показываем 4 слота для анкет
            const modes = [
                { id: 'faceit', name: 'FACEIT', class: 'faceit' },
                { id: 'premier', name: 'PREMIER', class: 'premier' },
                { id: 'prime', name: 'PRIME', class: 'prime' },
                { id: 'public', name: 'PUBLIC', class: 'public' }
            ];
            
            let html = '';
            modes.forEach(m => {
                html += `
                <div class="anketa-card" onclick="App.showScreen('${m.id}Screen', true)" style="cursor:pointer;">
                    <div class="anketa-card-header">
                        <span class="anketa-card-mode ${m.class}">${m.name}</span>
                        <span class="anketa-card-rank">Создать / Обновить</span>
                    </div>
                    <div class="anketa-card-about">Нажмите чтобы ввести ранг и данные для этого режима</div>
                </div>`;
            });
            
            container.innerHTML = html;
        })
        .catch(() => {
            container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>';
        });
    },
    
    // 🔥 ЗАГРУЗКА ЛАЙКОВ
    loadLikes() {
        const container = document.getElementById('anketaLikesTab');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#8E97A6;">Загрузка...</div>';
        
        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/likes/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status !== 'ok') {
                container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>';
                return;
            }
            
            let html = '';
            
            // Взаимные мэтчи
            if (data.mutual && data.mutual.length > 0) {
                html += '<div style="font-size:13px;font-weight:600;color:#4CAF50;padding:8px 4px;">❤️ Взаимные мэтчи</div>';
                data.mutual.forEach(m => {
                    html += `
                    <div class="like-item">
                        <div class="like-item-avatar">${(m.nick||'?')[0].toUpperCase()}</div>
                        <div class="like-item-info">
                            <div class="like-item-nick">${m.nick||'Без имени'}</div>
                            <div class="like-item-mode">${m.mode||''} • ${m.rank||''}</div>
                        </div>
                        <button class="like-item-action write">Написать</button>
                    </div>`;
                });
            }
            
            // Тебя лайкнули
            if (data.liked_me && data.liked_me.length > 0) {
                html += '<div style="font-size:13px;font-weight:600;color:#FF5500;padding:8px 4px;">👍 Тебя лайкнули</div>';
                data.liked_me.forEach(m => {
                    html += `
                    <div class="like-item">
                        <div class="like-item-avatar">${(m.nick||'?')[0].toUpperCase()}</div>
                        <div class="like-item-info">
                            <div class="like-item-nick">${m.nick||'Без имени'}</div>
                            <div class="like-item-mode">${m.mode||''} • ${m.rank||''}</div>
                        </div>
                        <button class="like-item-action like-back" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️ Лайкнуть</button>
                    </div>`;
                });
            }
            
            // Ты лайкнул
            if (data.i_liked && data.i_liked.length > 0) {
                html += '<div style="font-size:13px;font-weight:600;color:#8E97A6;padding:8px 4px;">💔 Ты лайкнул (ждут ответа)</div>';
                data.i_liked.forEach(m => {
                    html += `
                    <div class="like-item">
                        <div class="like-item-avatar">${(m.nick||'?')[0].toUpperCase()}</div>
                        <div class="like-item-info">
                            <div class="like-item-nick">${m.nick||'Без имени'}</div>
                            <div class="like-item-mode">${m.mode||''} • ${m.rank||''}</div>
                        </div>
                    </div>`;
                });
            }
            
            if (!html) {
                html = '<div class="anketa-empty">Пока нет лайков<br><br>Смотрите анкеты в любом режиме и лайкайте тиммейтов!</div>';
            }
            
            container.innerHTML = html;
        })
        .catch(() => {
            container.innerHTML = '<div class="anketa-empty">Ошибка загрузки</div>';
        });
    },
    
    // 🔥 ЛАЙКНУТЬ В ОТВЕТ
    likeBack(likedPlayerId) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id: String(telegram_id),
                liked_player_id: likedPlayerId
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'match') {
                alert('❤️ Взаимный мэтч! Проверь Telegram — бот прислал контакт!');
            }
            this.loadLikes(); // Обновляем список
        })
        .catch(() => {});
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('anketaScreen')) {
        Anketa.init();
    }
});

// Также инициализируем при переключении на экран анкет
const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(screenId, updateNav) {
        origShow.call(window.App, screenId, updateNav);
        if (screenId === 'anketaScreen') {
            setTimeout(() => Anketa.init(), 200);
        }
    };
}

window.Anketa = Anketa;

// ============================================
// АНКЕТЫ + ЛАЙКИ - Экран управления v2.7
// ============================================

console.log('🔥 ANKETA.JS ЗАГРУЖЕН (v2.7)');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    init() {
        console.log('🚀 Anketa.init() v2.7');
        this.loadMyAnketas();
    },

    switchTab(tab, element) {
        this.currentTab = tab;
        document.querySelectorAll('#anketaScreen .team-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');
        document.getElementById('anketaMyTab').style.display = tab === 'my' ? 'block' : 'none';
        document.getElementById('anketaLikesTab').style.display = tab === 'likes' ? 'block' : 'none';
        if (tab === 'my') this.loadMyAnketas();
        else this.loadLikes();
    },

    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },

    // 🔥 ЗАГРУЗКА МОИХ АНКЕТ
    loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        container.innerHTML = '<div class="anketa-loading">Загрузка...</div>';

        const telegram_id = this.getTelegramId();
        if (!telegram_id) {
            container.innerHTML = '<div class="anketa-empty">Ошибка авторизации</div>';
            return;
        }

        const modes = [
            { id: 'faceit', name: 'FACEIT', color: '#4CAF50' },
            { id: 'premier', name: 'PREMIER', color: '#FF5500' },
            { id: 'prime', name: 'PRIME', color: '#0096FF' },
            { id: 'public', name: 'PUBLIC', color: '#FFD600' }
        ];

        fetch(`${this.BACKEND_URL}/api/anketa/list?telegram_id=${telegram_id}`)
            .then(r => r.json())
            .then(anketaData => {
                const anketaMap = {};
                if (anketaData && anketaData.anketas) {
                    anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
                }

                const sorted = [...modes].sort((a, b) => (anketaMap[b.id] ? 1 : 0) - (anketaMap[a.id] ? 1 : 0));

                let html = '<div class="anketa-scroll">';
                sorted.forEach((m, i) => {
                    const a = anketaMap[m.id];
                    html += this.buildSlot(m, a);
                    if (i < sorted.length - 1) html += '<div class="anketa-divider"></div>';
                });
                html += '</div>';
                container.innerHTML = html;
            })
            .catch(() => {
                let html = '<div class="anketa-scroll">';
                modes.forEach((m, i) => {
                    html += this.buildSlot(m, null);
                    if (i < modes.length - 1) html += '<div class="anketa-divider"></div>';
                });
                html += '</div>';
                container.innerHTML = html;
            });
    },

    buildSlot(mode, anketa) {
        if (anketa) {
            return `
            <div class="anketa-slot filled">
                <div class="anketa-slot-badge" style="background:${mode.color}20;color:${mode.color};">${mode.name}</div>
                <div class="anketa-slot-body">
                    <div class="anketa-slot-rank">${anketa.rank || '—'}</div>
                    <div class="anketa-slot-meta">
                        ${anketa.age ? `<span>${anketa.age} лет</span>` : ''}
                        ${anketa.about ? `<span class="anketa-slot-about">${anketa.about.substring(0, 50)}${anketa.about.length > 50 ? '…' : ''}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="anketa-slot-actions">
                <button class="anketa-btn edit" onclick="Anketa.editAnketa('${mode.id}')">Редактировать</button>
                <button class="anketa-btn delete" onclick="Anketa.deleteAnketa('${mode.id}')">Удалить</button>
            </div>`;
        }
        return `
        <div class="anketa-slot empty">
            <div class="anketa-slot-badge" style="background:${mode.color}20;color:${mode.color};">${mode.name}</div>
            <div class="anketa-slot-question">
                <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
                    <path d="M32 48V50" stroke="${mode.color}" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>
                    <path d="M26 24.5C26 19.8 29.2 17 33 17C36.8 17 40 19.6 40 23.8C40 28 36.5 29.8 34.5 31.2C33.2 32.1 32.6 33 32.6 35.2"
                        stroke="${mode.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
                    <circle cx="32" cy="53" r="2.2" fill="${mode.color}" opacity="0.7"/>
                </svg>
            </div>
        </div>
        <div class="anketa-slot-actions single">
            <button class="anketa-btn create" onclick="Anketa.goToMode('${mode.id}')">Создать анкету</button>
        </div>`;
    },

    goToMode(modeId) {
        App.showScreen(modeId + 'Screen', true);
        setTimeout(() => {
            const btn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (btn) {
                btn.textContent = 'Создать анкету';
                btn.onclick = () => {
                    let v = '';
                    if (modeId === 'faceit') v = document.getElementById('faceitELOInput')?.value || '';
                    else if (modeId === 'premier') v = document.getElementById('premierRatingInput')?.value || '';
                    else if (modeId === 'prime') v = document.getElementById('primeRankSelect')?.value || '';
                    else v = document.getElementById('publicRankSelect')?.value || '';
                    Search.startBrowse(modeId.toUpperCase(), v);
                    setTimeout(() => App.showCustomPopup('✅ Анкета создана!', 'Смотреть анкеты других игроков?',
                        () => App.showScreen('swipeScreen', false), () => App.showScreen('mainScreen', true), 'Смотреть', 'На главную', false), 500);
                };
            }
        }, 300);
    },

    editAnketa(modeId) { this.goToMode(modeId); },

    deleteAnketa(modeId) {
        App.showCustomPopup('Удалить анкету?', `Анкета ${modeId.toUpperCase()} будет удалена.`,
            () => fetch(`${this.BACKEND_URL}/api/anketa/delete`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({telegram_id:String(this.getTelegramId()), mode:modeId})
            }).then(r=>r.json()).then(d=>{if(d.status==='ok')this.loadMyAnketas();}).catch(()=>{}),
        null,'Удалить','Отмена',true);
    },

    loadLikes() {
        const c = document.getElementById('anketaLikesTab'); if(!c)return;
        c.innerHTML = '<div class="anketa-loading">Загрузка...</div>';
        const tid = this.getTelegramId(); if(!tid){c.innerHTML='<div class="anketa-empty">Ошибка</div>';return;}
        fetch(`${this.BACKEND_URL}/api/likes/list`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(tid)})})
        .then(r=>r.json()).then(d=>{
            if(d.status!=='ok'){c.innerHTML='<div class="anketa-empty">Ошибка</div>';return;}
            let h='';
            if(d.mutual?.length){h+=`<div class="likes-section-title"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="icon-match-pulse"><defs><filter id="gm"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M20.8 4.6c-1.7-1.7-4.4-1.7-6.1 0L12 7.3l-2.7-2.7c-1.7-1.7-4.4-1.7-6.1 0-1.7 1.7-1.7 4.4 0 6.1L12 21l8.8-9.9c1.7-1.7 1.7-4.4 0-6.1z" stroke="#FF5500" stroke-width="1.8" fill="none" filter="url(#gm)"/></svg>Взаимные мэтчи</div>`;d.mutual.forEach(m=>h+=this.buildLikeItem(m,'mutual'));}
            if(d.liked_me?.length){h+=`<div class="likes-section-title"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="icon-eye-pulse"><defs><filter id="ge"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="#FF5500" stroke-width="1.8" fill="none" filter="url(#ge)"/><circle cx="12" cy="12" r="3" stroke="#FF5500" stroke-width="1.8" fill="none"/></svg>Тебя лайкнули</div>`;d.liked_me.forEach(m=>h+=this.buildLikeItem(m,'liked_me'));}
            if(d.i_liked?.length){h+=`<div class="likes-section-title"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 22V10H3v12h4z" stroke="#8E97A6" stroke-width="1.8"/><path d="M7 10l5-7c.6-.8 1.8-1 2.6-.4.8.6 1 1.8.4 2.6L13 10h6c1.1 0 2 .9 2 2v1c0 .3-.1.7-.2 1l-2.2 7c-.3.7-1 1.2-1.8 1.2H7" stroke="#8E97A6" stroke-width="1.8" fill="none"/></svg>Ты лайкнул</div>`;d.i_liked.forEach(m=>h+=this.buildLikeItem(m,'i_liked'));}
            c.innerHTML = h || '<div class="anketa-empty">Пока нет лайков</div>';
        }).catch(()=>{c.innerHTML='<div class="anketa-empty">Ошибка</div>';});
    },

    buildLikeItem(m, type) {
        const av = m.avatar ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : (m.nick||'?')[0].toUpperCase();
        let btn = '';
        if(type==='mutual') btn = '<div class="friend-arrow">→</div>';
        else if(type==='liked_me') btn = `<button class="like-item-action like-back" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️</button>`;
        else btn = '<div class="friend-arrow" style="opacity:0.3;">→</div>';
        return `<div class="like-item"><div class="like-item-avatar">${av}</div><div class="like-item-info"><div class="like-item-nick">${m.nick||'Без имени'}</div><div class="like-item-mode">${m.mode||''} • ${m.rank||''}</div></div>${btn}</div>`;
    },

    likeBack(likedPlayerId) {
        fetch(`${this.BACKEND_URL}/api/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(this.getTelegramId()),liked_player_id:likedPlayerId})})
        .then(r=>r.json()).then(d=>{if(d.status==='match')App.showCustomPopup('❤️ Взаимный мэтч!','Проверь Telegram — бот прислал контакт!',null,null,'OK','',false);this.loadLikes();}).catch(()=>{});
    }
};

document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('anketaScreen'))Anketa.init();});
const origShow=window.App?.showScreen;
if(origShow){window.App.showScreen=function(s,d){origShow.call(window.App,s,d);if(s==='anketaScreen')setTimeout(()=>Anketa.init(),200);};}
window.Anketa=Anketa;

// ============================================
// КАРТОЧКИ + ЛАЙКИ - v15.3 PREMIUM FINAL
// ============================================

console.log('🔥 ANKETA.JS v15.3 PREMIUM FINAL');

const Anketa = {
    currentTab: 'my',
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    RIBBON_COLORS: {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    },

    init() {
        console.log('🚀 Anketa.init() v15.3');
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
        const screen = document.getElementById('anketaScreen');
        if (screen) {
            screen.style.height = '100dvh';
            screen.style.display = 'flex';
            screen.style.flexDirection = 'column';
            screen.style.overflow = 'hidden';
        }
        this.injectStyles();
        this.loadMyAnketas();
    },

    injectStyles() {
        if (document.getElementById('anketa-v153-styles')) return;
        const style = document.createElement('style');
        style.id = 'anketa-v153-styles';
        style.textContent = `
            :root { --top-bar-height: 56px; --bottom-nav-height: 76px; }
            
            /* 🔥 СКРОЛЛ — НЕ УХОДИТ ПОД НАВИГАЦИЮ */
            .anketa-scroll {
                position: relative; flex: 1; min-height: 0;
                overflow-y: auto; -webkit-overflow-scrolling: touch;
                padding: 0 16px;
                padding-bottom: 16px;
                margin-bottom: 0;
                display: flex; flex-direction: column; gap: 14px;
                overscroll-behavior: contain;
                height: 100%;
            }
            .anketa-loading, .anketa-empty-text { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.35); font-size: 14px; }
            .anketa-divider-top { height: 8px; margin: 0; flex-shrink: 0; }
            .anketa-divider { height: 0; margin: 0; flex-shrink: 0; }
            
            /* 🔥 КАРТОЧКА */
            .anketa-card {
                position: relative; width: 100%;
                aspect-ratio: 16 / 20; max-height: 460px;
                border-radius: 18px; overflow: hidden;
                box-shadow: 0 20px 50px rgba(0,0,0,0.48), 0 8px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.06);
                flex-shrink: 0;
                animation: cardIn 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
                background-color: #0a0a0f;
                background-size: cover; background-position: center 20%; background-repeat: no-repeat;
                display: flex; flex-direction: column; justify-content: flex-end;
                padding: 16px;
                will-change: transform; transform: translateZ(0); backface-visibility: hidden;
                transform-style: preserve-3d;
                transition: transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease;
            }
            .anketa-card:first-child { margin-top: 8px; }
            
            .anketa-card .card-glint {
                position: absolute; top: 0; left: -60%; width: 60%; height: 100%; z-index: 10;
                background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.05) 60%, transparent 100%);
                transform: skewX(-18deg); pointer-events: none; opacity: 0;
            }
            .anketa-card.glinting .card-glint {
                left: 120%; opacity: 1;
                transition: left 0.55s cubic-bezier(0.22,0.61,0.36,1), opacity 0.05s;
            }
            .anketa-card:active { transform: scale(0.965); transition: transform 0.12s ease; }
            
            .anketa-card::before {
                content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
                background: linear-gradient(155deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 18%, transparent 36%, transparent 100%);
            }
            
            @media (hover: hover) {
                .anketa-card:hover { background-position: center 18%; }
            }
            
            .anketa-card.filled { background-size: cover; background-position: center 20%; background-repeat: no-repeat; }
            
            /* 🔥 ГРАДИЕНТ 60% — ЧЕРНЫЙ, ТЕКСТ ВИДЕН */
            .anketa-card.filled::after {
                content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60%; z-index: 1; pointer-events: none;
                background: linear-gradient(to top, rgba(0,0,0,0.99) 0%, rgba(0,0,0,0.96) 15%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.50) 70%, rgba(0,0,0,0.10) 100%);
            }
            .anketa-card.filled.long-about::after {
                height: 65%;
                background: linear-gradient(to top, rgba(0,0,0,0.99) 0%, rgba(0,0,0,0.97) 12%, rgba(0,0,0,0.88) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.15) 100%);
            }
            
            .anketa-card.empty {
                background: linear-gradient(150deg, #16161c 0%, #131319 35%, #111117 65%, #14141a 100%);
                border: 1px solid rgba(255,255,255,0.04);
                justify-content: center; align-items: center;
            }
            
            .anketa-text-block {
                position: relative; z-index: 2;
                display: flex; flex-direction: column; align-items: flex-start; text-align: left;
                gap: 3px; margin-bottom: 62px; width: 100%;
            }
            .anketa-id { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #FF5500; text-transform: uppercase; }
            
            /* 🔥 ТЕКСТ ЖИРНЕЕ */
            .anketa-nick {
                font-size: 28px; font-weight: 900; color: #FFFFFF;
                text-shadow: 0 2px 14px rgba(0,0,0,0.7), 0 8px 28px rgba(0,0,0,0.6);
                letter-spacing: -0.3px; line-height: 1.2; margin-top: 2px;
            }
            
            .anketa-stats-row {
                font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.9);
                display: flex; align-items: center; gap: 8px;
                white-space: nowrap; margin-top: 4px; flex-wrap: wrap;
                text-shadow: 0 1px 4px rgba(0,0,0,0.6);
            }
            .anketa-stats-sep { color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 700; }
            
            .anketa-about {
                font-size: 14px; color: rgba(255,255,255,0.85);
                line-height: 1.5; max-width: 100%; margin-top: 8px; font-weight: 600;
                text-shadow: 0 1px 4px rgba(0,0,0,0.6);
                word-wrap: break-word; overflow-wrap: break-word;
            }
            
            /* 🔥 PREMIUM CTA */
            .anketa-profile-btn {
                position: absolute; left: 12px; right: 12px; bottom: 12px;
                z-index: 5; height: 48px; border-radius: 14px;
                border: 1px solid rgba(255,255,255,0.08);
                background: linear-gradient(180deg, rgba(255,85,0,0.96) 0%, rgba(255,115,25,0.96) 100%);
                color: white; font-size: 14px; font-weight: 700; letter-spacing: 0.2px;
                cursor: pointer;
                box-shadow: 0 10px 28px rgba(255,85,0,0.24), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -2px 0 rgba(0,0,0,0.18);
                transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
            }
            .anketa-profile-btn:active { transform: scale(0.97); box-shadow: 0 6px 16px rgba(255,85,0,0.18); filter: brightness(0.96); }
            
            .anketa-card-controls {
                position: absolute; top: 12px; right: 12px; z-index: 6;
                display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
            }
            .anketa-control-link {
                font-size: 12px; font-weight: 600; cursor: pointer;
                padding: 5px 12px; border-radius: 7px;
                background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.04);
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                line-height: 1.2;
            }
            .anketa-control-link.edit { color: rgba(255,255,255,0.82); }
            .anketa-control-link.delete { color: rgba(255,100,100,0.80); }
            
            .anketa-card-actions { position: absolute; bottom: 12px; left: 12px; right: 12px; display: flex; gap: 8px; z-index: 4; }
            .anketa-card-actions.single { justify-content: center; }
            .anketa-card-btn {
                flex: 1; height: 42px; border-radius: 11px; border: none;
                font-size: 13px; font-weight: 600; cursor: pointer;
                transition: all 0.2s ease; text-align: center;
                display: flex; align-items: center; justify-content: center;
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.25);
            }
            .anketa-card-btn.create { background: linear-gradient(135deg, #FF5500, #FF6B20); color: #fff; }
            
            .anketa-ribbon {
                position: absolute; top: 0; left: 0; z-index: 6;
                padding: 6px 16px 5px 12px;
                font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
                background: var(--ribbon-bg, rgba(18,18,24,0.92));
                color: var(--ribbon-color, #FF5500);
                clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%);
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                border-bottom: 1px solid var(--ribbon-color, #FF5500);
            }
            
            @keyframes cardIn {
                0% { opacity: 0; transform: translateY(16px) scale(0.985); filter: blur(2px); }
                0.01% { opacity: 0; }
                100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
            
            .anketa-likes-section { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); padding: 16px 16px 8px; }
            .anketa-like-item { display: flex; align-items: center; padding: 12px 16px; gap: 10px; border-radius: 12px; margin: 2px 8px; }
            .anketa-like-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: #fff; overflow: hidden; flex-shrink: 0; }
            .anketa-like-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .anketa-like-info { flex: 1; }
            .anketa-like-nick { font-size: 14px; font-weight: 600; color: #fff; }
            .anketa-like-mode { font-size: 12px; color: rgba(255,255,255,0.45); }
            .anketa-like-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,85,0,0.15); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .anketa-like-arrow { font-size: 20px; opacity: 0.35; }
        `;
        document.head.appendChild(style);
    },

    triggerGlint(card) {
        card.classList.add('glinting');
        setTimeout(() => card.classList.remove('glinting'), 550);
    },

    applyEffects(card) {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = (x / rect.width - 0.5) * 5;
            const rotateX = -(y / rect.height - 0.5) * 5;
            card.style.transform = `translate3d(0,-2px,0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('pointerleave', () => {
            card.style.transition = 'transform .35s cubic-bezier(.22,.61,.36,1)';
            card.style.transform = 'translate3d(0,0,0) rotateX(0) rotateY(0)';
        });
        card.addEventListener('pointerdown', () => this.triggerGlint(card));
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

    async loadMyAnketas() {
        const container = document.getElementById('anketaMyTab');
        if (!container) return;
        container.innerHTML = '<div class="anketa-loading">Загрузка...</div>';
        const telegram_id = this.getTelegramId();
        if (!telegram_id) { container.innerHTML = '<div class="anketa-empty-text">Ошибка авторизации</div>'; return; }

        const modes = [
            { id: 'faceit', name: 'FACEIT' },
            { id: 'premier', name: 'PREMIER' },
            { id: 'prime', name: 'PRIME' },
            { id: 'public', name: 'PUBLIC' }
        ];

        try {
            const [profileRes, avatarRes, anketaRes, userRes] = await Promise.all([
                fetch(`${this.BACKEND_URL}/api/profile/get`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({telegram_id:String(telegram_id)}) }),
                fetch(`${this.BACKEND_URL}/api/profile/avatar`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({telegram_id:String(telegram_id)}) }),
                fetch(`${this.BACKEND_URL}/api/anketa/list`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({telegram_id:String(telegram_id)}) }),
                fetch(`${this.BACKEND_URL}/api/user/init`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({telegram_id:String(telegram_id)}) })
            ]);
            const profileData = await profileRes.json();
            try { profileData.avatar = (await avatarRes.json()).avatar || null; } catch(e) {}
            try { profileData.player_id = (await userRes.json()).player_id || ''; } catch(e) {}
            const anketaData = await anketaRes.json();

            const anketaMap = {};
            if (anketaData?.anketas) anketaData.anketas.forEach(a => { anketaMap[a.mode] = a; });
            const sorted = [...modes].sort((a,b) => (anketaMap[b.id]?1:0) - (anketaMap[a.id]?1:0)).slice(0,4);

            let html = '<div class="anketa-scroll"><div class="anketa-divider-top"></div>';
            sorted.forEach((m, i) => {
                html += this.buildSlot(m, anketaMap[m.id], profileData);
                if (i < sorted.length - 1) html += '<div class="anketa-divider"></div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.anketa-card').forEach(card => this.applyEffects(card));

        } catch (err) {
            let html = '<div class="anketa-scroll"><div class="anketa-divider-top"></div>';
            modes.slice(0,4).forEach((m,i) => { html += this.buildSlot(m, null, {}); if (i<3) html += '<div class="anketa-divider"></div>'; });
            html += '</div>'; container.innerHTML = html;
            container.querySelectorAll('.anketa-card').forEach(card => this.applyEffects(card));
        }
    },

    buildSlot(mode, anketa, profileData = {}) {
        const rc = this.RIBBON_COLORS[mode.id] || this.RIBBON_COLORS.faceit;
        const ribbonHTML = `<div class="anketa-ribbon" style="--ribbon-bg:${rc.bg};--ribbon-color:${rc.color};">${mode.name}</div>`;

        if (anketa) {
            const cardStyle = profileData.avatar ? `background-image: url(${profileData.avatar});` : '';
            const nick = profileData.nick || 'Player';
            const playerId = profileData.player_id || '';
            
            const statsParts = [];
            statsParts.push(`<span>${mode.id==='premier'?'Premier':mode.name}</span>`);
            if (anketa.rank) statsParts.push(`<span>${anketa.rank}${mode.id==='faceit'?' elo':mode.id==='premier'?' rating':''}</span>`);
            if (anketa.age) statsParts.push(`<span>${anketa.age} y.o.</span>`);
            
            const aboutText = anketa.about?.trim() || '';
            const aboutHTML = aboutText
                ? `<div class="anketa-about">${aboutText.substring(0, 100)}${aboutText.length > 100 ? '…' : ''}</div>`
                : '';
            
            const longClass = aboutText.length > 50 ? ' long-about' : '';
            
            const isFaceitPremier = mode.id==='faceit'||mode.id==='premier';
            const buttonText = isFaceitPremier ? 'Открыть Faceit игрока' : 'Открыть Steam игрока';
            const profileLink = isFaceitPremier ? (profileData.faceit_link||anketa.link||'#') : (profileData.steam_link||anketa.link||'#');

            return `
            <div class="anketa-card filled${longClass}" style="${cardStyle}">
                <div class="card-glint"></div>
                ${ribbonHTML}
                <div class="anketa-card-controls">
                    <span class="anketa-control-link edit" onclick="Anketa.editAnketa('${mode.id}')">Изменить</span>
                    <span class="anketa-control-link delete" onclick="Anketa.deleteAnketa('${mode.id}')">Удалить</span>
                </div>
                <div class="anketa-text-block">
                    ${playerId?`<div class="anketa-id">ID ${playerId}</div>`:''}
                    <div class="anketa-nick">${nick}</div>
                    <div class="anketa-stats-row">${statsParts.join(' <span class="anketa-stats-sep">•</span> ')}</div>
                    ${aboutHTML}
                </div>
                <button class="anketa-profile-btn" onclick="Anketa.openProfileLink('${profileLink.replace(/'/g,"\\'")}','${mode.id}')">
                    ${buttonText}
                </button>
            </div>`;
        }
        return `<div class="anketa-card empty"><div class="card-glint"></div>${ribbonHTML}<div class="anketa-card-actions single"><button class="anketa-card-btn create" onclick="Anketa.goToMode('${mode.id}')">Создать карточку</button></div></div>`;
    },

    openProfileLink(link, modeId) {
        if (!link||link==='#') { App?.showCustomPopup?.('Ссылка не указана','Добавьте ссылку в настройках',null,null,'OK','',false); return; }
        (window.Telegram?.WebApp?.openLink||window.open)(link, '_blank');
    },

    // 🔥 РЕДАКТИРОВАНИЕ — ЗАПОЛНЯЕТ ДАННЫЕ
    goToMode(modeId) {
        App.showScreen(modeId + 'Screen', true);
        setTimeout(() => {
            const btn = document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if (btn) {
                btn.textContent = 'Обновить карточку';
                btn.onclick = () => App.createCard(modeId);
            }
            // 🔥 Заполняем данные из кэша или API
            this.fillEditForm(modeId);
        }, 300);
    },

    fillEditForm(modeId) {
        // Сначала пробуем из загруженных данных
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return;

        fetch(`${this.BACKEND_URL}/api/anketa/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: String(telegram_id) })
        })
        .then(r => r.json())
        .then(data => {
            const cards = data.anketas || [];
            const card = cards.find(c => c.mode === modeId);
            if (!card) return;

            // Заполняем поля
            if (modeId === 'faceit') {
                const elo = document.getElementById('faceitELOInput');
                const age = document.getElementById('faceitAge');
                const link = document.getElementById('faceitLinkInput');
                const about = document.getElementById('faceitAbout');
                if (elo) elo.value = card.rank || '';
                if (age) age.value = card.age || '';
                if (link) link.value = card.link || '';
                if (about) about.value = card.about || '';
            } else if (modeId === 'premier') {
                const rating = document.getElementById('premierRatingInput');
                const age = document.getElementById('premierAge');
                const link = document.getElementById('premierLinkInput');
                const about = document.getElementById('premierAbout');
                if (rating) rating.value = card.rank || '';
                if (age) age.value = card.age || '';
                if (link) link.value = card.link || '';
                if (about) about.value = card.about || '';
            } else if (modeId === 'prime') {
                const rank = document.getElementById('primeRankSelect');
                const age = document.getElementById('primeAge');
                const link = document.getElementById('primeLinkInput');
                const about = document.getElementById('primeAbout');
                if (rank) rank.value = card.rank || '';
                if (age) age.value = card.age || '';
                if (link) link.value = card.link || '';
                if (about) about.value = card.about || '';
            } else if (modeId === 'public') {
                const rank = document.getElementById('publicRankSelect');
                const age = document.getElementById('publicAge');
                const link = document.getElementById('publicLinkInput');
                const about = document.getElementById('publicAbout');
                if (rank) rank.value = card.rank || '';
                if (age) age.value = card.age || '';
                if (link) link.value = card.link || '';
                if (about) about.value = card.about || '';
            }
        })
        .catch(() => {});
    },

    editAnketa(m) { this.goToMode(m); },
    deleteAnketa(m) { App.showCustomPopup('Удалить карточку?',`Карточка ${m.toUpperCase()} будет удалена.`,()=>{fetch(`${this.BACKEND_URL}/api/anketa/delete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(this.getTelegramId()),mode:m})}).then(r=>r.json()).then(d=>{if(d.status==='ok')this.loadMyAnketas();});},null,'Удалить','Отмена',true); },
    loadLikes() {
        const c=document.getElementById('anketaLikesTab');if(!c)return;c.innerHTML='<div class="anketa-loading">Загрузка...</div>';
        const tid=this.getTelegramId();if(!tid){c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';return;}
        fetch(`${this.BACKEND_URL}/api/likes/list`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(tid)})})
        .then(r=>r.json()).then(d=>{if(d.status!=='ok'){c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';return;}let h='';if(d.mutual?.length){h+='<div class="anketa-likes-section">❤️ Взаимные мэтчи</div>';d.mutual.forEach(m=>h+=this.buildLikeItem(m,'mutual'));}if(d.liked_me?.length){h+='<div class="anketa-likes-section">👀 Тебя лайкнули</div>';d.liked_me.forEach(m=>h+=this.buildLikeItem(m,'liked_me'));}if(d.i_liked?.length){h+='<div class="anketa-likes-section">👍 Ты лайкнул</div>';d.i_liked.forEach(m=>h+=this.buildLikeItem(m,'i_liked'));}c.innerHTML=h||'<div class="anketa-empty-text">Пока нет лайков</div>';}).catch(()=>{c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';});
    },
    buildLikeItem(m,t){const av=m.avatar?`<img src="${m.avatar}">`:(m.nick||'?')[0].toUpperCase();let btn='';if(t==='mutual')btn='<span class="anketa-like-arrow">→</span>';else if(t==='liked_me')btn=`<button class="anketa-like-btn" onclick="Anketa.likeBack('${m.liker_player_id}')">❤️</button>`;else btn='<span class="anketa-like-arrow">→</span>';return`<div class="anketa-like-item"><div class="anketa-like-avatar">${av}</div><div class="anketa-like-info"><div class="anketa-like-nick">${m.nick||'Без имени'}</div><div class="anketa-like-mode">${m.mode||''} • ${m.rank||''}</div></div>${btn}</div>`;},
    likeBack(lid){fetch(`${this.BACKEND_URL}/api/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(this.getTelegramId()),liked_player_id:lid})}).then(r=>r.json()).then(d=>{if(d.status==='match')App.showCustomPopup('❤️ Взаимный мэтч!','Проверь Telegram — бот прислал контакт!',null,null,'OK','',false);this.loadLikes();});}
};

document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('anketaScreen'))Anketa.init();});
const origShow=window.App?.showScreen;
if(origShow){window.App.showScreen=function(s,d){origShow.call(window.App,s,d);if(s==='anketaScreen')setTimeout(()=>Anketa.init(),200);};}
window.Anketa=Anketa;
console.log('✅ Anketa v15.3 PREMIUM FINAL готов');

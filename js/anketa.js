// ============================================
// КАРТОЧКИ + ЛАЙКИ - v18.0 SVG NATIVE
// ============================================

console.log('🔥 ANKETA.JS v18.0 SVG NATIVE');

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
        console.log('🚀 Anketa.init() v18.0');
        const screen = document.getElementById('anketaScreen');
        if (screen) {
            screen.style.display = 'flex';
            screen.style.flexDirection = 'column';
        }
        this.injectStyles();
        this.loadMyAnketas();
    },

    injectStyles() {
        if (document.getElementById('anketa-v18-styles')) return;
        const style = document.createElement('style');
        style.id = 'anketa-v18-styles';
        style.textContent = `
            #anketaMyTab, #anketaLikesTab {
                height: 100%;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
                touch-action: pan-y;
                overscroll-behavior: contain;
                scroll-behavior: auto;
            }
            
            #anketaContent {
                flex: 1;
                min-height: 0;
                overflow: visible;
            }
        
            .anketa-scroll {
                display: flex;
                flex-direction: column;
                gap: 0;
                padding: 0 16px 24px;
                min-height: 0;
            }
            
            .anketa-loading, .anketa-empty-text { 
                text-align: center; padding: 40px 20px; 
                color: rgba(255,255,255,0.35); font-size: 14px; 
            }
            .anketa-divider-top { height: 8px; margin: 0; flex-shrink: 0; }
            
            .anketa-divider {
                height: 1px;
                margin: 16px 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                flex-shrink: 0;
                border: none;
            }
            
            .anketa-card {
                position: relative; width: 100%;
                aspect-ratio: 16 / 20; max-height: 460px;
                border-radius: 18px; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.06);
                flex-shrink: 0;
                opacity: 1;
                background-color: #0a0a0f;
                background-size: cover; background-position: center 20%; background-repeat: no-repeat;
                display: flex; flex-direction: column; justify-content: flex-end;
                padding: 16px;
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
                box-shadow: 0 8px 20px rgba(0,0,0,0.35);
            }
            .anketa-card:first-child { margin-top: 8px; }
            
            .anketa-card .card-glint {
                position: absolute; top: 0; left: -60%; width: 60%; height: 100%; z-index: 10;
                background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.06) 60%, transparent 100%);
                transform: skewX(-18deg); pointer-events: none; opacity: 0;
                transition: left 0.5s cubic-bezier(0.22,0.61,0.36,1), opacity 0.05s;
            }
            .anketa-card.glinting .card-glint { left: 120%; opacity: 1; }
            
            .anketa-card.filled { background-size: cover; background-position: center 20%; background-repeat: no-repeat; }
            
            .anketa-card.filled::after {
                content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 50%; z-index: 1; pointer-events: none;
                background: linear-gradient(to top, rgba(0,0,0,0.99) 0%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.45) 75%, transparent 100%);
            }
            .anketa-card.filled.long-about::after {
                height: 55%;
                background: linear-gradient(to top, rgba(0,0,0,0.99) 0%, rgba(0,0,0,0.96) 12%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.50) 72%, transparent 100%);
            }
            
            .anketa-card.empty {
                background: linear-gradient(150deg, #16161c 0%, #131319 35%, #111117 65%, #14141a 100%);
                border: 1px solid rgba(255,255,255,0.04);
                justify-content: center; align-items: center;
            }
            
            .anketa-text-block {
                position: relative; z-index: 2;
                display: flex; flex-direction: column; align-items: flex-start; text-align: left;
                gap: 3px; margin-bottom: 56px; width: 100%;
            }
            .anketa-id { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #FF5500; text-transform: uppercase; }
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
            
            .anketa-profile-btn {
                position: absolute; left: 12px; right: 12px; bottom: 12px;
                z-index: 5; height: 42px; border-radius: 11px; border: none;
                background: linear-gradient(135deg, #FF5500 0%, #FF6B20 100%);
                color: white; font-size: 13px; font-weight: 600; letter-spacing: 0.2px;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center; gap: 6px;
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.25);
                pointer-events: auto;
                transition: transform 0.15s ease;
            }
            .anketa-profile-btn:active { transform: scale(0.97); }
            .anketa-profile-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
            
            .anketa-card-controls {
                position: absolute; top: 12px; right: 12px; z-index: 10;
                display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
                pointer-events: auto;
            }
            .anketa-control-link {
                font-size: 12px; font-weight: 600; cursor: pointer;
                padding: 6px 12px; border-radius: 7px;
                background: rgba(0,0,0,0.50); border: 1px solid rgba(255,255,255,0.04);
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                line-height: 1.2;
                pointer-events: auto;
                transition: background 0.2s ease;
                display: flex; align-items: center; gap: 4px;
            }
            .anketa-control-link:active { background: rgba(0,0,0,0.7); }
            .anketa-control-link.edit { color: rgba(255,255,255,0.82); }
            .anketa-control-link.delete { color: rgba(255,100,100,0.80); }
            .anketa-control-link svg { width: 12px; height: 12px; flex-shrink: 0; }
            
            .anketa-card-actions { position: absolute; bottom: 12px; left: 12px; right: 12px; display: flex; gap: 8px; z-index: 4; }
            .anketa-card-actions.single { justify-content: center; }
            .anketa-card-btn {
                flex: 1; height: 42px; border-radius: 11px; border: none;
                font-size: 13px; font-weight: 600; cursor: pointer;
                transition: all 0.15s ease; text-align: center;
                display: flex; align-items: center; justify-content: center; gap: 6px;
                box-shadow: inset 0 -2px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.25);
                pointer-events: auto;
            }
            .anketa-card-btn:active { transform: scale(0.97); }
            .anketa-card-btn.create { background: linear-gradient(135deg, #FF5500, #FF6B20); color: #fff; }
            .anketa-card-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
            
            .anketa-ribbon {
                position: absolute; top: -1px; left: -1px; z-index: 6;
                padding: 7px 18px 6px 14px;
                font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
                background: var(--ribbon-bg, rgba(18,18,24,0.95));
                color: var(--ribbon-color, #FF5500);
                border-radius: 18px 0 10px 0;
                border-bottom: 1px solid var(--ribbon-color, #FF5500);
                border-right: 1px solid var(--ribbon-color, #FF5500);
            }
            
            /* ===== ЛАЙКИ ===== */
            .anketa-likes-section { 
                font-size: 13px; font-weight: 700; 
                color: rgba(255,255,255,0.7); 
                padding: 16px 16px 8px; 
                letter-spacing: 0.5px;
                text-transform: uppercase;
                display: flex; align-items: center; gap: 8px;
            }
            .anketa-likes-section svg { width: 16px; height: 16px; flex-shrink: 0; }
            
            .anketa-like-item { 
                display: flex; align-items: center; padding: 12px 16px; gap: 12px; 
                border-radius: 12px; margin: 2px 8px;
                background: rgba(255,255,255,0.02);
                transition: background 0.2s ease;
            }
            .anketa-like-item:active { background: rgba(255,255,255,0.04); }
            
            .anketa-like-avatar { 
                width: 44px; height: 44px; border-radius: 50%; 
                background: rgba(255,255,255,0.08); 
                display: flex; align-items: center; justify-content: center; 
                font-weight: 700; font-size: 16px; color: #fff; 
                overflow: hidden; flex-shrink: 0;
            }
            .anketa-like-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .anketa-like-info { flex: 1; min-width: 0; }
            .anketa-like-nick { 
                font-size: 14px; font-weight: 600; color: #fff; 
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .anketa-like-mode { font-size: 12px; color: rgba(255,255,255,0.4); }
            
            /* ===== КНОПКА ЛАЙКНУТЬ В ОТВЕТ ===== */
            .anketa-like-back-btn { 
                width: 40px; height: 40px; border-radius: 50%; border: none; 
                background: rgba(255,85,0,0.15); 
                cursor: pointer; display: flex; align-items: center; justify-content: center; 
                flex-shrink: 0;
                transition: transform 0.15s ease, background 0.15s ease;
            }
            .anketa-like-back-btn:active { transform: scale(0.9); background: rgba(255,85,0,0.25); }
            .anketa-like-back-btn svg { width: 20px; height: 20px; }
            
            /* ===== КНОПКА НАТИВНОГО ЧАТА ===== */
            .anketa-chat-btn {
                height: 36px; padding: 0 14px; border-radius: 10px; border: none;
                background: linear-gradient(135deg, #FF5500, #FF6B20);
                color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
                flex-shrink: 0; white-space: nowrap;
                display: flex; align-items: center; gap: 6px;
                box-shadow: 0 2px 8px rgba(255,85,0,0.3);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .anketa-chat-btn:active { 
                transform: scale(0.95); 
                box-shadow: 0 1px 4px rgba(255,85,0,0.2);
            }
            .anketa-chat-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
            
            .anketa-like-arrow { 
                color: rgba(255,255,255,0.2); 
                font-size: 18px; 
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(style);
    },
    
    triggerGlint(card) {
        card.classList.add('glinting');
        setTimeout(() => card.classList.remove('glinting'), 500);
    },

    applyEffects(card) {
        card.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button') || e.target.closest('.anketa-control-link')) return;
            this.triggerGlint(card);
        });
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
            container.scrollTop = 0;
            
            requestAnimationFrame(() => {
                const cards = container.querySelectorAll('.anketa-card');
                cards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px) scale(0.985)';
                    card.style.transition = 'none';
                });
                container.offsetHeight;
                cards.forEach((card, index) => {
                    card.style.transition = 'transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 400ms cubic-bezier(0.22, 0.61, 0.36, 1)';
                    card.style.transitionDelay = `${index * 50}ms`;
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    });
                    this.applyEffects(card);
                });
            });
    
        } catch (err) {
            let html = '<div class="anketa-scroll"><div class="anketa-divider-top"></div>';
            modes.slice(0,4).forEach((m,i) => { html += this.buildSlot(m, null, {}); if (i<3) html += '<div class="anketa-divider"></div>'; });
            html += '</div>';
            container.innerHTML = html;
            container.scrollTop = 0;
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
            const aboutHTML = aboutText ? `<div class="anketa-about">${aboutText.substring(0, 100)}${aboutText.length > 100 ? '…' : ''}</div>` : '';
            const longClass = aboutText.length > 40 ? ' long-about' : '';
            const isFaceitPremier = mode.id=='faceit'||mode.id=='premier';
            const buttonText = isFaceitPremier ? 'Открыть Faceit' : 'Открыть Steam';
            const buttonIcon = isFaceitPremier 
                ? '<svg viewBox="0 0 24 24"><use href="#icon-arrow"/></svg>' 
                : '<svg viewBox="0 0 24 24"><use href="#icon-arrow"/></svg>';
            const profileLink = isFaceitPremier ? (profileData.faceit_link||anketa.link||'#') : (profileData.steam_link||anketa.link||'#');

            return `
            <div class="anketa-card filled${longClass}" style="${cardStyle}">
                <div class="card-glint"></div>
                ${ribbonHTML}
                <div class="anketa-card-controls">
                    <span class="anketa-control-link edit" onclick="Anketa.editAnketa('${mode.id}')">
                        <svg viewBox="0 0 24 24"><use href="#icon-edit"/></svg>
                        Изменить
                    </span>
                    <span class="anketa-control-link delete" onclick="Anketa.deleteAnketa('${mode.id}')">
                        <svg viewBox="0 0 24 24" width="12" height="12"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
                        Удалить
                    </span>
                </div>
                <div class="anketa-text-block">
                    ${playerId?`<div class="anketa-id">ID ${playerId}</div>`:''}
                    <div class="anketa-nick">${nick}</div>
                    <div class="anketa-stats-row">${statsParts.join(' <span class="anketa-stats-sep">·</span> ')}</div>
                    ${aboutHTML}
                </div>
                <button class="anketa-profile-btn" onclick="Anketa.openProfileLink('${profileLink.replace(/'/g,"\\'")}','${mode.id}')">
                    ${buttonIcon}
                    ${buttonText}
                </button>
            </div>`;
        }
        return `
        <div class="anketa-card empty">
            <div class="card-glint"></div>
            ${ribbonHTML}
            <div class="anketa-card-actions single">
                <button class="anketa-card-btn create" onclick="Anketa.goToMode('${mode.id}')">
                    <svg viewBox="0 0 24 24"><use href="#icon-edit"/></svg>
                    Создать карточку
                </button>
            </div>
        </div>`;
    },

    openProfileLink(link, modeId) {
        if (!link||link=='#') { 
            App?.showCustomPopup?.('Ссылка не указана','Добавьте ссылку в настройках',null,null,'OK','',false); 
            return; 
        }
        (window.Telegram?.WebApp?.openLink||window.open)(link, '_blank');
    },
    
    goToMode(modeId) { 
        App.showScreen(modeId+'Screen',true); 
        setTimeout(()=>{
            const b=document.querySelector(`#${modeId}Screen .mode-search-btn`);
            if(b){
                b.textContent='Обновить карточку';
                b.onclick=()=>App.createCard(modeId);
            }
            this.fillEditForm(modeId);
        },300); 
    },
    
    fillEditForm(modeId) {
        const tid=this.getTelegramId();if(!tid)return;
        fetch(`${this.BACKEND_URL}/api/anketa/list`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telegram_id:String(tid)})})
        .then(r=>r.json()).then(data=>{
            const c=(data.anketas||[]).find(c=>c.mode===modeId);if(!c)return;
            if(modeId=='faceit'){setVal('faceitELOInput',c.rank);setVal('faceitAge',c.age);setVal('faceitLinkInput',c.link);setVal('faceitAbout',c.about);}
            else if(modeId=='premier'){setVal('premierRatingInput',c.rank);setVal('premierAge',c.age);setVal('premierLinkInput',c.link);setVal('premierAbout',c.about);}
            else if(modeId=='prime'){setVal('primeRankSelect',c.rank);setVal('primeAge',c.age);setVal('primeLinkInput',c.link);setVal('primeAbout',c.about);}
            else if(modeId=='public'){setVal('publicRankSelect',c.rank);setVal('publicAge',c.age);setVal('publicLinkInput',c.link);setVal('publicAbout',c.about);}
            function setVal(id,v){const el=document.getElementById(id);if(el&&v!==undefined)el.value=v;}
        }).catch(()=>{});
    },
    
    editAnketa(m) { this.goToMode(m); },
    
    deleteAnketa(m) { 
        App.showCustomPopup(
            'Удалить карточку?',
            `Карточка ${m.toUpperCase()} будет удалена.`,
            ()=>{
                fetch(`${this.BACKEND_URL}/api/anketa/delete`,{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({telegram_id:String(this.getTelegramId()),mode:m})
                }).then(r=>r.json()).then(d=>{if(d.status=='ok')this.loadMyAnketas();});
            },
            null,'Удалить','Отмена',true
        ); 
    },
    
    // 🔥 ЗАГРУЗКА ЛАЙКОВ
    loadLikes() {
        const c=document.getElementById('anketaLikesTab');
        if(!c)return;
        c.innerHTML='<div class="anketa-loading">Загрузка...</div>';
        const tid=this.getTelegramId();
        if(!tid){c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';return;}
        
        fetch(`${this.BACKEND_URL}/api/likes/list`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({telegram_id:String(tid)})
        })
        .then(r=>r.json()).then(d=>{
            if(d.status!='ok'){c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';return;}
            
            let h='';
            
            // 🔥 ВЗАИМНЫЕ МЭТЧИ
            if(d.mutual?.length){
                h += '<div class="anketa-likes-section">' +
                     '<svg viewBox="0 0 24 24" width="16" height="16"><use href="#icon-match"/></svg>' +
                     'Взаимные мэтчи</div>';
                d.mutual.forEach(m => h += this.buildLikeItem(m, 'mutual'));
            }
            
            // 🔥 ТЕБЯ ЛАЙКНУЛИ
            if(d.liked_me?.length){
                h += '<div class="anketa-likes-section">' +
                     '<svg viewBox="0 0 24 24" width="16" height="16"><use href="#icon-heart"/></svg>' +
                     'Тебя лайкнули</div>';
                d.liked_me.forEach(m => h += this.buildLikeItem(m, 'liked_me'));
            }
            
            // 🔥 ТЫ ЛАЙКНУЛ
            if(d.i_liked?.length){
                h += '<div class="anketa-likes-section">' +
                     '<svg viewBox="0 0 24 24" width="16" height="16"><use href="#icon-heart"/></svg>' +
                     'Ты лайкнул</div>';
                d.i_liked.forEach(m => h += this.buildLikeItem(m, 'i_liked'));
            }
            
            c.innerHTML = h || '<div class="anketa-empty-text">Пока нет лайков</div>';
        }).catch(()=>{c.innerHTML='<div class="anketa-empty-text">Ошибка</div>';});
    },
    
    // 🔥 ПОСТРОЕНИЕ ЭЛЕМЕНТА ЛАЙКА
    buildLikeItem(m, t) {
        const av = m.avatar 
            ? `<img src="${m.avatar}" alt="">` 
            : (m.nick || '?')[0].toUpperCase();
        
        let btn = '';
        
        if (t === 'mutual') {
            // 🔥 ВЗАИМНЫЙ МЭТЧ — КНОПКА НАТИВНОГО ЧАТА
            const username = m.username || '';
            if (username) {
                btn = `<button class="anketa-chat-btn" onclick="window.App.openNativeChat('${username}', '${m.nick || ''}')">
                    <svg viewBox="0 0 24 24"><use href="#icon-chat"/></svg>
                    Написать
                </button>`;
            } else {
                btn = '<span class="anketa-like-arrow">→</span>';
            }
        } else if (t === 'liked_me') {
            // 🔥 ТЕБЯ ЛАЙКНУЛИ — КНОПКА ЛАЙКНУТЬ В ОТВЕТ
            btn = `<button class="anketa-like-back-btn" onclick="Anketa.likeBack('${m.liker_player_id}')">
                <svg viewBox="0 0 24 24"><use href="#icon-heart"/></svg>
            </button>`;
        } else {
            // 🔥 ТЫ ЛАЙКНУЛ — ПРОСТО СТРЕЛКА
            btn = '<span class="anketa-like-arrow">→</span>';
        }
        
        return `
        <div class="anketa-like-item">
            <div class="anketa-like-avatar">${av}</div>
            <div class="anketa-like-info">
                <div class="anketa-like-nick">${m.nick || 'Без имени'}</div>
                <div class="anketa-like-mode">${m.mode || ''} · ${m.rank || ''}</div>
            </div>
            ${btn}
        </div>`;
    },
    
    // 🔥 ЛАЙКНУТЬ В ОТВЕТ
    likeBack(lid) {
        fetch(`${this.BACKEND_URL}/api/like`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                telegram_id: String(this.getTelegramId()),
                liked_player_id: lid
            })
        })
        .then(r => r.json())
        .then(d => {
            if (d.status === 'match') {
                // 🔥 ПОКАЗЫВАЕМ МЭТЧ ПОПАП
                if (d.match_info) {
                    window.App.showMatchPopup({
                        nick: d.match_info.nick,
                        username: d.match_info.username
                    });
                } else {
                    window.App.showCustomPopup(
                        'Взаимный мэтч!',
                        'Проверь Telegram — бот прислал контакт!',
                        null, null, 'OK', '', false
                    );
                }
                this.loadLikes();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('anketaScreen')) Anketa.init();
});

const origShow = window.App?.showScreen;
if (origShow) {
    window.App.showScreen = function(s, d) {
        origShow.call(window.App, s, d);
        if (s === 'anketaScreen') setTimeout(() => Anketa.init(), 200);
    };
}

window.Anketa = Anketa;
console.log('✅ Anketa v18.0 SVG NATIVE готов');

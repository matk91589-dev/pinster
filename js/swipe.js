// ============================================
// SWIPE SYSTEM — Pingster v3.2 (FIXED)
// ============================================

const Swipe = {
    current: null,
    mode: null,
    initialized: false,
    cardContainer: null,

    RIBBON_COLORS: {
        faceit:   { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        premier:  { bg: 'rgba(18,18,24,0.92)', color: '#FF5500', glow: 'rgba(255,85,0,0.08)' },
        prime:    { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' },
        public:   { bg: 'rgba(18,18,24,0.92)', color: '#C0C6D0', glow: 'rgba(192,198,208,0.04)' }
    },

    init(mode) {
        this.mode = mode;
        this.injectStyles();
        this.createCardContainer();
        this.initialized = true;
    },

    injectStyles() {
        if (document.getElementById('swipe-v32-styles')) return;
        const style = document.createElement('style');
        style.id = 'swipe-v32-styles';
        style.textContent = `
            #swipeScreen { display: block !important; }
            #swipeContainer { 
                display: flex !important; 
                flex-direction: column !important;
                align-items: center !important;
                justify-content: flex-start !important;
                padding: 80px 0 20px !important;
                width: 100% !important; 
                min-height: 100vh !important;
                overflow-y: auto !important;
            }
            #swipeCardContainer { 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: center !important; 
                width: 100% !important; 
            }
            
            .swipe-player-card {
                position: relative !important;
                width: 90vw !important;
                max-width: 380px !important;
                aspect-ratio: 16 / 20 !important;
                max-height: 460px !important;
                min-height: 380px !important;
                border-radius: 18px !important;
                overflow: hidden !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) !important;
                border: 1px solid rgba(255,255,255,0.06) !important;
                margin: 0 auto !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-end !important;
                padding: 16px !important;
                background-color: #0a0a0f !important;
                background-size: cover !important;
                background-position: center 20% !important;
                background-repeat: no-repeat !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            .swipe-player-card.filled::after {
                content: '' !important;
                position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
                height: 65% !important;
                background: linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.0) 100%) !important;
                z-index: 1 !important; pointer-events: none !important;
            }
            .swipe-card-ribbon {
                position: absolute !important; top: 0 !important; left: 0 !important; z-index: 5 !important;
                padding: 7px 18px 6px 14px !important;
                font-size: 11px !important; font-weight: 700 !important; letter-spacing: 0.9px !important; text-transform: uppercase !important;
                background: var(--ribbon-bg, rgba(18,18,24,0.92)) !important;
                color: var(--ribbon-color, #FF5500) !important;
                clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%) !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
                backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
                border-bottom: 1px solid var(--ribbon-color, #FF5500) !important;
            }
            .swipe-text-block {
                position: relative !important; z-index: 2 !important;
                display: flex !important; flex-direction: column !important;
                align-items: flex-start !important; text-align: left !important;
                gap: 3px !important; margin-bottom: 56px !important; width: 100% !important;
            }
            .swipe-id {
                font-size: 10px !important; font-weight: 600 !important; letter-spacing: 0.8px !important;
                color: #FF5500 !important; text-transform: uppercase !important;
            }
            .swipe-nick {
                font-size: 28px !important; font-weight: 800 !important; color: #FFFFFF !important;
                text-shadow: 0 2px 12px rgba(0,0,0,0.7) !important;
                letter-spacing: -0.3px !important; line-height: 1.2 !important; margin-top: 2px !important;
            }
            .swipe-stats-row {
                font-size: 14px !important; font-weight: 500 !important; color: #FFFFFF !important;
                display: flex !important; align-items: center !important; gap: 10px !important;
                white-space: nowrap !important; margin-top: 4px !important; flex-wrap: wrap !important;
            }
            .swipe-stats-sep {
                color: rgba(255,255,255,0.6) !important; font-size: 14px !important; font-weight: 700 !important;
            }
            .swipe-about {
                font-size: 14px !important; color: #FFFFFF !important; line-height: 1.5 !important;
                display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;
                overflow: hidden !important; max-width: 100% !important; margin-top: 6px !important; font-weight: 400 !important;
            }
            .swipe-profile-btn {
                position: absolute !important; bottom: 8px !important; left: 16px !important; right: 16px !important;
                z-index: 3 !important; height: 40px !important; border-radius: 10px !important;
                border: 1px solid rgba(255,85,0,0.25) !important;
                background: rgba(255,255,255,0.08) !important; color: white !important;
                font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important;
                backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;
                transition: all 0.2s ease !important; letter-spacing: 0.3px !important;
                box-shadow: 0 0 18px rgba(255,85,0,0.12) !important;
            }
            .swipe-profile-btn:active {
                background: rgba(255,85,0,0.15) !important;
                border-color: rgba(255,85,0,0.5) !important;
            }
            .swipe-actions {
                display: flex !important; justify-content: center !important; gap: 40px !important;
                margin-top: 20px !important; padding: 10px 0 !important;
                opacity: 1 !important; visibility: visible !important;
            }
            .swipe-btn {
                width: 64px !important; height: 64px !important; border-radius: 50% !important; border: none !important;
                font-size: 28px !important; cursor: pointer !important;
                transition: all 0.2s ease !important;
                display: flex !important; align-items: center !important; justify-content: center !important;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
                opacity: 1 !important; visibility: visible !important;
            }
            .swipe-btn:active { transform: scale(0.9) !important; }
            .swipe-btn.like {
                background: linear-gradient(135deg, #FF5500, #FF6B20) !important; color: #fff !important;
                box-shadow: 0 4px 20px rgba(255,85,0,0.35) !important;
            }
            .swipe-btn.skip {
                background: rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.6) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
            }
            .swipe-toast {
                position: fixed !important; top: 60px !important; left: 50% !important; transform: translateX(-50%) !important;
                background: rgba(0,0,0,0.85) !important; backdrop-filter: blur(10px) !important;
                color: white !important; padding: 10px 20px !important; border-radius: 30px !important;
                font-size: 13px !important; font-weight: 500 !important; z-index: 10000 !important;
                white-space: nowrap !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            }
            .swipe-toast.match { background: rgba(255,85,0,0.9) !important; }
        `;
        document.head.appendChild(style);
    },

    createCardContainer() {
        const container = document.getElementById('swipeContainer');
        if (!container) {
            console.error('❌ swipeContainer не найден');
            return;
        }
        container.innerHTML = '';

        this.cardContainer = document.createElement('div');
        this.cardContainer.id = 'swipeCardContainer';
        this.cardContainer.style.cssText = 'display:flex !important;flex-direction:column !important;align-items:center !important;width:100% !important;';
        container.appendChild(this.cardContainer);

        const actions = document.createElement('div');
        actions.className = 'swipe-actions';
        actions.id = 'swipeActions';
        actions.innerHTML = `
            <button class="swipe-btn skip" onclick="Swipe.reject()">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <button class="swipe-btn like" onclick="Swipe.like()">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        `;
        this.cardContainer.appendChild(actions);
    },

    show(data) {
        this.current = data;
        console.log('🃏 Swipe.show:', data);

        const anketaMode = (data.mode || this.mode || 'faceit').toLowerCase();
        const rc = this.RIBBON_COLORS[anketaMode] || this.RIBBON_COLORS.faceit;
        const modeDisplayName = anketaMode.toUpperCase();

        if (!this.cardContainer) this.createCardContainer();
        if (!this.cardContainer) return;

        const oldCard = this.cardContainer.querySelector('.swipe-player-card');
        if (oldCard) oldCard.remove();

        const card = document.createElement('div');
        card.className = 'swipe-player-card filled';
        card.style.setProperty('--ribbon-bg', rc.bg);
        card.style.setProperty('--ribbon-color', rc.color);
        card.style.setProperty('display', 'flex', 'important');
        card.style.setProperty('opacity', '1', 'important');
        card.style.setProperty('visibility', 'visible', 'important');

        if (data.avatar && data.avatar !== 'null' && data.avatar !== '') {
            card.style.backgroundImage = `url(${data.avatar})`;
        } else {
            card.style.background = 'linear-gradient(145deg, #1c1c24, #16161c)';
        }

        const statsParts = [];
        statsParts.push(`<span>${modeDisplayName}</span>`);

        if (data.rank) {
            let rankText = data.rank;
            if (anketaMode === 'faceit') rankText = `${rankText} elo`;
            else if (anketaMode === 'premier') rankText = `${rankText} rating`;
            statsParts.push(`<span>${rankText}</span>`);
        }

        if (data.age) statsParts.push(`<span>${data.age} y.o.</span>`);

        const aboutHTML = data.about?.trim()
            ? `<div class="swipe-about">${data.about.substring(0, 120)}${data.about.length > 120 ? '…' : ''}</div>`
            : '';

        let profileLink = '#';
        let buttonText = 'Open Steam профиль';
        if (anketaMode === 'faceit' || anketaMode === 'premier') {
            profileLink = data.faceit_link || '#';
            buttonText = 'Open Faceit профиль';
        } else {
            profileLink = data.steam_link || '#';
        }

        card.innerHTML = `
            <div class="swipe-card-ribbon">${modeDisplayName}</div>
            <div class="swipe-text-block">
                ${data.player_id ? `<div class="swipe-id">ID ${data.player_id}</div>` : ''}
                <div class="swipe-nick">${data.nick || 'Без имени'}</div>
                <div class="swipe-stats-row">
                    ${statsParts.join(' <span class="swipe-stats-sep">•</span> ')}
                </div>
                ${aboutHTML}
            </div>
            ${profileLink !== '#' ? `<button class="swipe-profile-btn" onclick="Swipe.openProfile('${profileLink.replace(/'/g, "\\'")}')">${buttonText}</button>` : ''}
        `;

        const actions = this.cardContainer.querySelector('#swipeActions');
        this.cardContainer.insertBefore(card, actions);

        console.log('🃏 Карточка в DOM:', card.offsetWidth, '×', card.offsetHeight);
    },

    openProfile(link) {
        if (!link || link === '#') return;
        if (window.Telegram?.WebApp?.openLink) Telegram.WebApp.openLink(link);
        else window.open(link, '_blank');
    },

    like() {
        if (!this.current?.player_id) return;
        this.animateCard('right');
        if (window.Search) {
            Search.likePlayer(this.current.player_id, (data) => {
                this.showToast(data?.status === 'match' ? '❤️ Взаимный мэтч!' : '👍 Лайк!', data?.status === 'match');
            });
        }
        setTimeout(() => this.next(), 350);
    },

    reject() {
        if (!this.current) return;
        this.animateCard('left');
        this.showToast('👎 Пропущено');
        setTimeout(() => this.next(), 350);
    },

    animateCard(dir) {
        const card = this.cardContainer?.querySelector('.swipe-player-card');
        if (!card) return;
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        card.style.transform = `translateX(${dir === 'right' ? '120%' : '-120%'}) rotate(${dir === 'right' ? '15deg' : '-15deg'})`;
        card.style.opacity = '0';
    },

    next() {
        if (window.Search) {
            const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            setTimeout(() => Search.showNextAnketa(id, this.mode), 100);
        }
    },

    startWithAnketa(anketa, mode) {
        this.mode = (anketa.mode || mode || 'faceit').toLowerCase();
        
        const container = document.getElementById('swipeContainer');
        if (!container) {
            console.error('❌ swipeContainer не найден, пробуем снова...');
            setTimeout(() => this.startWithAnketa(anketa, mode), 200);
            return;
        }
        
        if (!this.initialized) this.init(this.mode);
        this.show(anketa);
        this.showBackArrow();
    },

    showToast(msg, isMatch = false) {
        const old = document.querySelector('.swipe-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'swipe-toast' + (isMatch ? ' match' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 1500);
    },

    showBackArrow() {
        const a = document.querySelector('.back-arrow-swipe');
        if (a) { a.style.display = 'flex'; a.style.visibility = 'visible'; a.style.opacity = '1'; }
    },
    hideBackArrow() {
        const a = document.querySelector('.back-arrow-swipe');
        if (a) { a.style.display = 'none'; a.style.visibility = 'hidden'; }
    },
    exitSwipeMode() { this.hideBackArrow(); this.current = null; }
};

window.Swipe = Swipe;
console.log('✅ Swipe v3.2 готов');

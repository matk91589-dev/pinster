// ============================================
// SWIPE SYSTEM — Pingster v3.0 (ANKETA STYLE)
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
        if (document.getElementById('swipe-v3-styles')) return;
        const style = document.createElement('style');
        style.id = 'swipe-v3-styles';
        style.textContent = `
            /* 🔥 КАРТОЧКА — ТОЧНО КАК В ANKETA */
            .swipe-player-card {
                position: relative;
                width: 90vw;
                max-width: 380px;
                aspect-ratio: 16 / 20;
                max-height: 460px;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.06);
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                padding: 16px;
                background-color: #0a0a0f;
                background-size: cover;
                background-position: center 20%;
                background-repeat: no-repeat;
                transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease;
                opacity: 1;
            }

            .swipe-player-card.filled::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0; right: 0;
                height: 65%;
                background: linear-gradient(
                    to top,
                    rgba(0,0,0,0.98) 0%,
                    rgba(0,0,0,0.95) 25%,
                    rgba(0,0,0,0.85) 50%,
                    rgba(0,0,0,0.55) 75%,
                    rgba(0,0,0,0.0) 100%
                );
                z-index: 1;
                pointer-events: none;
            }

            /* RIBBON */
            .swipe-card-ribbon {
                position: absolute;
                top: 0; left: 0; z-index: 5;
                padding: 7px 18px 6px 14px;
                font-size: 11px; font-weight: 700;
                letter-spacing: 0.9px; text-transform: uppercase;
                background: var(--ribbon-bg, rgba(18,18,24,0.92));
                color: var(--ribbon-color, #FF5500);
                clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border-bottom: 1px solid var(--ribbon-color, #FF5500);
            }

            /* ТЕКСТОВЫЙ БЛОК */
            .swipe-text-block {
                position: relative; z-index: 2;
                display: flex; flex-direction: column;
                align-items: flex-start; text-align: left;
                gap: 3px; margin-bottom: 56px; width: 100%;
            }

            .swipe-id {
                font-size: 10px; font-weight: 600;
                letter-spacing: 0.8px; color: #FF5500;
                text-transform: uppercase;
            }

            .swipe-nick {
                font-size: 28px; font-weight: 800; color: #FFFFFF;
                text-shadow: 0 2px 12px rgba(0,0,0,0.7);
                letter-spacing: -0.3px; line-height: 1.2; margin-top: 2px;
            }

            .swipe-stats-row {
                font-size: 14px; font-weight: 500; color: #FFFFFF;
                display: flex; align-items: center; gap: 10px;
                white-space: nowrap; margin-top: 4px; flex-wrap: wrap;
            }

            .swipe-stats-sep {
                color: rgba(255,255,255,0.6);
                font-size: 14px; font-weight: 700;
            }

            .swipe-about {
                font-size: 14px; color: #FFFFFF; line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                overflow: hidden; max-width: 100%; margin-top: 6px;
                font-weight: 400;
            }

            /* КНОПКА ПРОФИЛЯ */
            .swipe-profile-btn {
                position: absolute; bottom: 8px; left: 16px; right: 16px;
                z-index: 3; height: 40px; border-radius: 10px;
                border: 1px solid rgba(255,85,0,0.25);
                background: rgba(255,255,255,0.08); color: white;
                font-size: 13px; font-weight: 600; cursor: pointer;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                transition: all 0.2s ease; letter-spacing: 0.3px;
                box-shadow: 0 0 18px rgba(255,85,0,0.12);
            }

            .swipe-profile-btn:active {
                background: rgba(255,85,0,0.15);
                border-color: rgba(255,85,0,0.5);
                box-shadow: 0 0 24px rgba(255,85,0,0.2);
                transform: scale(0.98);
            }

            /* 🔥 КНОПКИ ЛАЙК/СКИП */
            .swipe-actions {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin-top: 20px;
                padding: 10px 0;
            }

            .swipe-btn {
                width: 64px; height: 64px;
                border-radius: 50%; border: none;
                font-size: 28px; cursor: pointer;
                transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            }

            .swipe-btn:active {
                transform: scale(0.9);
            }

            .swipe-btn.like {
                background: linear-gradient(135deg, #FF5500, #FF6B20);
                color: #fff;
                box-shadow: 0 4px 20px rgba(255,85,0,0.35);
            }

            .swipe-btn.like:active {
                box-shadow: 0 6px 28px rgba(255,85,0,0.5);
            }

            .swipe-btn.skip {
                background: rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.6);
                border: 1px solid rgba(255,255,255,0.1);
            }

            .swipe-btn.skip:active {
                background: rgba(255,255,255,0.2);
                color: #fff;
            }

            /* ТОСТ */
            .swipe-toast {
                position: fixed; top: 60px; left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(10px);
                color: white; padding: 10px 20px;
                border-radius: 30px; font-size: 13px;
                font-weight: 500; z-index: 10000;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                pointer-events: none;
            }

            .swipe-toast.match {
                background: rgba(255,85,0,0.9);
            }
        `;
        document.head.appendChild(style);
    },

    createCardContainer() {
        const container = document.getElementById('swipeContainer');
        if (!container) return;

        container.innerHTML = '';

        this.cardContainer = document.createElement('div');
        this.cardContainer.id = 'swipeCardContainer';
        this.cardContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;';
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

    // 🔥 ПОКАЗАТЬ КАРТОЧКУ (СТИЛЬ ANKETA)
    show(data) {
        this.current = data;

        if (!this.cardContainer) {
            this.createCardContainer();
        }

        const rc = this.RIBBON_COLORS[this.mode] || this.RIBBON_COLORS.faceit;
        const modeName = (this.mode || data.mode || 'faceit').toUpperCase();

        // Удаляем старую карточку
        const oldCard = this.cardContainer.querySelector('.swipe-player-card');
        if (oldCard) {
            oldCard.style.opacity = '0';
            oldCard.style.transform = 'scale(0.95)';
            setTimeout(() => oldCard.remove(), 200);
        }

        // Создаём новую карточку
        const card = document.createElement('div');
        card.className = 'swipe-player-card filled';
        card.style.setProperty('--ribbon-bg', rc.bg);
        card.style.setProperty('--ribbon-color', rc.color);

        // Аватарка как фон
        if (data.avatar && data.avatar !== 'null' && data.avatar !== '') {
            card.style.backgroundImage = `url(${data.avatar})`;
        } else {
            card.style.background = 'linear-gradient(145deg, #1c1c24, #16161c)';
        }

        const statsParts = [];
        const modeDisplayName = this.mode === 'premier' ? 'Premier' : modeName;
        statsParts.push(`<span>${modeDisplayName}</span>`);

        if (data.rank) {
            let rankText = data.rank;
            if (this.mode === 'faceit') {
                rankText = rankText.toLowerCase().includes('elo') ? rankText.toLowerCase() : `${rankText} elo`;
            } else if (this.mode === 'premier') {
                rankText = rankText.toLowerCase().includes('rating') ? rankText : `${rankText} rating`;
            }
            statsParts.push(`<span>${rankText}</span>`);
        }

        if (data.age) {
            statsParts.push(`<span>${data.age} y.o.</span>`);
        }

        const aboutHTML = data.about && data.about.trim()
            ? `<div class="swipe-about">${data.about.substring(0, 120)}${data.about.length > 120 ? '…' : ''}</div>`
            : '';

        let profileLink = '#';
        let buttonText = 'Open Steam профиль';

        if (this.mode === 'faceit' || this.mode === 'premier') {
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
            <button class="swipe-profile-btn" onclick="Swipe.openProfile('${profileLink.replace(/'/g, "\\'")}')">
                ${buttonText}
            </button>
        `;

        const actions = this.cardContainer.querySelector('#swipeActions');
        this.cardContainer.insertBefore(card, actions);

        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        });
    },

    openProfile(link) {
        if (!link || link === '#') return;
        if (window.Telegram?.WebApp?.openLink) {
            Telegram.WebApp.openLink(link);
        } else {
            window.open(link, '_blank');
        }
    },

    like() {
        if (!this.current || !this.current.player_id) return;

        this.animateCard('right');

        if (window.Search) {
            Search.likePlayer(this.current.player_id, (data) => {
                if (data && data.status === 'match') {
                    this.showToast('❤️ Взаимный мэтч! Проверь бота!', true);
                } else {
                    this.showToast('👍 Лайк!');
                }
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

    animateCard(direction) {
        const card = this.cardContainer.querySelector('.swipe-player-card');
        if (!card) return;

        const translateX = direction === 'right' ? '120%' : '-120%';
        const rotate = direction === 'right' ? '15deg' : '-15deg';

        card.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease';
        card.style.transform = `translateX(${translateX}) rotate(${rotate})`;
        card.style.opacity = '0';
    },

    next() {
        if (window.Search) {
            const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            Search.showNextAnketa(id, this.mode);
        }
    },

    startWithAnketa(anketa, mode) {
        this.mode = mode || anketa.mode;
        if (!this.initialized) this.init(this.mode);
        this.show(anketa);
        this.showBackArrow();
    },

    showToast(message, isMatch = false) {
        const old = document.querySelector('.swipe-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'swipe-toast' + (isMatch ? ' match' : '');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    showBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'flex';
            arrow.style.visibility = 'visible';
            arrow.style.opacity = '1';
        }
    },

    hideBackArrow() {
        const arrow = document.querySelector('.back-arrow-swipe');
        if (arrow) {
            arrow.style.display = 'none';
            arrow.style.visibility = 'hidden';
        }
    },

    exitSwipeMode(reason) {
        this.hideBackArrow();
        this.current = null;
    }
};

window.Swipe = Swipe;

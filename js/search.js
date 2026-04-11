// ============================================
// ПОИСК - v4.3 FINAL (ИСПРАВЛЕН КОНФЛИКТ С SWIPE)
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v4.3 FINAL)');

const Search = {
    timerInterval: null,
    seconds: 0,
    currentMode: '',
    pollingInterval: null,
    currentMatchId: null,
    isSearching: false,
    processedMatchIds: new Set(),
    
    init() {
        console.log('🚀 Search.init()');
        this.resetTimer();
        this.ensureMatchAccepted();
        this.hookIntoScreenChange();
    },

    hookIntoScreenChange() {
        const waitForApp = setInterval(() => {
            if (window.App && window.App.showScreen) {
                clearInterval(waitForApp);
                
                const originalShow = window.App.showScreen;
                const self = this;
                
                window.App.showScreen = function(screenId, updateNav) {
                    console.log(`📱 showScreen: ${screenId}`);
                    originalShow.call(window.App, screenId, updateNav);
                    
                    setTimeout(() => {
                        if (screenId === 'faceitScreen') {
                            console.log('🎯 Заполняем FACEIT');
                            self.fillFaceitScreen();
                            self.setupFaceitValidation();
                        } else if (screenId === 'premierScreen') {
                            console.log('🎯 Заполняем PREMIER');
                            self.fillPremierScreen();
                            self.setupPremierValidation();
                        } else if (screenId === 'primeScreen') {
                            console.log('🎯 Заполняем PRIME');
                            self.fillPrimeScreen();
                            self.setupPrimeValidation();
                        } else if (screenId === 'publicScreen') {
                            console.log('🎯 Заполняем PUBLIC');
                            self.fillPublicScreen();
                            self.setupPublicValidation();
                        }
                    }, 50);
                };
                
                console.log('✅ showScreen перехвачен');
            }
        }, 50);
    },
    
    ensureMatchAccepted() {
        if (!window.MatchAccepted) {
            window.MatchAccepted = {
                show(teammateInfo, chatLink) {
                    if (window.Telegram?.WebApp?.openTelegramLink && chatLink) {
                        window.Telegram.WebApp.openTelegramLink(chatLink);
                    }
                    App.showScreen('mainScreen', true);
                }
            };
        }
    },
    
    getTelegramId() {
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null;
    },
    
    getProfileData() {
        return {
            age: localStorage.getItem('profile_age') || '',
            steam: localStorage.getItem('profile_steam') || '',
            faceit: localStorage.getItem('profile_faceit') || ''
        };
    },
    
    // ========== ВАЛИДАЦИЯ ССЫЛОК ==========
    validateSteamLink(link) {
        if (!link || link.trim() === '') return true;
        const patterns = [
            /^https:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/,
            /^https:\/\/s\.team\/[a-zA-Z0-9_-]+\/?$/
        ];
        return patterns.some(p => p.test(link.trim()));
    },
    
    validateFaceitLink(link) {
        if (!link || link.trim() === '') return true;
        const pattern = /^https:\/\/www\.faceit\.com\/[a-z]{2}\/players\/[a-zA-Z0-9_-]+\/?$/;
        return pattern.test(link.trim());
    },
    
    // ========== ПОДСВЕТКА ОШИБОК ==========
    showError(input, isError) {
        if (!input) return;
        if (isError) {
            input.style.color = '#FF3B30';
            input.style.borderColor = '#FF3B30';
        } else {
            input.style.color = '';
            input.style.borderColor = '';
        }
    },
    
    // ========== СЧЁТЧИК КОММЕНТАРИЯ ==========
    setupCommentCounter(commentInput) {
        if (!commentInput) return;
        
        commentInput.setAttribute('maxlength', '100');
        
        const parent = commentInput.parentElement;
        let counter = parent.querySelector('.comment-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'comment-counter';
            counter.style.cssText = `
                position: absolute;
                bottom: 8px;
                right: 12px;
                font-size: 11px;
                color: #8E97A6;
                font-weight: 400;
                pointer-events: none;
            `;
            parent.style.position = 'relative';
            parent.appendChild(counter);
        }
        
        const updateCounter = () => {
            const len = commentInput.value.length;
            counter.textContent = `${len}/100`;
            counter.style.color = len >= 100 ? '#FF3B30' : '#8E97A6';
        };
        
        updateCounter();
        commentInput.addEventListener('input', updateCounter);
    },
    
    // ========== НАСТРОЙКА ВАЛИДАЦИИ ==========
    setupFaceitValidation() {
        const ageInput = document.getElementById('faceitAgeValue');
        const ratingInput = document.getElementById('faceitELOInput');
        const faceitInput = document.getElementById('faceitLinkInput');
        const commentInput = document.getElementById('faceitComment');
        
        if (ageInput) {
            ageInput.setAttribute('maxlength', '3');
            ageInput.oninput = () => {
                const val = ageInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 100);
                this.showError(ageInput, !valid && val !== '');
            };
        }
        
        if (ratingInput) {
            ratingInput.setAttribute('maxlength', '4');
            ratingInput.oninput = () => {
                const val = ratingInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 5000);
                this.showError(ratingInput, !valid && val !== '');
            };
        }
        
        if (faceitInput) {
            faceitInput.onblur = () => {
                const val = faceitInput.value;
                if (val && !this.validateFaceitLink(val)) {
                    this.showError(faceitInput, true);
                    if (typeof Profile !== 'undefined' && Profile.showToast) {
                        Profile.showToast('Ссылка не ликвидна', true);
                    }
                } else {
                    this.showError(faceitInput, false);
                }
            };
            faceitInput.oninput = () => this.showError(faceitInput, false);
        }
        
        if (commentInput) {
            this.setupCommentCounter(commentInput);
        }
    },
    
    setupPremierValidation() {
        const ageInput = document.getElementById('premierAgeValue');
        const ratingInput = document.getElementById('premierRatingInput');
        const steamInput = document.getElementById('premierSteamInput');
        const commentInput = document.getElementById('premierComment');
        
        if (ageInput) {
            ageInput.setAttribute('maxlength', '3');
            ageInput.oninput = () => {
                const val = ageInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 100);
                this.showError(ageInput, !valid && val !== '');
            };
        }
        
        if (ratingInput) {
            ratingInput.setAttribute('maxlength', '5');
            ratingInput.oninput = () => {
                const val = ratingInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 40000);
                this.showError(ratingInput, !valid && val !== '');
            };
        }
        
        if (steamInput) {
            steamInput.onblur = () => {
                const val = steamInput.value;
                if (val && !this.validateSteamLink(val)) {
                    this.showError(steamInput, true);
                    if (typeof Profile !== 'undefined' && Profile.showToast) {
                        Profile.showToast('Ссылка не ликвидна', true);
                    }
                } else {
                    this.showError(steamInput, false);
                }
            };
            steamInput.oninput = () => this.showError(steamInput, false);
        }
        
        if (commentInput) {
            this.setupCommentCounter(commentInput);
        }
    },
    
    setupPrimeValidation() {
        const ageInput = document.getElementById('primeAgeValue');
        const rankSelect = document.getElementById('primeRankSelect');
        const steamInput = document.getElementById('primeSteamInput');
        const commentInput = document.getElementById('primeComment');
        
        if (ageInput) {
            ageInput.setAttribute('maxlength', '3');
            ageInput.oninput = () => {
                const val = ageInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 100);
                this.showError(ageInput, !valid && val !== '');
            };
        }
        
        if (rankSelect) {
            rankSelect.onchange = () => {
                const valid = rankSelect.value !== '' && rankSelect.value !== 'Выберите ранг';
                this.showError(rankSelect, !valid);
            };
        }
        
        if (steamInput) {
            steamInput.onblur = () => {
                const val = steamInput.value;
                if (val && !this.validateSteamLink(val)) {
                    this.showError(steamInput, true);
                    if (typeof Profile !== 'undefined' && Profile.showToast) {
                        Profile.showToast('Ссылка не ликвидна', true);
                    }
                } else {
                    this.showError(steamInput, false);
                }
            };
            steamInput.oninput = () => this.showError(steamInput, false);
        }
        
        if (commentInput) {
            this.setupCommentCounter(commentInput);
        }
    },
    
    setupPublicValidation() {
        const ageInput = document.getElementById('publicAgeValue');
        const rankSelect = document.getElementById('publicRankSelect');
        const steamInput = document.getElementById('publicSteamInput');
        const commentInput = document.getElementById('publicComment');
        
        if (ageInput) {
            ageInput.setAttribute('maxlength', '3');
            ageInput.oninput = () => {
                const val = ageInput.value;
                const num = parseInt(val);
                const valid = val === '' || (!isNaN(num) && num >= 0 && num <= 100);
                this.showError(ageInput, !valid && val !== '');
            };
        }
        
        if (rankSelect) {
            rankSelect.onchange = () => {
                const valid = rankSelect.value !== '' && rankSelect.value !== 'Выберите ранг';
                this.showError(rankSelect, !valid);
            };
        }
        
        if (steamInput) {
            steamInput.onblur = () => {
                const val = steamInput.value;
                if (val && !this.validateSteamLink(val)) {
                    this.showError(steamInput, true);
                    if (typeof Profile !== 'undefined' && Profile.showToast) {
                        Profile.showToast('Ссылка не ликвидна', true);
                    }
                } else {
                    this.showError(steamInput, false);
                }
            };
            steamInput.oninput = () => this.showError(steamInput, false);
        }
        
        if (commentInput) {
            this.setupCommentCounter(commentInput);
        }
    },
    
    fillFaceitScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('faceitAgeValue');
        const faceitInput = document.getElementById('faceitLinkInput');
        
        if (ageInput && p.age) ageInput.value = p.age;
        if (faceitInput && p.faceit) faceitInput.value = p.faceit;
        
        console.log('✅ FACEIT заполнен:', { age: p.age, faceit: p.faceit });
    },
    
    fillPremierScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('premierAgeValue');
        const steamInput = document.getElementById('premierSteamInput');
        
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
        
        console.log('✅ PREMIER заполнен:', { age: p.age, steam: p.steam });
    },
    
    fillPrimeScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('primeAgeValue');
        const steamInput = document.getElementById('primeSteamInput');
        
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
        
        console.log('✅ PRIME заполнен:', { age: p.age, steam: p.steam });
    },
    
    fillPublicScreen() {
        const p = this.getProfileData();
        const ageInput = document.getElementById('publicAgeValue');
        const steamInput = document.getElementById('publicSteamInput');
        
        if (ageInput && p.age) ageInput.value = p.age;
        if (steamInput && p.steam) steamInput.value = p.steam;
        
        console.log('✅ PUBLIC заполнен:', { age: p.age, steam: p.steam });
    },
    
    setStyle(style, element) {
        const parent = element.parentElement;
        parent.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        localStorage.setItem('selected_style', style);
        if (window.Settings) Settings.click();
    },
    
    start(mode, value) {
        console.log(`🔍 Search.start: ${mode}`);
        if (window.Settings) Settings.click();
        
        let isValid = true;
        let errorMsg = '';
        
        if (mode === 'FACEIT') {
            const age = document.getElementById('faceitAgeValue')?.value || '';
            const rating = document.getElementById('faceitELOInput')?.value || '';
            const faceitLink = document.getElementById('faceitLinkInput')?.value || '';
            
            if (!age || age === '') { isValid = false; errorMsg = 'Укажите возраст'; }
            else if (!rating || rating === '') { isValid = false; errorMsg = 'Укажите Faceit ELO'; }
            else if (faceitLink && !this.validateFaceitLink(faceitLink)) { isValid = false; errorMsg = 'Ссылка Faceit не ликвидна'; }
            else {
                const ageNum = parseInt(age);
                const ratingNum = parseInt(rating);
                if (ageNum < 0 || ageNum > 100) { isValid = false; errorMsg = 'Возраст 0-100'; }
                else if (ratingNum < 0 || ratingNum > 5000) { isValid = false; errorMsg = 'ELO 0-5000'; }
            }
        }
        else if (mode === 'PREMIER') {
            const age = document.getElementById('premierAgeValue')?.value || '';
            const rating = document.getElementById('premierRatingInput')?.value || '';
            const steamLink = document.getElementById('premierSteamInput')?.value || '';
            
            if (!age || age === '') { isValid = false; errorMsg = 'Укажите возраст'; }
            else if (!rating || rating === '') { isValid = false; errorMsg = 'Укажите CS Rating'; }
            else if (steamLink && !this.validateSteamLink(steamLink)) { isValid = false; errorMsg = 'Ссылка Steam не ликвидна'; }
            else {
                const ageNum = parseInt(age);
                const ratingNum = parseInt(rating);
                if (ageNum < 0 || ageNum > 100) { isValid = false; errorMsg = 'Возраст 0-100'; }
                else if (ratingNum < 0 || ratingNum > 40000) { isValid = false; errorMsg = 'Rating 0-40000'; }
            }
        }
        else if (mode === 'PRIME') {
            const age = document.getElementById('primeAgeValue')?.value || '';
            const rank = document.getElementById('primeRankSelect')?.value || '';
            const steamLink = document.getElementById('primeSteamInput')?.value || '';
            
            if (!age || age === '') { isValid = false; errorMsg = 'Укажите возраст'; }
            else if (!rank || rank === '' || rank === 'Выберите ранг') { isValid = false; errorMsg = 'Выберите ранг'; }
            else if (steamLink && !this.validateSteamLink(steamLink)) { isValid = false; errorMsg = 'Ссылка Steam не ликвидна'; }
            else {
                const ageNum = parseInt(age);
                if (ageNum < 0 || ageNum > 100) { isValid = false; errorMsg = 'Возраст 0-100'; }
            }
        }
        else if (mode === 'PUBLIC') {
            const age = document.getElementById('publicAgeValue')?.value || '';
            const rank = document.getElementById('publicRankSelect')?.value || '';
            const steamLink = document.getElementById('publicSteamInput')?.value || '';
            
            if (!age || age === '') { isValid = false; errorMsg = 'Укажите возраст'; }
            else if (!rank || rank === '' || rank === 'Выберите ранг') { isValid = false; errorMsg = 'Выберите ранг'; }
            else if (steamLink && !this.validateSteamLink(steamLink)) { isValid = false; errorMsg = 'Ссылка Steam не ликвидна'; }
            else {
                const ageNum = parseInt(age);
                if (ageNum < 0 || ageNum > 100) { isValid = false; errorMsg = 'Возраст 0-100'; }
            }
        }
        
        if (!isValid) {
            console.log('❌', errorMsg);
            if (typeof Profile !== 'undefined' && Profile.showToast) {
                Profile.showToast(errorMsg, true);
            } else {
                App.showAlert(errorMsg);
            }
            return;
        }
        
        console.log('✅ Запуск поиска');
        this.currentMode = mode;
        this.isSearching = true;
        this.processedMatchIds.clear();
        
        const data = this.collectData(mode);
        this.doSearch(mode, data);
    },
    
    collectData(mode) {
        const data = { style: 'fan', age: 0, steam_link: '', faceit_link: '', rating: 0, rank: '', comment: '' };
        
        const activeStyle = document.querySelector('.style-option.active');
        if (activeStyle) data.style = activeStyle.classList.contains('fan') ? 'fan' : 'tryhard';
        
        if (mode === 'FACEIT') {
            data.rating = parseInt(document.getElementById('faceitELOInput')?.value) || 0;
            data.age = parseInt(document.getElementById('faceitAgeValue')?.value) || 0;
            data.faceit_link = document.getElementById('faceitLinkInput')?.value || '';
            data.comment = document.getElementById('faceitComment')?.value || '';
        } else if (mode === 'PREMIER') {
            data.rating = parseInt(document.getElementById('premierRatingInput')?.value) || 0;
            data.age = parseInt(document.getElementById('premierAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('premierSteamInput')?.value || '';
            data.comment = document.getElementById('premierComment')?.value || '';
        } else if (mode === 'PRIME') {
            data.rank = document.getElementById('primeRankSelect')?.value || '';
            data.age = parseInt(document.getElementById('primeAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('primeSteamInput')?.value || '';
            data.comment = document.getElementById('primeComment')?.value || '';
        } else if (mode === 'PUBLIC') {
            data.rank = document.getElementById('publicRankSelect')?.value || '';
            data.age = parseInt(document.getElementById('publicAgeValue')?.value) || 0;
            data.steam_link = document.getElementById('publicSteamInput')?.value || '';
            data.comment = document.getElementById('publicComment')?.value || '';
        }
        
        return data;
    },
    
    doSearch(mode, data) {
        const telegram_id = this.getTelegramId();
        if (!telegram_id) return App.showAlert('Ошибка авторизации');
        
        App.showScreen('searchScreen', true);
        document.getElementById('searchModeTitle').textContent = mode;
        
        this.resetTimer();
        this.startTimer();
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegram_id,
                mode: mode.toLowerCase(),
                rating_value: String(data.rating || data.rank),
                style: data.style,
                age: data.age,
                steam_link: data.steam_link || null,
                faceit_link: data.faceit_link || null,
                comment: data.comment || ''
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'searching') this.startPolling();
            else if (res.status === 'match_found') this.showSwipe(res);
            else App.showAlert(res.message || 'Ошибка');
        })
        .catch(() => App.showAlert('Ошибка соединения'));
    },
    
    startPolling() {
        this.pollingInterval = setInterval(() => {
            if (!this.isSearching) return;
            
            fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/match/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id: this.getTelegramId() })
            })
            .then(res => res.json())
            .then(data => {
                if (data.match_found && !this.processedMatchIds.has(data.match_id)) {
                    this.processedMatchIds.add(data.match_id);
                    clearInterval(this.pollingInterval);
                    this.showSwipe(data);
                }
            })
            .catch(e => console.error('Poll error:', e));
        }, 2000);
    },
    
    // 🔥 ИСПРАВЛЕНО: передаём 4 параметра в Swipe.startWithOpponent
    showSwipe(data) {
        this.isSearching = false;
        if (typeof Swipe !== 'undefined') {
            // Передаём 4 параметра: opponent, matchId, expiresAt, serverTime (null)
            Swipe.startWithOpponent(data.opponent, data.match_id, data.expires_at, null);
        } else {
            App.showScreen('mainScreen', true);
        }
    },
    
    startTimer() {
        this.seconds = 0;
        this.timerInterval = setInterval(() => {
            this.seconds++;
            const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
            const s = (this.seconds % 60).toString().padStart(2, '0');
            const timer = document.getElementById('searchTimer');
            if (timer) timer.textContent = `${m}:${s}`;
        }, 1000);
    },
    
    resetTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.seconds = 0;
        const timer = document.getElementById('searchTimer');
        if (timer) timer.textContent = '00:00';
    },
    
    cancel() {
        this.resetTimer();
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.isSearching = false;
        
        fetch('https://matk91589-dev-pingster-backend-cee8.twc1.net/api/search/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: this.getTelegramId() })
        });
        
        App.showScreen('mainScreen', true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Search = Search;
    Search.init();
});

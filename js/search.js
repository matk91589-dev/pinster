// ============================================
// ПОИСК - v2.7 FINAL (ПРЯМОЙ ВЫЗОВ)
// ============================================

console.log('🔥 SEARCH.JS ЗАГРУЖЕН (v2.7 FINAL)');

const SEARCH_VALIDATION = {
    FACEIT: { min: 0, max: 5000 },
    PREMIER: { min: 0, max: 40000 },
    AGE: { min: 0, max: 100 }
};

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
        
        // ПРЯМО ПРИ СТАРТЕ ЗАПОЛНЯЕМ ВСЕ ЭКРАНЫ
        setTimeout(() => {
            console.log('📋 Принудительное заполнение всех экранов');
            this.fillFaceitScreen();
            this.fillPremierScreen();
            this.fillPrimeScreen();
            this.fillPublicScreen();
        }, 500);
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
        const age = localStorage.getItem('profile_age') || '';
        const steam = localStorage.getItem('profile_steam') || '';
        const faceit = localStorage.getItem('profile_faceit') || '';
        console.log('📦 getProfileData:', { age, steam, faceit });
        return { age, steam, faceit };
    },
    
    fillFaceitScreen() {
        const profile = this.getProfileData();
        console.log('🎯 FACEIT заполнение:', profile);
        
        const ageInput = document.getElementById('faceitAgeValue');
        const faceitInput = document.getElementById('faceitLinkInput');
        
        if (ageInput && profile.age) {
            ageInput.value = profile.age;
            console.log('✅ faceitAgeValue =', profile.age);
        }
        if (faceitInput && profile.faceit) {
            faceitInput.value = profile.faceit;
            console.log('✅ faceitLinkInput =', profile.faceit);
        }
        
        this.setupValidation('FACEIT');
    },
    
    fillPremierScreen() {
        const profile = this.getProfileData();
        console.log('🎯 PREMIER заполнение:', profile);
        
        const ageInput = document.getElementById('premierAgeValue');
        const steamInput = document.getElementById('premierSteamInput');
        
        if (ageInput && profile.age) {
            ageInput.value = profile.age;
            console.log('✅ premierAgeValue =', profile.age);
        }
        if (steamInput && profile.steam) {
            steamInput.value = profile.steam;
            console.log('✅ premierSteamInput =', profile.steam);
        }
        
        this.setupValidation('PREMIER');
    },
    
    fillPrimeScreen() {
        const profile = this.getProfileData();
        console.log('🎯 PRIME заполнение:', profile);
        
        const ageInput = document.getElementById('primeAgeValue');
        const steamInput = document.getElementById('primeSteamInput');
        
        if (ageInput && profile.age) {
            ageInput.value = profile.age;
            console.log('✅ primeAgeValue =', profile.age);
        }
        if (steamInput && profile.steam) {
            steamInput.value = profile.steam;
            console.log('✅ primeSteamInput =', profile.steam);
        }
        
        this.setupValidation('PRIME');
    },
    
    fillPublicScreen() {
        const profile = this.getProfileData();
        console.log('🎯 PUBLIC заполнение:', profile);
        
        const ageInput = document.getElementById('publicAgeValue');
        const steamInput = document.getElementById('publicSteamInput');
        
        if (ageInput && profile.age) {
            ageInput.value = profile.age;
            console.log('✅ publicAgeValue =', profile.age);
        }
        if (steamInput && profile.steam) {
            steamInput.value = profile.steam;
            console.log('✅ publicSteamInput =', profile.steam);
        }
        
        this.setupValidation('PUBLIC');
    },
    
    validateAge(age) {
        if (!age || age === '') return true;
        const ageNum = parseInt(age, 10);
        return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 100;
    },
    
    validateRating(rating, mode) {
        if (!rating || rating === '') return true;
        const ratingNum = parseInt(rating, 10);
        const max = mode === 'FACEIT' ? 5000 : 40000;
        return !isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= max;
    },
    
    validateRank(rank) {
        return rank && rank !== '' && rank !== 'Выберите ранг';
    },
    
    setupValidation(mode) {
        let ageInput, ratingInput, rankSelect;
        
        if (mode === 'FACEIT') {
            ageInput = document.getElementById('faceitAgeValue');
            ratingInput = document.getElementById('faceitELOInput');
        } else if (mode === 'PREMIER') {
            ageInput = document.getElementById('premierAgeValue');
            ratingInput = document.getElementById('premierRatingInput');
        } else if (mode === 'PRIME') {
            ageInput = document.getElementById('primeAgeValue');
            rankSelect = document.getElementById('primeRankSelect');
        } else if (mode === 'PUBLIC') {
            ageInput = document.getElementById('publicAgeValue');
            rankSelect = document.getElementById('publicRankSelect');
        }
        
        if (ageInput) {
            ageInput.oninput = () => {
                const valid = this.validateAge(ageInput.value);
                ageInput.style.color = (!valid && ageInput.value) ? '#FF3B30' : '';
                ageInput.style.borderColor = (!valid && ageInput.value) ? '#FF3B30' : '';
            };
        }
        
        if (ratingInput) {
            ratingInput.oninput = () => {
                const valid = this.validateRating(ratingInput.value, mode);
                ratingInput.style.color = (!valid && ratingInput.value) ? '#FF3B30' : '';
                ratingInput.style.borderColor = (!valid && ratingInput.value) ? '#FF3B30' : '';
            };
        }
        
        if (rankSelect) {
            rankSelect.onchange = () => {
                const valid = this.validateRank(rankSelect.value);
                rankSelect.style.color = !valid ? '#FF3B30' : '';
                rankSelect.style.borderColor = !valid ? '#FF3B30' : '';
            };
        }
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
        
        // Проверяем форму
        let isValid = true;
        
        if (mode === 'FACEIT') {
            const age = document.getElementById('faceitAgeValue')?.value;
            const rating = document.getElementById('faceitELOInput')?.value;
            if (!age || !this.validateAge(age)) isValid = false;
            if (!rating || !this.validateRating(rating, 'FACEIT')) isValid = false;
        } else if (mode === 'PREMIER') {
            const age = document.getElementById('premierAgeValue')?.value;
            const rating = document.getElementById('premierRatingInput')?.value;
            if (!age || !this.validateAge(age)) isValid = false;
            if (!rating || !this.validateRating(rating, 'PREMIER')) isValid = false;
        } else if (mode === 'PRIME') {
            const age = document.getElementById('primeAgeValue')?.value;
            const rank = document.getElementById('primeRankSelect')?.value;
            if (!age || !this.validateAge(age)) isValid = false;
            if (!rank || !this.validateRank(rank)) isValid = false;
        } else if (mode === 'PUBLIC') {
            const age = document.getElementById('publicAgeValue')?.value;
            const rank = document.getElementById('publicRankSelect')?.value;
            if (!age || !this.validateAge(age)) isValid = false;
            if (!rank || !this.validateRank(rank)) isValid = false;
        }
        
        if (!isValid) {
            console.log('❌ Форма невалидна');
            if (typeof Profile !== 'undefined' && Profile.showToast) {
                Profile.showToast('Исправьте ошибки в полях', true);
            } else {
                App.showAlert('Исправьте ошибки в полях');
            }
            return;
        }
        
        console.log('✅ Запуск поиска');
        this.currentMode = mode;
        this.isSearching = true;
        
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
    
    showSwipe(data) {
        this.isSearching = false;
        if (typeof Swipe !== 'undefined') {
            Swipe.startWithOpponent(data.opponent, data.match_id, data.expires_at);
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

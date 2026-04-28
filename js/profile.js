// ============================================
// ПРОФИЛЬ - v4.0 (Pingster v2.0)
// ============================================

console.log('🔥 PROFILE.JS ЗАГРУЖЕН (v4.0)');

const VALIDATION = {
    NICK: { min: 2, max: 10, pattern: /^[a-zA-Z0-9_]+$/, error: 'неверный ввод', hint: '2-10 лат. букв, цифр, _' },
    AGE: { min: 0, max: 100, error: 'неверный ввод' },
    STEAM: { patterns: [/^https:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/, /^https:\/\/s\.team\/[a-zA-Z0-9_-]+\/?$/], maxLength: 100, error: 'неверный ввод' },
    FACEIT: { pattern: /^https:\/\/www\.faceit\.com\/[a-z]{2}\/players\/[a-zA-Z0-9_-]+\/?$/, maxLength: 100, error: 'неверный ввод' }
};

const Profile = {
    editMode: false,
    savedName: '-',
    savedAvatar: '<div class="tg-avatar-svg"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#ffffff"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff"/></svg></div>',
    savedAge: '', savedSteam: '', savedFaceitLink: '', savedAvatarUrl: null, savedRating: 0,
    tempName: '-', tempAge: '', tempSteam: '', tempFaceitLink: '',
    telegramId: null, playerId: null, toastTimeout: null,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    isLoading: false, isProfileLoaded: false, isInitialized: false, screenObserver: null,
    validationErrors: { nick: false, age: false, steam: false, faceit: false },

    delay(ms) { return new Promise(r => setTimeout(r, ms)); },

    updateRatingDisplay() {
        const el = document.getElementById('ratingValue');
        if (!el) return;
        const r = this.savedRating || 0;
        el.value = (r > 0 ? '+' : '') + r;
        el.style.color = r > 0 ? '#4CAF50' : r < 0 ? '#FF3B30' : '';
    },

    validateNick(nick) { return nick && nick.length >= VALIDATION.NICK.min && nick.length <= VALIDATION.NICK.max && VALIDATION.NICK.pattern.test(nick) ? { valid: true } : { valid: false }; },
    validateAge(age) { if (!age && age !== 0) return { valid: true }; const n = parseInt(age); return isNaN(n) || n < 0 || n > 100 ? { valid: false } : { valid: true, value: n }; },
    validateSteamLink(link) { if (!link || !link.trim()) return { valid: true }; if (link.length > VALIDATION.STEAM.maxLength) return { valid: false }; const t = link.trim().replace(/\/$/,''); return { valid: VALIDATION.STEAM.patterns.some(p => p.test(t)), value: t }; },
    validateFaceitLink(link) { if (!link || !link.trim()) return { valid: true }; if (link.length > VALIDATION.FACEIT.maxLength) return { valid: false }; const t = link.trim().replace(/\/$/,''); return { valid: VALIDATION.FACEIT.pattern.test(t), value: t }; },

    getTelegramId() {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.id) return tg.initDataUnsafe.user.id;
        return new URLSearchParams(window.location.search).get('tg_id');
    },

    showToast(message, isError = false) {
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        const old = document.querySelector('.profile-toast'); if (old) old.remove();
        const toast = document.createElement('div'); toast.className = 'profile-toast';
        toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-100px);background:${isError?'rgba(255,59,48,0.95)':'rgba(0,0,0,0.85)'};backdrop-filter:blur(10px);color:white;padding:10px 16px;border-radius:30px;font-size:13px;font-weight:500;z-index:10000;transition:transform 0.3s;text-align:center;max-width:calc(100vw-40px);min-width:200px;line-height:1.4;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.3);`;
        toast.textContent = message; document.body.appendChild(toast); toast.offsetHeight;
        toast.style.transform = 'translateX(-50%) translateY(0)';
        this.toastTimeout = setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(-100px)'; setTimeout(() => toast.remove(), 300); }, isError ? 2500 : 2000);
    },

    updateFieldError(fieldId, hasError) {
        const label = document.querySelector(`[data-field="${fieldId}"]`);
        const input = document.getElementById(fieldId);
        if (label) { const base = label.getAttribute('data-label'); label.innerHTML = hasError ? `${base} <span style="color:#FF3B30;font-weight:400;">*${VALIDATION[fieldId==='ageValue'?'AGE':(fieldId==='steamDisplay'?'STEAM':'FACEIT')].error}</span>` : base; }
        if (input) { if (hasError) { input.style.color = '#FF3B30'; input.style.borderColor = '#FF3B30'; } else { input.style.color = ''; input.style.borderColor = ''; } }
    },

    validateOnInput() {
        if (!this.editMode) return;
        const age = document.getElementById('ageValue'), steam = document.getElementById('steamDisplay'), faceit = document.getElementById('faceitLinkDisplay');
        if (age) { const v = this.validateAge(age.value); this.validationErrors.age = !v.valid; this.updateFieldError('ageValue', !v.valid); }
        if (steam) { const v = this.validateSteamLink(steam.value); this.validationErrors.steam = !v.valid && steam.value.trim() !== ''; this.updateFieldError('steamDisplay', this.validationErrors.steam); }
        if (faceit) { const v = this.validateFaceitLink(faceit.value); this.validationErrors.faceit = !v.valid && faceit.value.trim() !== ''; this.updateFieldError('faceitLinkDisplay', this.validationErrors.faceit); }
        this.tempAge = age?.value || ''; this.tempSteam = steam?.value || ''; this.tempFaceitLink = faceit?.value || '';
    },

    updateLinksWithCopy() {
        [['steamDisplay', 'savedSteam'], ['faceitLinkDisplay', 'savedFaceitLink']].forEach(([id, saved]) => {
            const inp = document.getElementById(id); if (!inp) return;
            const old = inp.parentNode.querySelector('.link-with-copy'); if (old) old.remove();
            const wrap = document.createElement('div'); wrap.className = 'link-with-copy';
            inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
            const btn = document.createElement('button'); btn.className = 'copy-btn'; btn.type = 'button';
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#ffffff" stroke-width="2" fill="none"/></svg>';
            btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(inp.value || this[saved] || '').then(() => { btn.classList.add('copied'); setTimeout(() => btn.classList.remove('copied'), 1000); }).catch(() => {}); };
            wrap.appendChild(btn);
        });
    },

    updatePlayerIdDisplay() {
        const el = document.querySelector('.profile-name-label');
        if (el && this.playerId) { el.textContent = `ID: ${this.playerId}`; el.style.cssText = 'font-size:11px;color:#FF5500;font-weight:600;letter-spacing:0.5px;margin-bottom:2px;'; }
    },

    async loadProfileFromServer() {
        if (this.isLoading) return; this.isLoading = true;
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) { this.isLoading = false; return; }
        try {
            const [initR, profR, ratingR] = await Promise.all([
                fetch(`${this.BACKEND_URL}/api/user/init`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegram_id:this.telegramId}) }),
                fetch(`${this.BACKEND_URL}/api/profile/get`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegram_id:this.telegramId}) }),
                fetch(`${this.BACKEND_URL}/api/user/rating`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegram_id:this.telegramId}) })
            ]);
            if (initR.ok) { const d = await initR.json(); if (d.status === 'ok') { this.playerId = d.player_id; this.updatePlayerIdDisplay(); } }
            if (profR.ok) { const d = await profR.json(); if (d.status === 'ok') { this.savedName = d.nick || '-'; this.savedAge = d.age || ''; this.savedSteam = d.steam_link || ''; this.savedFaceitLink = d.faceit_link || ''; this.tempName = this.savedName; this.tempAge = this.savedAge; this.tempSteam = this.savedSteam; this.tempFaceitLink = this.savedFaceitLink; ['nick','age','steam','faceit'].forEach(k => localStorage.setItem(`profile_${k}`, this[`saved${k[0].toUpperCase()+k.slice(1)}`] || '')); this.updateDisplay(); this.isProfileLoaded = true; } }
            if (ratingR.ok) { const d = await ratingR.json(); if (d.status === 'ok') { this.savedRating = d.rating; localStorage.setItem('user_rating', d.rating); this.updateRatingDisplay(); } }
        } catch (e) { console.error('Ошибка загрузки профиля:', e); } finally { this.isLoading = false; }
    },

    loadAvatar() {
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) return;
        fetch(`${this.BACKEND_URL}/api/profile/avatar`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegram_id:this.telegramId}) })
        .then(r => r.json()).then(d => {
            if (d.status === 'ok' && d.avatar && d.avatar !== 'null') { this.savedAvatarUrl = d.avatar; localStorage.setItem('profile_avatar', d.avatar); }
            else { this.savedAvatarUrl = null; localStorage.removeItem('profile_avatar'); }
            this.updateAvatarDisplay();
        }).catch(() => {});
    },

    updateAvatarDisplay() {
        const div = document.getElementById('profileAvatar'); if (!div) return;
        const url = localStorage.getItem('profile_avatar') || this.savedAvatarUrl;
        if (url && url !== 'null' && url !== '') {
            const isB64 = url.startsWith('data:image');
            div.innerHTML = ''; const img = document.createElement('img');
            img.src = isB64 ? url : `${url}?t=${Date.now()}`; img.alt = 'avatar';
            img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';
            img.onerror = () => { div.innerHTML = this.savedAvatar; };
            div.appendChild(img);
        } else { div.innerHTML = this.savedAvatar; }
    },

    saveAvatarToServer(base64Image) {
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) { this.showToast('Ошибка: нет Telegram ID', true); return; }
        fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({telegram_id:this.telegramId, avatar_url:base64Image}) })
        .then(r => r.json()).then(d => {
            if (d.status === 'ok') { this.savedAvatarUrl = base64Image; localStorage.setItem('profile_avatar', base64Image); this.updateAvatarDisplay(); this.showToast('Аватар обновлён'); }
            else this.showToast('Ошибка сохранения', true);
        }).catch(() => this.showToast('Ошибка сохранения', true));
    },

    updateDisplay() {
        const nameEl = document.getElementById('profileName'); if (nameEl) nameEl.textContent = this.editMode ? this.tempName : this.savedName;
        const ageEl = document.getElementById('ageValue'); if (ageEl) ageEl.value = this.editMode ? this.tempAge : this.savedAge;
        const steamEl = document.getElementById('steamDisplay'); if (steamEl) steamEl.value = this.editMode ? this.tempSteam : this.savedSteam;
        const faceitEl = document.getElementById('faceitLinkDisplay'); if (faceitEl) faceitEl.value = this.editMode ? this.tempFaceitLink : this.savedFaceitLink;
        this.updateAvatarDisplay(); this.updateRatingDisplay();
        setTimeout(() => this.updateLinksWithCopy(), 50);
    },

    forceExitEditMode() {
        if (!this.editMode) return; this.editMode = false;
        ['ageValue','steamDisplay','faceitLinkDisplay'].forEach(id => this.updateFieldError(id, false));
        this.tempName = this.savedName; this.tempAge = this.savedAge; this.tempSteam = this.savedSteam; this.tempFaceitLink = this.savedFaceitLink;
        this.validationErrors = { nick:false, age:false, steam:false, faceit:false };
        const ps = document.getElementById('profileScreen'); if (ps) ps.classList.remove('editable');
        const et = document.getElementById('editToggle'); if (et) et.classList.remove('active');
        const ab = document.getElementById('applyBtn'); if (ab) { ab.classList.remove('visible'); ab.style.display = 'none'; }
        ['ageValue','steamDisplay','faceitLinkDisplay'].forEach(id => { const el = document.getElementById(id); if (el) el.readOnly = true; });
        const pn = document.getElementById('profileName'); if (pn) pn.classList.remove('editable');
        const av = document.getElementById('profileAvatar'); if (av) av.classList.remove('editable-avatar');
        this.updateDisplay();
    },

    enterEditMode() {
        if (this.editMode) return; this.editMode = true;
        this.tempName = this.savedName; this.tempAge = this.savedAge; this.tempSteam = this.savedSteam; this.tempFaceitLink = this.savedFaceitLink;
        this.validationErrors = { nick:false, age:false, steam:false, faceit:false };
        ['ageValue','steamDisplay','faceitLinkDisplay'].forEach(id => this.updateFieldError(id, false));
        const ps = document.getElementById('profileScreen'); if (ps) ps.classList.add('editable');
        const et = document.getElementById('editToggle'); if (et) et.classList.add('active');
        const ab = document.getElementById('applyBtn'); if (ab) { ab.classList.add('visible'); ab.style.display = 'inline-block'; ab.style.pointerEvents = 'auto'; ab.style.opacity = '1'; }
        document.getElementById('ageValue').readOnly = false; document.getElementById('ageValue').maxLength = 3;
        const si = document.getElementById('steamDisplay'); si.readOnly = false; si.maxLength = VALIDATION.STEAM.maxLength;
        const fi = document.getElementById('faceitLinkDisplay'); fi.readOnly = false; fi.maxLength = VALIDATION.FACEIT.maxLength;
        document.getElementById('profileName').classList.add('editable');
        document.getElementById('profileAvatar').classList.add('editable-avatar');
        this.updateDisplay(); this.showToast('Режим редактирования');
    },

    toggleEditMode() { this.editMode ? this.forceExitEditMode() : this.enterEditMode(); },

    async applyChanges() {
        const ab = document.getElementById('applyBtn');
        if (!this.telegramId) this.telegramId = this.getTelegramId();
        if (!this.telegramId) { this.showToast('Ошибка: нет Telegram ID', true); return; }
        if (Object.values(this.validationErrors).some(v => v)) { this.showToast('Исправьте ошибки', true); return; }
        const upd = { telegram_id: this.telegramId };
        if (this.tempName !== this.savedName && this.tempName !== '-') upd.nick = this.tempName;
        const newAge = document.getElementById('ageValue')?.value || '';
        if (newAge !== this.savedAge) { const v = this.validateAge(newAge); if (v.valid) upd.age = v.value || null; }
        const newSteam = document.getElementById('steamDisplay')?.value || '';
        if (newSteam !== this.savedSteam) { const v = this.validateSteamLink(newSteam); if (v.valid) upd.steam_link = v.value || null; }
        const newFaceit = document.getElementById('faceitLinkDisplay')?.value || '';
        if (newFaceit !== this.savedFaceitLink) { const v = this.validateFaceitLink(newFaceit); if (v.valid) upd.faceit_link = v.value || null; }
        if (Object.keys(upd).length === 1) { this.forceExitEditMode(); this.showToast('Нет изменений'); return; }
        if (ab) { ab.style.pointerEvents = 'none'; ab.style.opacity = '0.5'; }
        try {
            const res = await fetch(`${this.BACKEND_URL}/api/profile/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(upd) });
            const data = await res.json();
            if (res.ok && data.status === 'ok') {
                if (upd.nick) this.savedName = upd.nick; if (upd.age !== undefined) this.savedAge = upd.age || ''; if (upd.steam_link !== undefined) this.savedSteam = upd.steam_link || ''; if (upd.faceit_link !== undefined) this.savedFaceitLink = upd.faceit_link || '';
                ['nick','age','steam','faceit'].forEach(k => localStorage.setItem(`profile_${k}`, this[`saved${k[0].toUpperCase()+k.slice(1)}`] || ''));
                this.forceExitEditMode(); this.showToast('Профиль сохранен');
            } else this.showToast(data.error || 'Ошибка сохранения', true);
        } catch (e) { this.showToast('Ошибка сохранения', true); }
        finally { if (ab) { ab.style.pointerEvents = 'auto'; ab.style.opacity = '1'; } }
    },

    editName() {
        if (!this.editMode) { this.showToast('Для изменений\nперейдите в режим редактирования', true); return; }
        this.showToast(VALIDATION.NICK.hint);
        const pn = document.getElementById('profileName'); if (!pn) return;
        const cur = this.tempName === '-' ? '' : this.tempName;
        const inp = document.createElement('input'); inp.type = 'text'; inp.value = cur; inp.placeholder = 'ник'; inp.maxLength = VALIDATION.NICK.max;
        inp.style.cssText = 'background:#1A1D24;border:1px solid #FF5500;border-radius:6px;color:#FF5500;font-size:15px;font-weight:600;padding:4px 8px;width:130px;outline:none;font-family:inherit;display:inline-block;margin-left:4px;';
        const parent = pn.parentNode; pn.style.display = 'none'; parent.insertBefore(inp, pn.nextSibling); inp.focus();
        const save = () => { const v = this.validateNick(inp.value.trim()); this.validationErrors.nick = !v.valid; if (v.valid) { this.tempName = inp.value.trim(); pn.textContent = this.tempName; } else this.showToast(`Ник: ${VALIDATION.NICK.hint}`, true); inp.remove(); pn.style.display = 'inline-block'; };
        inp.addEventListener('blur', save, { once: true }); inp.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
    },

    editAge() { if (!this.editMode) { this.showToast('Для изменений\nперейдите в режим редактирования', true); return; } const el = document.getElementById('ageValue'); if (el) { el.focus(); el.select(); } },
    editSteam() { if (!this.editMode) { this.showToast('Для изменений\nперейдите в режим редактирования', true); return; } const el = document.getElementById('steamDisplay'); if (el) { el.focus(); el.select(); } },
    editFaceitLink() { if (!this.editMode) { this.showToast('Для изменений\nперейдите в режим редактирования', true); return; } const el = document.getElementById('faceitLinkDisplay'); if (el) { el.focus(); el.select(); } },

    setupClickHandlers() {
        const av = document.getElementById('profileAvatar'); if (av) { av.style.cursor = 'pointer'; av.onclick = () => { if (this.editMode) { if (window.Avatar?.select) Avatar.select(); } else this.showToast('Для изменений\nперейдите в режим редактирования', true); }; av.ondblclick = () => { this.savedAvatarUrl = null; localStorage.removeItem('profile_avatar'); this.loadAvatar(); this.showToast('Кэш аватара сброшен'); }; }
        const pn = document.getElementById('profileName'); if (pn) { pn.style.cursor = 'pointer'; pn.onclick = () => this.editName(); }
        ['ageValue','steamDisplay','faceitLinkDisplay'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => this.validateOnInput()); });
        document.getElementById('ageValue').maxLength = 3; document.getElementById('steamDisplay').maxLength = VALIDATION.STEAM.maxLength; document.getElementById('faceitLinkDisplay').maxLength = VALIDATION.FACEIT.maxLength;
        const et = document.getElementById('editToggle'); if (et) et.onclick = (e) => { e.preventDefault(); this.toggleEditMode(); };
        const ab = document.getElementById('applyBtn'); if (ab) ab.onclick = (e) => { e.preventDefault(); this.applyChanges(); };
    },

    setupScreenObserver() {
        const ps = document.getElementById('profileScreen'); if (!ps) return;
        if (this.screenObserver) this.screenObserver.disconnect();
        this.screenObserver = new MutationObserver(mutations => { mutations.forEach(m => { if (m.type === 'attributes' && m.attributeName === 'class' && !ps.classList.contains('active') && this.editMode) this.forceExitEditMode(); }); });
        this.screenObserver.observe(ps, { attributes: true, attributeFilter: ['class'] });
    },

    init() {
        if (this.isInitialized) return; this.isInitialized = true;
        console.log('🚀 Profile.init() v4.0');
        this.telegramId = this.getTelegramId();
        this.tempName = this.savedName; this.tempAge = this.savedAge; this.tempSteam = this.savedSteam; this.tempFaceitLink = this.savedFaceitLink;
        this.loadProfileFromServer().then(() => { this.loadAvatar(); });
        this.setupClickHandlers(); this.updateLinksWithCopy();
        setTimeout(() => this.setupScreenObserver(), 200);
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Profile.init());
else Profile.init();
window.Profile = Profile;

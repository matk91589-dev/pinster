// ============================================
// АВАТАР - v2.1 (Полный экран + Drag & Drop)
// ============================================

const Avatar = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    MAX_AVATAR_SIZE: 50 * 1024,
    isPickerOpen: false,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',

    // 🔥 КЛИК ПО АВАТАРКЕ — ОТКРЫТЬ В ПОЛНЫЙ ЭКРАН
    view() {
        const avatarUrl = localStorage.getItem('profile_avatar') || Profile?.savedAvatarUrl || null;

        if (!avatarUrl) {
            if (Profile?.showToast) Profile.showToast('Аватар не установлен', true);
            return;
        }

        // Оверлей с затемнением (как в играх)
        const overlay = document.createElement('div');
        overlay.className = 'avatar-fullscreen-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.88);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: avatarFadeIn 0.2s ease;
        `;

        // Крестик (SVG)
        const closeBtn = document.createElement('div');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100001;
            transition: all 0.2s ease;
        `;
        closeBtn.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9V5a1 1 0 0 1 1-1h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M20 9V5a1 1 0 0 0-1-1h-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M4 15v4a1 1 0 0 0 1 1h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M20 15v4a1 1 0 0 1-1 1h-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M7 7L17 17" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                <path d="M17 7L7 17" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;

        // Ховер на крестик
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(255, 85, 0, 0.5)';
            closeBtn.style.transform = 'scale(1.05)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.08)';
            closeBtn.style.transform = 'scale(1)';
        };

        // Изображение
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.cssText = `
            max-width: 92vw;
            max-height: 92vh;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            animation: avatarZoomIn 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        `;

        overlay.appendChild(closeBtn);
        overlay.appendChild(img);
        document.body.appendChild(overlay);

        // Закрытие
        const close = () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s';
            setTimeout(() => overlay.remove(), 200);
        };

        closeBtn.onclick = (e) => {
            e.stopPropagation();
            close();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay || e.target === img) close();
        };

        // Анимации
        if (!document.querySelector('#avatar-fullscreen-style')) {
            const style = document.createElement('style');
            style.id = 'avatar-fullscreen-style';
            style.textContent = `
                @keyframes avatarFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes avatarZoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // 🔥 ВЫБОР АВАТАРА (РЕЖИМ РЕДАКТИРОВАНИЯ)
    select() {
        if (!Profile?.editMode) {
            if (Profile?.showToast) Profile.showToast('Для изменений перейдите в режим редактирования', true);
            return;
        }

        if (this.isPickerOpen) return;
        this.openFilePicker();
    },

    openFilePicker() {
        this.isPickerOpen = true;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.onchange = (e) => {
            this.isPickerOpen = false;
            const file = e.target.files[0];
            if (file) this.handleFile(file);
            fileInput.remove();
        };

        fileInput.oncancel = () => {
            this.isPickerOpen = false;
            fileInput.remove();
        };

        fileInput.click();
    },

    async compressImage(base64, maxSize = this.MAX_AVATAR_SIZE) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 300;

                if (width > height && width > maxDim) {
                    height = (height * maxDim) / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width = (width * maxDim) / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.7;
                let result = canvas.toDataURL('image/jpeg', quality);

                while (result.length > maxSize && quality > 0.3) {
                    quality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(result);
            };
            img.src = base64;
        });
    },

    async handleFile(file) {
        if (!file) return;

        if (file.size > this.MAX_FILE_SIZE) {
            Profile?.showToast?.('Файл слишком большой! Максимум 5MB', true);
            return;
        }

        if (!file.type.startsWith('image/')) {
            Profile?.showToast?.('Можно загружать только изображения', true);
            return;
        }

        Profile?.showToast?.('Сжатие и загрузка...');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const compressedBase64 = await this.compressImage(e.target.result);

            const avatarDiv = document.getElementById('profileAvatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = `<img src="${compressedBase64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">`;
            }

            await this.saveAvatarToServer(compressedBase64);
        };
        reader.readAsDataURL(file);
    },

    async saveAvatarToServer(base64Image) {
        const telegramId = Profile?.telegramId || Profile?.getTelegramId?.();

        if (!telegramId) {
            Profile?.showToast?.('Ошибка: нет Telegram ID', true);
            return;
        }

        const payloads = [
            { avatar: base64Image },
            { avatar_url: base64Image },
            { image: base64Image },
            { data: base64Image },
        ];

        for (const payload of payloads) {
            try {
                const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_id: String(telegramId), ...payload })
                });
                const data = await response.json();
                if (data.status === 'ok') {
                    this.onSaveSuccess(base64Image);
                    return;
                }
            } catch (e) {}
        }

        Profile?.showToast?.('Ошибка сохранения аватара', true);
    },

    onSaveSuccess(base64Image) {
        if (Profile) {
            Profile.savedAvatarUrl = base64Image;
        }
        localStorage.setItem('profile_avatar', base64Image);
        Profile?.showToast?.('Аватар обновлён!');

        setTimeout(() => {
            Profile?.updateAvatarDisplay?.();
        }, 100);
    },

    setupDragAndDrop() {
        const avatarDiv = document.getElementById('profileAvatar');
        if (!avatarDiv) return;

        avatarDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            avatarDiv.style.border = '3px dashed #FF6B4A';
        });

        avatarDiv.addEventListener('dragleave', () => {
            avatarDiv.style.border = '';
        });

        avatarDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            avatarDiv.style.border = '';

            if (!Profile?.editMode) {
                Profile?.showToast?.('Для изменений перейдите в режим редактирования', true);
                return;
            }

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Avatar.setupDragAndDrop();
});

window.Avatar = Avatar;

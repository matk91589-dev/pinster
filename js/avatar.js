// ============================================
// АВАТАР - v2.0 (Полный экран + Drag & Drop)
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

        // Создаём оверлей
        const overlay = document.createElement('div');
        overlay.className = 'avatar-fullscreen-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: avatarFadeIn 0.25s ease;
        `;

        // Крестик
        const closeBtn = document.createElement('div');
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100001;
            font-size: 20px;
            color: #fff;
            font-weight: 300;
            transition: background 0.2s;
        `;
        closeBtn.textContent = '✕';
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 85, 0, 0.6)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.12)';

        // Изображение
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.cssText = `
            max-width: 90vw;
            max-height: 90vh;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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

        closeBtn.onclick = close;
        overlay.onclick = (e) => {
            if (e.target === overlay) close();
        };

        // Анимация появления
        if (!document.querySelector('#avatar-fullscreen-style')) {
            const style = document.createElement('style');
            style.id = 'avatar-fullscreen-style';
            style.textContent = `
                @keyframes avatarFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

            // Обновляем отображение сразу
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

// ============================================
// ЗАГРУЗКА АВАТАРКИ (Telegram Mini App версия) - ФИНАЛ
// ============================================

const Avatar = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_AVATAR_SIZE: 50 * 1024, // 50 KB после сжатия
    isPickerOpen: false,
    BACKEND_URL: 'https://matk91589-dev-pingster-backend-cee8.twc1.net',
    
    select() {
        if (!Profile.editMode) {
            if (Profile.showToast) {
                Profile.showToast('Для изменений перейдите в режим редактирования', true);
            }
            return;
        }
        
        if (this.isPickerOpen) {
            console.log('Проводник уже открыт');
            return;
        }
        
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
            if (file) {
                this.handleFile(file);
            }
            fileInput.remove();
        };
        
        fileInput.oncancel = () => {
            this.isPickerOpen = false;
            fileInput.remove();
        };
        
        fileInput.click();
    },
    
    // СЖАТИЕ ИЗОБРАЖЕНИЯ
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
                
                console.log(`✅ Аватар сжат: ${(base64.length / 1024).toFixed(1)} KB → ${(result.length / 1024).toFixed(1)} KB`);
                resolve(result);
            };
            img.src = base64;
        });
    },
    
    async handleFile(file) {
        if (!file) return;
        
        if (file.size > this.MAX_FILE_SIZE) {
            if (Profile.showToast) {
                Profile.showToast('Файл слишком большой! Максимум 5MB', true);
            }
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            if (Profile.showToast) {
                Profile.showToast('Можно загружать только изображения', true);
            }
            return;
        }
        
        // Показываем загрузку
        if (Profile.showToast) {
            Profile.showToast('Сжатие и загрузка...');
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const originalBase64 = e.target.result;
            
            // СЖИМАЕМ
            const compressedBase64 = await this.compressImage(originalBase64);
            
            // ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ СРАЗУ
            const avatarDiv = document.getElementById('profileAvatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = `<img src="${compressedBase64}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;">`;
            }
            
            const startAvatar = document.getElementById('startAvatar');
            if (startAvatar) {
                startAvatar.innerHTML = `<img src="${compressedBase64}" style="width:100%; height:100%; object-fit:cover;">`;
            }
            
            // СОХРАНЯЕМ НА СЕРВЕР
            await this.saveAvatarToServer(compressedBase64);
        };
        reader.readAsDataURL(file);
    },
    
    // СОХРАНЕНИЕ НА СЕРВЕР (с перебором форматов)
    async saveAvatarToServer(base64Image) {
        const telegramId = Profile.telegramId || Profile.getTelegramId();
        
        if (!telegramId) {
            console.error('❌ Нет Telegram ID');
            if (Profile.showToast) {
                Profile.showToast('Ошибка: нет Telegram ID', true);
            }
            return;
        }
        
        console.log('💾 Отправка аватара на сервер...');
        
        // 🔥 Формат 1: avatar
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: String(telegramId),
                    avatar: base64Image
                })
            });
            
            const data = await response.json();
            console.log('📸 Ответ сервера (формат 1):', data);
            
            if (data.status === 'ok') {
                this.onSaveSuccess(base64Image);
                return;
            }
        } catch (e) {
            console.log('❌ Формат 1 не сработал:', e);
        }
        
        // 🔥 Формат 2: avatar_url
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: String(telegramId),
                    avatar_url: base64Image
                })
            });
            
            const data = await response.json();
            console.log('📸 Ответ сервера (формат 2):', data);
            
            if (data.status === 'ok') {
                this.onSaveSuccess(base64Image);
                return;
            }
        } catch (e) {
            console.log('❌ Формат 2 не сработал:', e);
        }
        
        // 🔥 Формат 3: image
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: String(telegramId),
                    image: base64Image
                })
            });
            
            const data = await response.json();
            console.log('📸 Ответ сервера (формат 3):', data);
            
            if (data.status === 'ok') {
                this.onSaveSuccess(base64Image);
                return;
            }
        } catch (e) {
            console.log('❌ Формат 3 не сработал:', e);
        }
        
        // 🔥 Формат 4: только base64 в теле
        try {
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: String(telegramId),
                    data: base64Image
                })
            });
            
            const data = await response.json();
            console.log('📸 Ответ сервера (формат 4):', data);
            
            if (data.status === 'ok') {
                this.onSaveSuccess(base64Image);
                return;
            }
        } catch (e) {
            console.log('❌ Формат 4 не сработал:', e);
        }
        
        // 🔥 Формат 5: через FormData
        try {
            const formData = new FormData();
            formData.append('telegram_id', String(telegramId));
            formData.append('avatar', base64Image);
            
            const response = await fetch(`${this.BACKEND_URL}/api/profile/avatar/update`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log('📸 Ответ сервера (формат 5 - FormData):', data);
            
            if (data.status === 'ok') {
                this.onSaveSuccess(base64Image);
                return;
            }
        } catch (e) {
            console.log('❌ Формат 5 не сработал:', e);
        }
        
        // Если ни один формат не сработал
        console.error('❌ Все форматы не сработали');
        if (Profile.showToast) {
            Profile.showToast('Ошибка: сервер не принимает аватар', true);
        }
    },
    
    // Успешное сохранение
    onSaveSuccess(base64Image) {
        console.log('✅ Аватар сохранён на сервере');
        
        Profile.savedAvatarUrl = base64Image;
        localStorage.setItem('profile_avatar', base64Image);
        
        if (Profile.showToast) {
            Profile.showToast('Аватар обновлён!');
        }
        
        // Принудительно обновляем отображение
        setTimeout(() => {
            if (Profile.updateAvatarDisplay) {
                Profile.updateAvatarDisplay();
            }
        }, 100);
    },
    
    setupDragAndDrop() {
        const avatarDiv = document.getElementById('profileAvatar');
        if (!avatarDiv) return;
        
        avatarDiv.removeEventListener('dragover', this.dragOverHandler);
        avatarDiv.removeEventListener('dragleave', this.dragLeaveHandler);
        avatarDiv.removeEventListener('drop', this.dropHandler);
        
        this.dragOverHandler = (e) => {
            e.preventDefault();
            avatarDiv.style.border = '3px dashed #FF6B4A';
        };
        
        this.dragLeaveHandler = () => {
            avatarDiv.style.border = '';
        };
        
        this.dropHandler = (e) => {
            e.preventDefault();
            avatarDiv.style.border = '';
            
            if (!Profile.editMode) {
                if (Profile.showToast) {
                    Profile.showToast('Для изменений перейдите в режим редактирования', true);
                }
                return;
            }
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        };
        
        avatarDiv.addEventListener('dragover', this.dragOverHandler);
        avatarDiv.addEventListener('dragleave', this.dragLeaveHandler);
        avatarDiv.addEventListener('drop', this.dropHandler);
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    Avatar.setupDragAndDrop();
});

window.Avatar = Avatar;

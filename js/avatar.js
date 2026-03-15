// ============================================
// ЗАГРУЗКА АВАТАРКИ (Telegram Mini App версия)
// ============================================

const Avatar = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    
    select() {
        if (!Profile.editMode) {
            if (Profile.showToast) {
                Profile.showToast('Для изменений перейдите в режим редактирования');
            }
            return;
        }
        
        // 👇 УБИРАЕМ СООБЩЕНИЕ И СРАЗУ ОТКРЫВАЕМ ПРОВОДНИК
        this.openFilePicker();
    },
    
    openFilePicker() {
        // Создаем скрытый input для загрузки файла
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
            fileInput.remove();
        };
        
        fileInput.click();
    },
    
    handleFile(file) {
        if (!file) return;
        
        if (file.size > this.MAX_FILE_SIZE) {
            if (Profile.showToast) {
                Profile.showToast('Файл слишком большой! Максимум 5MB');
            }
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            if (Profile.showToast) {
                Profile.showToast('Можно загружать только изображения');
            }
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarDiv = document.getElementById('profileAvatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
            
            const startAvatar = document.getElementById('startAvatar');
            if (startAvatar) {
                startAvatar.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            }
            
            // Сохраняем во временные данные профиля
            Profile.tempAvatarUrl = e.target.result;
            
            if (Profile.showToast) {
                Profile.showToast('Аватарка выбрана, сохраните профиль');
            }
        };
        reader.readAsDataURL(file);
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
            
            if (!Profile.editMode) {
                if (Profile.showToast) {
                    Profile.showToast('Для изменений перейдите в режим редактирования');
                }
                return;
            }
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    Avatar.setupDragAndDrop();
});

window.Avatar = Avatar;

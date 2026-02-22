// ============================================
// ЗАГРУЗКА АВАТАРКИ (Telegram Mini App версия)
// ============================================

const Avatar = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    
    select() {
        if (!Profile.editMode) {
            App.showAlert('Сначала активируйте режим редактирования (карандаш)');
            return;
        }
        
        // В Telegram Mini App нельзя напрямую загружать файлы
        // Показываем заглушку
        App.showPopup({
            title: 'Загрузка аватарки',
            message: 'Функция загрузки аватарки будет доступна в ближайшее время',
            buttons: [{ id: 'ok', type: 'ok', text: 'Понятно' }]
        });
        
        App.hapticFeedback('light');
    },
    
    handleFile(file) {
        if (!file) return;
        
        if (file.size > this.MAX_FILE_SIZE) {
            App.showAlert('Файл слишком большой! Максимум 5MB');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            App.showAlert('Можно загружать только изображения!');
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
            
            // Сохраняем в localStorage (временное решение)
            localStorage.setItem('pingster_avatar', e.target.result);
            
            Profile.tempAvatar = e.target.result;
            Profile.savedAvatar = e.target.result;
            
            App.showAlert('✅ Аватарка загружена');
            App.hapticFeedback('medium');
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
                App.showAlert('Сначала активируйте режим редактирования');
                return;
            }
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });
    }
};

window.Avatar = Avatar;

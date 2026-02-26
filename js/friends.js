/* ===== ПУСТЫЕ СОСТОЯНИЯ ===== */
.empty-friends {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: #9BA1B0;
    height: 100%;
    min-height: 200px;
}

.empty-friends-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #9BA1B0;
    height: 100%;
}

.empty-friends-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-friends-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
}

.empty-friends-hint {
    font-size: 14px;
    color: #5D6472;
}

/* ===== ДИАЛОГ ДОБАВЛЕНИЯ ДРУГА ===== */
.friend-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s;
    padding: 20px;
}

.friend-dialog.show {
    opacity: 1;
}

.friend-dialog-content {
    background: #1A1D24;
    border-radius: 16px;
    padding: 24px;
    max-width: 320px;
    width: 100%;
    border: 1px solid #2A2F3A;
    transform: scale(0.9);
    transition: transform 0.2s;
}

.friend-dialog.show .friend-dialog-content {
    transform: scale(1);
}

.friend-dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #F5F5F5;
    margin-bottom: 20px;
    text-align: center;
}

.friend-dialog-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 24px;
    padding: 12px;
    background: #111317;
    border-radius: 12px;
}

.friend-dialog-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #2A2F3A;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.friend-dialog-name {
    font-size: 16px;
    font-weight: 600;
    color: #F5F5F5;
    margin-bottom: 4px;
}

.friend-dialog-id {
    font-size: 14px;
    color: #FF5500;
}

.friend-dialog-buttons {
    display: flex;
    gap: 10px;
}

.friend-dialog-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.friend-dialog-btn.cancel {
    background: transparent;
    border: 1px solid #2A2F3A;
    color: #9BA1B0;
}

.friend-dialog-btn.cancel:hover {
    background: #2A2F3A;
}

.friend-dialog-btn.add {
    background: #FF5500;
    color: white;
}

.friend-dialog-btn.add:hover {
    background: #FF6B4A;
}

.friend-dialog-btn:disabled {
    opacity: 0.5;
    pointer-events: none;
}

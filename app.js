// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const firstName = urlParams.get('firstName') || 'Пользователь';
const hash = urlParams.get('hash') || 'xxxxyyyy';

// Элементы управления
const userNameEl = document.getElementById('user-name');
const lockStatusEl = document.getElementById('lock-status');
const actionBtn = document.getElementById('action-btn');
const nfcHintEl = document.getElementById('nfc-hint');
const hashEl = document.getElementById('connection-hash');

// Состояние замка
let isLocked = true;

// Инициализация
userNameEl.textContent = `Привет, ${firstName}!`;
hashEl.textContent = hash;

// Обработчик кнопки
actionBtn.addEventListener('click', () => {
    if (isLocked) {
        // Разблокировка
        isLocked = false;
        actionBtn.textContent = 'Открыть';
        actionBtn.classList.add('active');
        lockStatusEl.textContent = '🔓 Разблокирован';
        nfcHintEl.textContent = 'Готов к NFC';
        
        // Эмуляция NFC (реальная реализация через Web NFC API)
        setTimeout(() => {
            nfcHintEl.textContent = 'Ключ сохранён!';
        }, 800);
    } else {
        // Блокировка
        isLocked = true;
        actionBtn.textContent = 'Закрыть';
        actionBtn.classList.remove('active');
        lockStatusEl.textContent = '🔒 Заблокирован';
        nfcHintEl.textContent = 'Приложите телефон к замку';
    }
});

// Отправка данных на сервер при первом открытии (без проверки ответа)
if (urlParams.has('firstName')) {
    const userData = {
        name: firstName,
        tgId: tg.initDataUnsafe.user?.id || "unknown",
        hash: hash
    };
    
    fetch('http://192.168.1.128:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }).catch(() => { /* Игнорируем ошибки */ });
}
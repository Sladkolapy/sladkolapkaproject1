// Общие функции для работы с хранилищем
const storage = {
    set: (key, value) => {
        return new Promise((resolve, reject) => {
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.CloudStorage) {
                Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(value), (err) => {
                    if (err) reject(err);
                    else resolve();
                };
            } else {
                localStorage.setItem(key, JSON.stringify(value));
                resolve();
            }
        });
    },

    get: (key) => {
        return new Promise((resolve) => {
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.CloudStorage) {
                Telegram.WebApp.CloudStorage.getItem(key, (err, data) => {
                    resolve(err ? null : JSON.parse(data));
                });
            } else {
                resolve(JSON.parse(localStorage.getItem(key)));
            }
        });
    },

    remove: (key) => {
        return new Promise((resolve) => {
            if (window.Telegram && Telegram.WebApp && Telegram.WebApp.CloudStorage) {
                Telegram.WebApp.CloudStorage.removeItem(key, () => resolve());
            } else {
                localStorage.removeItem(key);
                resolve();
            }
        });
    }
};

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        return true;
    }
    return false;
}

// Для index.html
export async function initRegistrationPage() {
    initTelegramWebApp();
    
    const savedData = await storage.get('nfcLockUserData');
    if (savedData) {
        window.location.href = `control.html?firstName=${encodeURIComponent(savedData.firstName)}&hash=${savedData.hash}`;
        return;
    }

    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            middleName: document.getElementById('middle-name').value,
            hash: Math.random().toString(36).substr(2, 8)
        };

        await storage.set('nfcLockUserData', userData);
        window.location.href = `control.html?firstName=${encodeURIComponent(userData.firstName)}&hash=${userData.hash}`;
    });
}

// Для control.html
export async function initControlPage() {
    initTelegramWebApp();

    // Получаем данные из URL или хранилища
    const urlParams = new URLSearchParams(window.location.search);
    let firstName = urlParams.get('firstName');
    let hash = urlParams.get('hash');

    if (!firstName || !hash) {
        const savedData = await storage.get('nfcLockUserData');
        if (savedData) {
            firstName = savedData.firstName;
            hash = savedData.hash;
        }
    }

    // Обновляем интерфейс
    document.getElementById('user-name').textContent = `Привет, ${firstName || 'Пользователь'}!`;
    document.getElementById('connection-hash').textContent = hash || 'xxxxyyyy';

    // Логика кнопки замка
    let isLocked = true;
    document.getElementById('action-btn').addEventListener('click', () => {
        isLocked = !isLocked;
        const btn = document.getElementById('action-btn');
        const status = document.getElementById('lock-status');
        const hint = document.getElementById('nfc-hint');
        
        if (isLocked) {
            btn.textContent = 'Закрыть';
            btn.classList.remove('active');
            status.textContent = '🔒 Заблокирован';
            hint.textContent = 'Приложите телефон к замку';
        } else {
            btn.textContent = 'Открыть';
            btn.classList.add('active');
            status.textContent = '🔓 Разблокирован';
            hint.textContent = 'Готов к NFC';
            setTimeout(() => hint.textContent = 'Ключ сохранён!', 800);
        }
    });

    // Кнопка выхода
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await storage.remove('nfcLockUserData');
        window.location.href = 'index.html';
    });
}
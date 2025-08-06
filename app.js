// Универсальное хранилище (Telegram CloudStorage + localStorage fallback)
const storage = {
    setItem: async (key, value) => {
        try {
            if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
                return new Promise((resolve, reject) => {
                    Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(value), (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },

    getItem: async (key) => {
        try {
            if (window.Telegram?.WebApp?.CloudStorage?.getItem) {
                return new Promise((resolve) => {
                    Telegram.WebApp.CloudStorage.getItem(key, (err, data) => {
                        resolve(err ? null : JSON.parse(data));
                    });
                });
            }
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    removeItem: async (key) => {
        try {
            if (window.Telegram?.WebApp?.CloudStorage?.removeItem) {
                return new Promise((resolve) => {
                    Telegram.WebApp.CloudStorage.removeItem(key, () => resolve());
                });
            }
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage remove error:', e);
        }
    }
};

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    try {
        if (window.Telegram?.WebApp) {
            Telegram.WebApp.expand();
            Telegram.WebApp.enableClosingConfirmation();
            return true;
        }
    } catch (e) {
        console.error('Telegram WebApp init error:', e);
    }
    return false;
}

// Для страницы регистрации
export async function initRegistrationPage() {
    initTelegramWebApp();

    // Проверяем сохраненные данные
    const savedData = await storage.getItem('nfcLockUserData');
    if (savedData) {
        window.location.href = `control.html?firstName=${encodeURIComponent(savedData.firstName)}&hash=${savedData.hash}`;
        return;
    }

    // Обработчик формы
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                middleName: document.getElementById('middle-name').value,
                hash: Math.random().toString(36).slice(2, 10)
            };

            await storage.setItem('nfcLockUserData', userData);
            window.location.href = `control.html?firstName=${encodeURIComponent(userData.firstName)}&hash=${userData.hash}`;
        });
    }
}

// Для страницы управления
export async function initControlPage() {
    initTelegramWebApp();

    // Получаем данные из URL или хранилища
    const urlParams = new URLSearchParams(window.location.search);
    let userData = {
        firstName: urlParams.get('firstName'),
        hash: urlParams.get('hash')
    };

    if (!userData.firstName || !userData.hash) {
        const savedData = await storage.getItem('nfcLockUserData');
        if (savedData) {
            userData = savedData;
        }
    }

    // Обновляем интерфейс
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = `Привет, ${userData.firstName || 'Пользователь'}!`;
    }
    if (document.getElementById('connection-hash')) {
        document.getElementById('connection-hash').textContent = userData.hash || 'xxxxyyyy';
    }

    // Кнопка управления замком
    const actionBtn = document.getElementById('action-btn');
    const lockStatus = document.getElementById('lock-status');
    const nfcHint = document.getElementById('nfc-hint');
    
    let isLocked = true;
    if (actionBtn && lockStatus && nfcHint) {
        actionBtn.addEventListener('click', () => {
            isLocked = !isLocked;
            
            if (isLocked) {
                actionBtn.textContent = 'Закрыть';
                actionBtn.classList.remove('active');
                lockStatus.textContent = '🔒 Заблокирован';
                nfcHint.textContent = 'Приложите телефон к замку';
            } else {
                actionBtn.textContent = 'Открыть';
                actionBtn.classList.add('active');
                lockStatus.textContent = '🔓 Разблокирован';
                nfcHint.textContent = 'Готов к NFC';
                setTimeout(() => {
                    if (nfcHint) nfcHint.textContent = 'Ключ сохранён!';
                }, 800);
            }
        });
    }

    // Кнопка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await storage.removeItem('nfcLockUserData');
            window.location.href = 'index.html';
        });
    }
}
// Объект для работы с хранилищем
const appStorage = {
    setUserData: async (data) => {
        try {
            const jsonData = JSON.stringify(data);
            if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
                return new Promise((resolve) => {
                    Telegram.WebApp.CloudStorage.setItem('userData', jsonData, resolve);
                });
            }
            localStorage.setItem('userData', jsonData);
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    getUserData: async () => {
        try {
            if (window.Telegram?.WebApp?.CloudStorage?.getItem) {
                return new Promise((resolve) => {
                    Telegram.WebApp.CloudStorage.getItem('userData', (_, data) => {
                        resolve(data ? JSON.parse(data) : null);
                    });
                });
            }
            return JSON.parse(localStorage.getItem('userData'));
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },

    clear: async () => {
        try {
            if (window.Telegram?.WebApp?.CloudStorage?.removeItem) {
                return new Promise((resolve) => {
                    Telegram.WebApp.CloudStorage.removeItem('userData', resolve);
                });
            }
            localStorage.removeItem('userData');
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// Инициализация приложения
function initApp() {
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
    }
}

// Для страницы регистрации
export async function initRegistrationPage() {
    initApp();

    // Проверяем существующие данные
    const userData = await appStorage.getUserData();
    if (userData) {
        redirectToControlPage(userData);
        return;
    }

    // Обработка формы
    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newUserData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            middleName: document.getElementById('middle-name').value,
            hash: generateHash()
        };

        await appStorage.setUserData(newUserData);
        redirectToControlPage(newUserData);
    });
}

// Для страницы управления
export async function initControlPage() {
    initApp();

    // Получаем данные
    let userData = await getUserDataFromURL() || await appStorage.getUserData();
    
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    // Обновляем UI
    updateUI(userData);

    // Управление замком
    setupLockControls();

    // Кнопка выхода
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await appStorage.clear();
        window.location.href = 'index.html';
    });
}

// Вспомогательные функции
function generateHash() {
    return Math.random().toString(36).slice(2, 10);
}

function redirectToControlPage(userData) {
    window.location.href = `control.html?firstName=${encodeURIComponent(userData.firstName)}&hash=${userData.hash}`;
}

async function getUserDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    const firstName = params.get('firstName');
    const hash = params.get('hash');
    
    if (firstName && hash) {
        const userData = { firstName, hash };
        await appStorage.setUserData(userData);
        return userData;
    }
    return null;
}

function updateUI(userData) {
    document.getElementById('user-name').textContent = `Привет, ${userData.firstName || 'Пользователь'}!`;
    document.getElementById('connection-hash').textContent = userData.hash || 'xxxxyyyy';
}

function setupLockControls() {
    let isLocked = true;
    const actionBtn = document.getElementById('action-btn');
    const status = document.getElementById('lock-status');
    const hint = document.getElementById('nfc-hint');

    actionBtn.addEventListener('click', () => {
        isLocked = !isLocked;
        
        if (isLocked) {
            actionBtn.textContent = 'Закрыть';
            actionBtn.classList.remove('active');
            status.textContent = '🔒 Заблокирован';
            hint.textContent = 'Приложите телефон к замку';
        } else {
            actionBtn.textContent = 'Открыть';
            actionBtn.classList.add('active');
            status.textContent = '🔓 Разблокирован';
            hint.textContent = 'Готов к NFC';
            setTimeout(() => hint.textContent = 'Ключ сохранён!', 800);
        }
    });
}
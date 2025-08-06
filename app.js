// Простейшая реализация хранилища
const appStorage = {
    saveUser: (data) => {
        localStorage.setItem('nfcLockUser', JSON.stringify(data));
    },
    getUser: () => {
        const data = localStorage.getItem('nfcLockUser');
        return data ? JSON.parse(data) : null;
    },
    clearUser: () => {
        localStorage.removeItem('nfcLockUser');
    }
};

// Инициализация страницы регистрации
export function initRegistrationPage() {
    // Проверяем авторизацию
    const user = appStorage.getUser();
    if (user) {
        window.location.href = `control.html?name=${encodeURIComponent(user.name)}&hash=${user.hash}`;
        return;
    }

    // Обработка формы
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('first-name').value,
            hash: Math.random().toString(36).slice(2, 10)
        };

        appStorage.saveUser(userData);
        window.location.href = `control.html?name=${encodeURIComponent(userData.name)}&hash=${userData.hash}`;
    });
}

// Инициализация страницы управления
export function initControlPage() {
    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    let userName = params.get('name');
    let userHash = params.get('hash');

    // Если нет в URL, проверяем localStorage
    if (!userName || !userHash) {
        const user = appStorage.getUser();
        if (user) {
            userName = user.name;
            userHash = user.hash;
        } else {
            window.location.href = 'index.html';
            return;
        }
    }

    // Обновляем интерфейс
    document.getElementById('user-name').textContent = `Привет, ${userName || 'Друг'}!`;
    document.getElementById('connection-hash').textContent = userHash || 'xxxxyyyy';

    // Управление замком
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

    // Выход
    document.getElementById('logout-btn').addEventListener('click', () => {
        appStorage.clearUser();
        window.location.href = 'index.html';
    });
}
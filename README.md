# VibeMessenger

Полноценный мессенджер на HTML5 + CSS3 + JavaScript с Firebase Authentication и Firestore.

## � Начни отсюда: [QUICKSTART.md](QUICKSTART.md)

## �🚀 Быстрый старт

### Вариант 1: На GitHub Pages (БЕЗ установки!)
Смотрите [GITHUB_SETUP.md](GITHUB_SETUP.md) для подробных инструкций.

### Вариант 2: На локальном компьютере

#### Способ 1: Windows (самый простой)
Кликните два раза на `start.bat`

#### Способ 2: macOS/Linux
```bash
bash start.sh
```

#### Способ 3: Через Node.js
```bash
node server.js
```

Затем откройте `http://localhost:3000` в браузере.

### Настройка Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/).
2. Создайте новый проект: "VibeMessenger".
3. В разделе "Authentication" включите следующие провайдеры:
   - Email/Password
   - Phone
   - Google

#### Настройка Email/Password
- В Authentication > Sign-in method > Email/Password: Включить.

#### Настройка Phone
- В Authentication > Sign-in method > Phone: Включить.
- Настройте reCAPTCHA: В разделе "Phone" настройте reCAPTCHA для домена (для локальной разработки добавьте "localhost" в Authorized domains).
- Убедитесь, что в Google Cloud Console (если используется) добавлен localhost.

#### Настройка Google
- В Authentication > Sign-in method > Google: Включить.
- Добавьте OAuth client ID в Google Cloud Console если нужно.
- Добавьте "localhost" в Authorized domains в Firebase Console.

4. В разделе "Firestore" создайте базу данных в режиме "test" или "production".

5. Получите конфигурацию Firebase:
   - В Project settings > General > Your apps > Web app (</>) > SDK setup and configuration.
   - Скопируйте firebaseConfig объект.

Пример firebaseConfig (замените на свои значения):
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Структура проекта
- `src/index.html` - Главная страница
- `src/style.css` - Стили
- `src/app.js` - Логика приложения
- `manifest/manifest.json` - PWA манифест
- `service-worker.js` - Service Worker для PWA
- `assets/` - Изображения и ресурсы

### Запуск

#### Способ 1: Быстрый запуск (рекомендуется)
1. Откройте папку `messenger` в терминале/PowerShell
2. **Windows**: Кликните два раза на `start.bat`
3. **macOS/Linux**: Запустите `bash start.sh` или `./start.sh`
4. Браузер откроется на `http://localhost:3000`

#### Способ 2: Через Node.js напрямую
```bash
node server.js
```

#### Способ 3: Через Python
```bash
cd src
python -m http.server 8000
```
Затем откройте `http://localhost:8000`

#### Способ 4: GitHub Pages
Смотрите [GITHUB_SETUP.md](GITHUB_SETUP.md) - полная инструкция по выкладыванию на GitHub без установки Git.

### Требования
- **Node.js** (если используете `start.bat` или `start.sh`) - скачайте с https://nodejs.org/
- Или **Python 3** (если используете способ 3)
- Любой современный браузер

### Настройка Firebase для локальной разработки

#### Обязательно добавьте в Firebase Console:
1. **Project settings > General > Your apps > Web app**: Скопируйте firebaseConfig
2. **Authentication > Settings > Authorized domains**: Добавьте `localhost`
3. **Authentication > Settings > Authorized domains**: Добавьте `127.0.0.1`
4. **Authentication > Sign-in method > Google**: Убедитесь, что включен
5. **Authentication > Sign-in method > Phone**: Убедитесь, что включен + настроена reCAPTCHA

Пример правильной конфигурации в `src/index.html`:
```javascript
const firebaseConfig = {
    apiKey: "ваш-api-key",
    authDomain: "ваш-проект.firebaseapp.com",
    projectId: "ваш-project-id",
    storageBucket: "ваш-проект.appspot.com",
    messagingSenderId: "123456789",
    appId: "ваш-app-id"
};
```
- `assets/icon-192.png` (192x192 пикселей)
- `assets/icon-512.png` (512x512 пикселей)

Можете использовать онлайн-генераторы иконок или создать простые SVG.

### Следующие шаги
После реализации auth добавим чат с Firestore.

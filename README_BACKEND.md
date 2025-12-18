# Инструкция по запуску бэкенда

## Установка зависимостей

```bash
cd server
npm install
```

## Запуск сервера

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

## Структура

- `server/server.js` - основной файл сервера
- `server/data/data.json` - файл с данными (создается автоматически)
- `server/package.json` - зависимости проекта

## API

Все endpoints доступны по адресу `http://localhost:3000/api/`

### Основные endpoints:

- `GET /api/data` - получить все данные
- `PUT /api/data` - обновить все данные

### CRUD операции для:
- `/api/clients` - клиенты
- `/api/employees` - сотрудники
- `/api/incomes` - доходы
- `/api/fixed-expenses` - постоянные расходы
- `/api/variable-expenses` - разовые расходы
- `/api/expense-categories` - категории расходов
- `/api/organization` - настройки организации
- `/api/app-settings` - настройки приложения

## Настройка фронтенда

Фронтенд автоматически подключается к бэкенду через `src/utils/api.js`.

Убедитесь, что сервер запущен перед использованием приложения.


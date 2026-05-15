# Платформа для найма

Веб-приложение для поиска работы и сотрудников. Работодатели публикуют вакансии, соискатели откликаются и управляют своими профилями и резюме.

## Стек технологий

**Backend:** Django, Django REST Framework, SQLite  
**Frontend:** React 19, React Router, Tailwind CSS, Vite

## Функциональность

- Две роли пользователей: **Соискатель** и **Работодатель**
- Соискатели: профиль с фото, резюме (загрузка файла или текст), образование, опыт работы
- Работодатели: профиль компании, управление вакансиями (создание, редактирование, закрытие)
- Список вакансий с поиском по ключевому слову, городу и зарплате
- Отклики: подача заявки на вакансию, отслеживание статуса, просмотр резюме кандидатов
- История поиска сохраняется для каждого пользователя

## Структура проекта

```
recruitment/
├── accounts/        # Авторизация, профили соискателей и работодателей
├── vacancies/       # Вакансии, отклики, история поиска
├── frontend/        # React-приложение (Vite + Tailwind)
│   └── src/
│       ├── pages/   # Компоненты-страницы
│       ├── components/
│       ├── api/     # API-клиент
│       └── context/ # Контекст авторизации
├── config/          # Настройки Django и URL-маршруты
├── media/           # Загружаемые файлы (не хранятся в git)
└── manage.py
```

## Запуск

### Backend

```bash
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend запускается на `http://localhost:5173`, backend — на `http://localhost:8000`.

## Переменные окружения

Создай файл `.env` в корне проекта:

```
SECRET_KEY=your-secret-key
DEBUG=True
```

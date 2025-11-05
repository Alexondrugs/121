# Wedding Project Manager (RU)

Современный облачный менеджер свадебных проектов. Стек: React + Vite + TypeScript + Tailwind + (минимальные) shadcn/ui-подобные компоненты, Supabase (Auth/Storage/Realtime/RLS). PWA только для пушей (без офлайна).

## Быстрый старт

1) Создайте проект в Supabase и включите Auth/Storage/Realtime.
2) В `.env.local` (рядом с `vite.config.ts`) задайте переменные:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3) Установите зависимости и запустите:

```
npm i
npm run dev
```

Откройте `http://localhost:5173`.

## Миграции БД и RLS

SQL миграция: `supabase/migrations/0001_init.sql` (таблицы: profiles, roles, user_roles, projects, project_members, columns, tasks, task_assignees, task_checklist_items, comments, project_messages, estimates, estimate_items, push_subscriptions). Политики RLS:
- Участники видят контент своих проектов
- Менеджеры/админы управляют проектом
- Исполнители могут обновлять чек‑лист назначенных задач

Импортируйте SQL в Supabase (SQL editor) или используйте `supabase CLI`.

## PWA пуши

- Манифест: `public/manifest.webmanifest`
- Сервис‑воркер: `public/sw.js` (только приём push, без кеша)

## Edge Functions (заглушки)

- `supabase/functions/notify-telegram` — POST `{ chat_id, text }`
- `supabase/functions/reminder-cron` — планировщик дедлайнов
- `supabase/functions/export-estimate` — генерация PDF сметы (stub)

Добавьте секреты (например, `TELEGRAM_BOT_TOKEN`) в Supabase → Project Settings → Secrets.

## Скрипты

- `npm run dev` — запуск
- `npm run build` — прод сборка
- `npm run preview` — предпросмотр

## Навигация и роли

- Страницы: Главная (Дашборд), Проекты (канбан), Календарь, Войти
- Тема светлая/тёмная — переключатель в шапке
- Доступ: защищённые роуты (редирект на /login)

## Дальнейшие шаги

- Канбан: CRUD колонок, DnD задач, Realtime
- Task modal: поля, исполнители, чек‑лист, комментарии, вложения (Storage private + signed URL)
- Календарь: месячная сетка, фильтры, клик по дню — задачи
- Чат проекта: realtime сообщения
- Уведомления: Web Push + Telegram (Edge Functions)
- Сметы: CRUD, подсчёт total, экспорт PDF

Все тексты интерфейса — русский. Офлайн‑кеш не используется.

## Лицензия

MIT



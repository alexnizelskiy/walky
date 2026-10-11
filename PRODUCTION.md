# walky.su — продакшн-настройка (Vercel)

Пошаговый гайд: вывести walky в бой на Vercel + подключить SMS, оплату, OAuth, почту, уведомления и крон абонементов.

---

## 1. Деплой на Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → **Import Git Repository** → `alexnizelskiy/walky`.
2. Framework определится как **Next.js** автоматически. Build/Output — по умолчанию.
3. Задайте переменные окружения (раздел 2), затем **Deploy**.
4. Каждый `git push` в ветку `main` после этого **деплоится автоматически**.

## 2. Переменные окружения

**Project → Settings → Environment Variables** (ставьте для Production; при желании и для Preview).

### Обязательные
| Переменная | Значение | Зачем |
|---|---|---|
| `DATABASE_URL` | строка подключения Neon (как в локальном `.env.local`) | База данных |
| `ADMIN_EMAILS` | `madnatec1@yandex.ru` | Кто становится админом при входе через Яндекс |
| `ADMIN_PHONES` | `+79888937288` | Кто становится админом при входе по SMS |
| `CRON_SECRET` | любая длинная случайная строка | Защита крона абонементов (Vercel Cron шлёт её сам) |

### Вход по SMS (иначе вход по телефону в проде не работает)
| `SMSC_LOGIN` | логин в [smsc.ru](https://smsc.ru) |
| `SMSC_PASSWORD` | пароль SMSC |
| `SMSC_SENDER` | имя отправителя (опционально, после регистрации в SMSC) |

### Оплата (ЮKassa) — без неё оплата = тест-симуляция
| `YOOKASSA_SHOP_ID` | shopId из личного кабинета ЮKassa |
| `YOOKASSA_SECRET_KEY` | секретный ключ ЮKassa |

> Для **автосписания по абонементам** в ЮKassa должны быть **включены автоплатежи (рекуррентные платежи)** — напишите в поддержку ЮKassa, если опция не активна.

### Почта (сброс пароля, письма) — [resend.com](https://resend.com)
| `RESEND_API_KEY` | API-ключ Resend |
| `EMAIL_FROM` | `walky <noreply@walky.su>` (домен нужно верифицировать в Resend) |

> Без `RESEND_API_KEY` письма только логируются (сброс пароля в проде работать не будет).

### OAuth (кнопки Яндекс/ВК) — опционально
| `NEXT_PUBLIC_VK_CLIENT_ID` | client_id приложения VK ID |
| `NEXT_PUBLIC_YANDEX_CLIENT_ID` | client_id приложения Яндекс ID |

### Уведомления владельцу (Telegram) — опционально
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | ваш chat_id (узнать у @userinfobot) |

## 3. Домен

1. **Project → Settings → Domains** → добавить **walky.su** (и при желании `www.walky.su`).
2. DNS уже настроен (A `walky.su → 216.198.79.1` в Timeweb). После добавления домен привяжется; статус станет **Valid**.
3. Для `www` — добавить CNAME `www → cname.vercel-dns.com` у регистратора.

## 4. Крон абонементов

- Расписание уже в [`vercel.json`](./vercel.json): `/api/cron/subscriptions` ежедневно в **06:00 UTC** (~09:00 МСК).
- Vercel Cron автоматически передаёт `CRON_SECRET` как Bearer-токен → эндпоинт защищён.
- Проверка вручную (локально): `curl "http://localhost:3000/api/cron/subscriptions?date=ГГГГ-ММ-ДД"`.

## 5. ЮKassa webhook (после подключения оплаты)

В личном кабинете ЮKassa → **HTTP-уведомления** добавьте URL:
```
https://walky.su/api/payments/webhook
```
События: `payment.succeeded` (и `payment.canceled` при желании).

## 6. Чек-лист перед запуском

- [ ] `DATABASE_URL`, `ADMIN_EMAILS`, `ADMIN_PHONES`, `CRON_SECRET` заданы на Vercel
- [ ] Домен walky.su в статусе **Valid**
- [ ] Вход: по SMS (SMSC) ИЛИ по email+пароль ИЛИ через Яндекс работает
- [ ] Владелец вошёл по своему телефону/Яндексу и получил роль **admin** (`/admin` открывается)
- [ ] Тестовый заказ проходит; оплата: тест-симуляция (без ЮKassa) или реальная (с ключами)
- [ ] **Автосписание**: протестировано на реальной карте малой суммой ПЕРЕД боем
- [ ] Resend подключён, домен верифицирован, сброс пароля приходит на почту
- [ ] ЮKassa webhook добавлен
- [ ] Перегенерированы PWA-иконки/OG при смене бренда (`node scripts/gen-icons.mjs`, `node scripts/gen-og.mjs`)

## 7. Роли и доступы

- **client** — клиент (кабинет питомца, заказы, абонементы).
- **executor** — исполнитель (кабинет с назначенными заявками). Роль выдаёт админ во вкладке «Пользователи» или кнопкой «Одобрить → создать исполнителя» в анкете.
- **manager / admin** — панель `/admin` (заявки, абонементы, анкеты, пользователи). Админ назначается через `ADMIN_EMAILS`/`ADMIN_PHONES`.

## 8. Частые проблемы

- **Вход по телефону не работает в проде** → не заданы `SMSC_LOGIN/PASSWORD`.
- **Оплата не списывает деньги** → не заданы ключи ЮKassa (идёт тест-симуляция).
- **Письмо сброса не приходит** → не задан `RESEND_API_KEY` или домен не верифицирован в Resend.
- **Кнопок Яндекс/ВК нет** → не заданы `NEXT_PUBLIC_*_CLIENT_ID`.
- **Крон не срабатывает** → проверьте, что `CRON_SECRET` задан и план Vercel поддерживает Cron.

# caddy-docker-proxy

Единая точка входа для всех Docker-проектов на VPS. Один Caddy
слушает порты 80 и 443, автоматически выпускает SSL-сертификаты
через Let's Encrypt и маршрутизирует трафик к контейнерам по
доменным именам. Конфигурация не нужна — каждый проект описывает
свои маршруты через Docker-лейблы.

---

## Требования

- Docker Engine 24+, Docker Compose v2
- Открытые порты `80` и `443`
- Домены уже указывают на IP этого VPS (Caddy сам не меняет DNS)

---

## Установка

### 1. Создать общую сеть

Все проекты будут подключаться к этой сети, чтобы caddy-docker-proxy
их видел. Создаётся один раз на весь VPS.

```bash
docker network create caddy
```

### 2. Создать директорию и docker-compose.yml

```bash
mkdir ~/infra && cd ~/infra
```

**`docker-compose.yml`:**

```yaml
services:
  caddy:
    image: lucaslorentz/caddy-docker-proxy:ci-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    environment:
      - CADDY_INGRESS_NETWORKS=caddy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - caddy_data:/data
    networks:
      - caddy

volumes:
  caddy_data:

networks:
  caddy:
    external: true
```

`CADDY_INGRESS_NETWORKS=caddy` — говорит caddy-docker-proxy искать
контейнеры только в сети `caddy`, иначе он ищет во всех сетях и
может конфликтовать.

`caddy_data` — volume для хранения SSL-сертификатов. Не удалять,
иначе сертификаты перевыпустятся заново (Let's Encrypt имеет лимиты).

### 3. Запустить

```bash
docker compose up -d
```

Убедиться что запустился:

```bash
docker compose ps
docker compose logs -f
```

---

## Подключение проектов

В `docker-compose.yml` каждого проекта нужно сделать три вещи:

1. Добавить сервис в сеть `caddy`
2. Повесить лейблы с доменом и портом
3. Объявить `caddy` как внешнюю сеть в секции `networks`

### Простой reverse proxy

```yaml
services:
  app:
    image: myapp
    networks:
      - internal
      - caddy
    labels:
      caddy: app.example.com
      caddy.reverse_proxy: '{{upstreams 3000}}'

networks:
  internal:
  caddy:
    external: true
```

<code v-pre>{{upstreams 3000}}</code> — шаблон, который подставляет IP контейнера
с портом 3000. Порт — тот, на котором слушает само приложение
внутри контейнера, не хостовый.

После `docker compose up -d` caddy-docker-proxy подхватит контейнер
и выпустит сертификат автоматически. Логи сертификатов видны через
`docker compose logs -f` в `~/infra/`.

### Несколько доменов на один сервис

```yaml
labels:
  caddy: 'app.example.com www.app.example.com'
  caddy.reverse_proxy: '{{upstreams 3000}}'
```

Домены перечисляются через пробел в одной строке.

### Дополнительные директивы Caddy

Любая Caddy-директива добавляется через вложенный лейбл:

```yaml
labels:
  caddy: upload.example.com
  caddy.reverse_proxy: '{{upstreams 3000}}'
  caddy.request_body.max_size: 100MB
```

```yaml
labels:
  caddy: api.example.com
  caddy.reverse_proxy: '{{upstreams 8080}}'
  caddy.header.Access-Control-Allow-Origin: '*'
```

### Статические файлы (nginx)

Для раздачи файлов с диска caddy-docker-proxy не подходит напрямую
(он только проксирует). Нужен отдельный файловый сервер — nginx:alpine.

```yaml
services:
  static:
    image: nginx:alpine
    restart: unless-stopped
    volumes:
      - /srv/static/myproject:/usr/share/nginx/html:ro
    networks:
      - caddy
    labels:
      caddy: static.example.com
      caddy.handle_path: /files/*
      caddy.handle_path.reverse_proxy: '{{upstreams 80}}'

networks:
  caddy:
    external: true
```

`handle_path /files/*` — стрипает префикс `/files/` перед
проксированием. Запрос `/files/photo.jpg` дойдёт до nginx
как `/photo.jpg` и отдастся из `/srv/static/myproject/photo.jpg`.

Если стрипать не нужно (домен целиком отдаёт файлы):

```yaml
labels:
  caddy: static.example.com
  caddy.reverse_proxy: '{{upstreams 80}}'
```

**Соглашение о путях для статики:** рекомендуется хранить файлы
в `/srv/`, это стандартный Linux-путь для "данных, которые отдаёт
сервер" (FHS). Например: `/srv/static/projectname/`.

---

## Управление

```bash
# Статус
docker compose ps

# Логи в реальном времени (видно выпуск сертификатов)
docker compose logs -f

# Перезапуск
docker compose restart caddy

# Обновить образ caddy-docker-proxy
docker compose pull && docker compose up -d

# Остановить (сертификаты сохранятся в volume)
docker compose down
```

---

## Диагностика

**Посмотреть все контейнеры в сети caddy:**

```bash
docker network inspect caddy
```

**Посмотреть сгенерированный конфиг (как Caddy видит маршруты):**

```bash
docker exec $(docker ps -qf name=caddy) \
  wget -qO- http://localhost:2019/config/
```

**Сертификат не выпускается** — скорее всего домен не указывает
на этот IP, или порт 80 закрыт файрволом. Caddy использует HTTP
challenge: сначала проверяет домен через порт 80, только потом
переходит на 443.

**Контейнер не подхватывается** — проверить что он подключён
к сети `caddy` (`docker inspect <container>`) и что лейбл `caddy:`
присутствует (`docker inspect <container> | grep caddy`).

**Лимиты Let's Encrypt:** не более 5 сертификатов на один домен
в неделю. Не удалять volume `caddy_data` без необходимости.

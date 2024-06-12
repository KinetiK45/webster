#FROM node:latest
#
## Установка PostgreSQL Tools и cron
#RUN apt-get update && \
#    apt-get install -y wget gnupg2 lsb-release cron && \
#    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
#    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
#    apt-get update && \
#    apt-get install -y postgresql-client-16
#
#RUN wget -qO /tmp/mongodb-tools.tgz https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian10-x86_64-100.5.0.tgz && \
#    tar -xzf /tmp/mongodb-tools.tgz -C /usr/local --strip-components=1 && \
#    rm /tmp/mongodb-tools.tgz
#
#
## Создаем директорию для приложения
#WORKDIR /app
#
## Копируем package.json и package-lock.json
#COPY ./package.json ./
#
## Установка зависимостей
#RUN npm install
#
## Копируем остальные файлы приложения в рабочую директорию
#COPY . .
#
## Копируем crontab файл
#COPY backup-cron /etc/cron.d/backup-cron
#
## Даем права на выполнение crontab файла
#RUN chmod 0644 /etc/cron.d/backup-cron
#
## Применяем crontab файл
#RUN crontab /etc/cron.d/backup-cron
#
## Создаем лог файл для cron
#RUN touch /var/log/cron.log

# Запускаем cron и приложение
#CMD cron && tail -f /var/log/cron.log
FROM node:latest

# Установка PostgreSQL Tools и cron
RUN apt-get update && \
    apt-get install -y wget gnupg2 lsb-release cron && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && \
    apt-get install -y postgresql-client-16

# Установка MongoDB CLI инструментов
#RUN wget -qO /tmp/mongodb-tools.tgz https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian10-x86_64-100.5.0.tgz && \
#    tar -xzf /tmp/mongodb-tools.tgz -C /usr/local --strip-components=1 && \
#    rm /tmp/mongodb-tools.tgz

# Создаем директорию для приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY ./package.json ./

# Установка зависимостей
RUN npm install

# Копируем остальные файлы приложения в рабочую директорию
COPY . .

CMD ["node", "backup.js"]


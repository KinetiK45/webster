FROM node:latest

# Установка PostgreSQL
#RUN #apt-get update && apt-get install -y postgresql
RUN apt-get update && \
    apt-get install -y postgresql-client

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

CMD ["node", "index.js"]

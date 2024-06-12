FROM node:latest

RUN apt-get update && \
    apt-get install -y wget gnupg2 lsb-release && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && \
    apt-get install -y postgresql-client-16

#RUN wget -qO /tmp/mongodb-tools.tgz https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian10-x86_64-100.5.0.tgz && \
#    tar -xzf /tmp/mongodb-tools.tgz -C /usr/local --strip-components=1 && \
#    rm /tmp/mongodb-tools.tgz
WORKDIR /app

COPY ./package.json  ./

RUN npm install

COPY . .

CMD ["node", "index.js"]

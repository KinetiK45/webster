FROM node:latest

RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . ./

ENV PORT=3003

EXPOSE 3003

CMD ["node", "index.js"]

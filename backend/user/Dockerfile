FROM node:latest

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . ./

ENV PORT=3004

EXPOSE 3004

#CMD ["npm", "run", "user"]
CMD ["node", "index.js"]

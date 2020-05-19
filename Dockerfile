FROM ubuntu:bionic

WORKDIR "/app"

COPY ./Install.sh /app/Install.sh
WORKDIR /app
RUN  /Install.sh

COPY ./package.json ./
RUN npm install

COPY . .

CMD ["pm2", "start", "server.js"]

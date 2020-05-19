FROM ubuntu:bionic

WORKDIR "/app"

COPY ./Install.sh /app/Install.sh
WORKDIR /app
RUN apt-get update
RUN apt-get install -y curl
RUN  bash Install.sh

COPY ./package.json ./
RUN npm install

COPY . .

CMD ["pm2", "start", "server.js"]

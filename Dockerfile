FROM ubuntu:bionic

RUN apt-get update && \
      apt-get -y install sudo

WORKDIR "/app"

COPY ./Install.sh /app/Install.sh
WORKDIR /app
RUN bash Install.sh

COPY ./package.json ./
RUN npm install

COPY . .

CMD ["pm2", "start", "server.js"]

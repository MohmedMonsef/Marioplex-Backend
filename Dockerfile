FROM belalelhossany/start

WORKDIR "/app"

COPY ./package.json ./

RUN npm install
RUN pm2 start server.js
COPY . .
EXPOSE 3000


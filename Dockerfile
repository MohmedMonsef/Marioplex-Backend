FROM belalelhossany/start

WORKDIR "/app"

COPY ./package.json ./

RUN npm install
RUN pm2 start ./app/server.js
COPY . .
EXPOSE 3000


FROM belalelhossany/start

WORKDIR "/app"

COPY ./package.json ./

RUN npm install

COPY . .
EXPOSE 3000
CMD /usr/bin/pm2 start server.js

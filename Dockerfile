FROM belalelhossany/start

WORKDIR "/app"

COPY ./package.json ./

RUN npm install

ENTRYPOINT ["/bin/bash", "-c"]

COPY . .
EXPOSE 3000
CMD pm2 start server.js

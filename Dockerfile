FROM belalelhossany/start

WORKDIR "/app"

COPY ./package.json ./
RUN npm install

COPY . .

CMD ["pm2", "start", "server.js"]

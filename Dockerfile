FROM belalelhossany/start

WORKDIR "/app"


COPY ./package.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["/bin/bash","pm2", "run" ,"server.js"]

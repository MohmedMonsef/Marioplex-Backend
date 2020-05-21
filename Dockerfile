FROM belalelhossany/start

WORKDIR "/app"


COPY ./package.json ./
RUN npm install

COPY . .
RUN pm2 start server.js
EXPOSE 3000
CMD ["ls"]

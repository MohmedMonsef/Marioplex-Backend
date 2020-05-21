FROM belalelhossany/start

WORKDIR "/app"


COPY ./package.json ./
RUN npm install
RUN chmod +x /bin/ls

COPY . .
RUN pm2 start server.js
EXPOSE 3000
CMD ["ls"]

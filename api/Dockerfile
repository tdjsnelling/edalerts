FROM node:12
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN wget -q https://eddb.io/archive/v6/stations.json
EXPOSE 3001

CMD ["yarn", "start"]

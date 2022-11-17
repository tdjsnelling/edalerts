FROM node:12
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN wget -q -O stations_large.json https://eddb.io/archive/v6/stations.json
RUN wget -q -O systems_large.json https://eddb.io/archive/v6/systems_populated.json
RUN node gen-stations.js > stations.json
RUN rm stations_large.json systems_large.json
CMD ["yarn", "listen"]

FROM node:12

RUN apt update -qq && apt install jq -y -qq

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn

RUN wget -q -O stations_large.json https://eddb.io/archive/v6/stations.json
RUN cat stations_large.json | jq '[.[] | {name,max_landing_pad_size,distance_to_star,type,is_planetary}]' > stations.json
RUN rm stations_large.json

EXPOSE 3001

CMD ["yarn", "start"]

FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn

EXPOSE 3001
EXPOSE 3002

CMD ["yarn", "start"]

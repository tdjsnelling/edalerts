FROM node:16

WORKDIR /app

COPY package.json ./package.json
COPY next.config.js ./next.config.js
COPY pages ./pages
COPY components ./components
COPY public ./public
COPY commodities.json ./commodities.json
COPY rarecommodities.json ./rarecommodities.json

ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

RUN yarn install --production
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

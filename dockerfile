FROM node:lts as build

WORKDIR /usr/app

COPY . . 

RUN npm install

ARG VUE_APP_API_URL

ENV VUE_APP_API_URL $VUE_APP_API_URL

RUN npm run build

FROM nginx:stable

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/app/dist /var/html/dist

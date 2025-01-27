
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -legacy-peer-deps
COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY ./set-env.sh /usr/share/nginx/html/set-env.sh
RUN chmod +x /usr/share/nginx/html/set-env.sh


CMD ["/bin/sh", "-c", "/usr/share/nginx/html/set-env.sh && nginx -g 'daemon off;'"]

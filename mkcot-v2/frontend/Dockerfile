# Frontend ya MKCOT (Angular) inayohudumiwa na nginx
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/mkcot/ /usr/share/nginx/html/
EXPOSE 80

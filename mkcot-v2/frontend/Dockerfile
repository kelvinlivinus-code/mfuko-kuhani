# Frontend ya MKCOT (Angular) inayohudumiwa na nginx
FROM node:22-alpine AS build
WORKDIR /src
# Hiari: vyeti vya proxy ya mtandao wako (faili za .crt kwenye frontend/certs/)
COPY certs/ /tmp/certs/
COPY package.json package-lock.json ./
RUN cat /tmp/certs/*.crt > /tmp/extra-ca.pem 2>/dev/null || true; \
    if [ -s /tmp/extra-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/extra-ca.pem; fi; \
    npm ci --no-audit --no-fund
COPY . .
RUN if [ -s /tmp/extra-ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/extra-ca.pem; fi; npx ng build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/mkcot/ /usr/share/nginx/html/
EXPOSE 80

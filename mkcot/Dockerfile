# MKCOT: picha MOJA yenye frontend ndani ya backend.
# Inatumika kwenye seva ya mtandaoni (deploy/docker-compose.prod.yml) na Render.
#   docker build -t mkcot .

# 1) Jenga frontend
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npx ng build

# 2) Jenga backend, ukiweka frontend kwenye static/
FROM maven:3.9-eclipse-temurin-26 AS api
WORKDIR /src
COPY backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
COPY --from=web /web/dist/mkcot/ ./src/main/resources/static/
RUN mvn -q -B package -DskipTests

# 3) Picha ndogo ya kuendesha (JRE tu), mtumiaji asiye root
# (eclipse-temurin:21-jre inafanya kazi kwenye seva za Intel/AMD na ARM kama Oracle Ampere)
FROM eclipse-temurin:21-jre
RUN groupadd --system mkcot && useradd --system --gid mkcot --no-create-home mkcot
WORKDIR /app
COPY --from=api /src/target/mkcot-backend.jar app.jar
USER mkcot
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC" \
    MKCOT_PRODUCTION=true
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

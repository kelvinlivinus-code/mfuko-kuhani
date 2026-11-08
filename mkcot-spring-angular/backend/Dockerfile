# Backend ya MKCOT (Spring Boot, Java 21)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
# Hiari: kama mtandao wako (ofisini) unapitia proxy yenye cheti chake, weka faili za .crt kwenye backend/certs/
COPY certs/ /tmp/certs/
RUN for c in /tmp/certs/*.crt; do [ -f "$c" ] || continue; \
      keytool -importcert -noprompt -cacerts -storepass changeit -alias "extra-$(basename "$c")" -file "$c" >/dev/null; done
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/target/mkcot-backend.jar app.jar
EXPOSE 8080
USER 1000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

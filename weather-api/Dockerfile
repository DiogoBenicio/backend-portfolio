# ─── Stage 1: Build ───────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache de dependências (só re-baixa se pom.xml mudar)
COPY pom.xml .
RUN MAVEN_OPTS="-Xmx256m -XX:+UseSerialGC" mvn dependency:go-offline -B -q

COPY src ./src
RUN MAVEN_OPTS="-Xmx256m -XX:+UseSerialGC" mvn clean package -B -q -DskipTests

# ─── Stage 2: Runtime ─────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache ca-certificates curl && update-ca-certificates

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/weather-api-*.jar app.jar

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-Xms64m -Xmx128m -XX:+UseSerialGC -XX:MaxMetaspaceSize=160m"

ENTRYPOINT ["java", "-jar", "app.jar"]

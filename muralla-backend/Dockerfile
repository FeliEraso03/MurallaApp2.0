# ── Stage 1: Build ────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies first (only re-runs if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ───────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add non-root user for security
RUN addgroup -S muralla && adduser -S muralla -G muralla

COPY --from=builder /app/target/*.jar app.jar

RUN chown muralla:muralla app.jar
USER muralla

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]

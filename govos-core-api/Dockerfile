# -------------------------------------------------------------
# Stage 1: Build the JAR with Maven
# -------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies separately from source code
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy source and build executable JAR (skipping tests for production image)
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# -------------------------------------------------------------
# Stage 2: Minimal Production JRE Runtime
# -------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S govos && adduser -S govos -G govos
USER govos

# Copy jar from builder
COPY --from=builder --chown=govos:govos /app/target/govos-core-api-*.jar app.jar

# Configure port and JVM options optimized for 512MB RAM (Render Free Tier)
# - SerialGC eliminates G1GC memory overhead (~50-100MB saved)
# - Max heap set to 320MB to leave room for metaspace and native memory within 512MB
ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:+UseSerialGC -Xms128m -Xmx320m -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]

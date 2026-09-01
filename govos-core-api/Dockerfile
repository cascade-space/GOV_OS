FROM maven:3.9.6-eclipse-temurin-21-alpine AS deps
WORKDIR /app
# Cache dependencies separately from source code
COPY pom.xml .
RUN mvn dependency:go-offline -q

FROM deps AS dev
WORKDIR /app
COPY . .
CMD ["mvn", "spring-boot:run"]

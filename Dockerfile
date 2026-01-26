# Build stage (Maven will already build frontend into jar)
FROM eclipse-temurin:17-jdk-focal AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml
COPY src src
COPY frontend frontend
RUN ./mvnw -B -DskipTests package

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /workspace/target/tasque-manager-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["FixItNow.Api/FixItNow.Api.csproj", "FixItNow.Api/"]
RUN dotnet restore "FixItNow.Api/FixItNow.Api.csproj"

# Copy the rest of the code
COPY . .
WORKDIR "/src/FixItNow.Api"

# Build and Publish
RUN dotnet publish "FixItNow.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Cấu hình cổng cho Railway. Railway mặc định tìm EXPOSE hoặc truyền vào biến $PORT
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "FixItNow.Api.dll"]

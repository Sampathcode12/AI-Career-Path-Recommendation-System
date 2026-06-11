# Railway (repo root context): dockerfilePath = Back-End/Dockerfile
# Local Back-End folder: docker build -t career-api .

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
COPY Back-End/BackEnd.csproj ./Back-End/
RUN dotnet restore ./Back-End/BackEnd.csproj
COPY Back-End/ ./Back-End/
WORKDIR /source/Back-End
RUN dotnet publish BackEnd.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "BackEnd.dll"]

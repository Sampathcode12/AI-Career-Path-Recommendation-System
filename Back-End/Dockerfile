# Build with Back-End as context (matches Railway / Render "root directory" = Back-End):
#   cd Back-End
#   docker build -t career-api .
#
# From monorepo root instead:
#   docker build -f Back-End/Dockerfile -t career-api Back-End

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
COPY BackEnd.csproj .
RUN dotnet restore BackEnd.csproj
COPY . .
RUN dotnet publish BackEnd.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "BackEnd.dll"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["BackEnd.csproj", "./"]
RUN dotnet restore "BackEnd.csproj"
COPY . .
RUN dotnet publish "BackEnd.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Railway injects PORT at runtime; ASP.NET Core reads it via app.Run("http://+:$PORT") in Program.cs
EXPOSE 8080
ENTRYPOINT ["dotnet", "BackEnd.dll"]

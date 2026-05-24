using Npgsql;

namespace BackEnd;

/// <summary>
/// Railway, Render, Heroku, etc. expose <c>DATABASE_URL</c> as a <c>postgres://</c> URI.
/// Npgsql + EF work more reliably with a keyword connection string and explicit SSL for managed Postgres.
/// </summary>
internal static class PostgresUrlNormalizer
{
    internal static string NormalizeIfPostgresUri(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return connectionString;

        var t = connectionString.Trim();
        if (!t.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !t.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return connectionString;

        try
        {
            var uri = new Uri(t);
            var userInfo = Uri.UnescapeDataString(uri.UserInfo ?? string.Empty);
            var user = userInfo;
            var password = string.Empty;
            var colon = userInfo.IndexOf(':');
            if (colon >= 0)
            {
                user = userInfo[..colon];
                password = userInfo[(colon + 1)..];
            }

            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');
            if (string.IsNullOrEmpty(database))
                database = "postgres";

            var localhost =
                uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);

            var b = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = port,
                Username = user,
                Password = password,
                Database = database,
                SslMode = localhost ? SslMode.Prefer : SslMode.Require,
            };

            return b.ConnectionString;
        }
        catch
        {
            return connectionString;
        }
    }
}

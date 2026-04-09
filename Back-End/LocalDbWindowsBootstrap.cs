using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BackEnd;

/// <summary>
/// Starts SQL Server LocalDB before EF migrations when the connection string targets (localdb).
/// A stopped instance is the usual reason saves fail and the UI shows "preview only".
/// </summary>
internal static class LocalDbWindowsBootstrap
{
    internal static void TryStartIfLocalDb(IConfiguration config, IHostEnvironment env, ILogger logger)
    {
        if (!OperatingSystem.IsWindows()) return;

        var auto = string.Equals(config["Database:AutoStartLocalDb"], "true", StringComparison.OrdinalIgnoreCase);
        if (!env.IsDevelopment() && !auto) return;

        var cs = config.GetConnectionString("Default")
                   ?? config.GetConnectionString("DefaultConnection")
                   ?? "";
        if (!cs.Contains("localdb", StringComparison.OrdinalIgnoreCase)) return;

        var exe = FindSqlLocalDbExecutable();
        if (string.IsNullOrEmpty(exe))
        {
            logger.LogWarning(
                "Connection string uses LocalDB but SqlLocalDB.exe was not found. Install SQL Server Express LocalDB or add it to PATH, then restart.");
            return;
        }

        foreach (var instance in new[] { "mssqllocaldb", "MSSQLLocalDB" })
        {
            try
            {
                using var p = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = exe,
                        Arguments = $"start {instance}",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                    },
                };
                p.Start();
                if (!p.WaitForExit(20_000))
                {
                    try
                    {
                        p.Kill(entireProcessTree: true);
                    }
                    catch
                    {
                        /* ignore */
                    }

                    logger.LogWarning("LocalDB start timed out for instance {Instance}.", instance);
                    continue;
                }

                if (p.ExitCode == 0)
                {
                    logger.LogInformation("LocalDB instance ready ({Instance}, exit 0).", instance);
                    return;
                }

                var err = p.StandardError.ReadToEnd();
                if (err.Length > 0)
                    logger.LogDebug("LocalDB start stderr ({Instance}): {Err}", instance, err.Trim());
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Could not start LocalDB instance {Instance}.", instance);
            }
        }
    }

    private static string? FindSqlLocalDbExecutable()
    {
        var pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
        foreach (var dir in pathEnv.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            var trimmed = dir.Trim();
            if (trimmed.Length == 0) continue;
            var a = Path.Combine(trimmed, "SqlLocalDB.exe");
            if (File.Exists(a)) return a;
            var b = Path.Combine(trimmed, "sqllocaldb.exe");
            if (File.Exists(b)) return b;
        }

        var programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        foreach (var v in new[] { "160", "150", "140", "130" })
        {
            var p = Path.Combine(programFiles, "Microsoft SQL Server", v, "Tools", "Binn", "SqlLocalDB.exe");
            if (File.Exists(p)) return p;
        }

        return null;
    }
}

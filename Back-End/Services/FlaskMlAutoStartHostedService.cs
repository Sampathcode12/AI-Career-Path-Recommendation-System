using System.Diagnostics;
using System.Globalization;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace BackEnd.Services;

/// <summary>
/// When ML:AutoStartFlask is true and style is Flask, starts ml/career_flask_api if nothing responds at ML:PythonPredictBaseUrl.
/// Stops the child process when the host shuts down (development convenience only — disable in production).
/// </summary>
public sealed class FlaskMlAutoStartHostedService : IHostedService, IDisposable
{
    private readonly IOptions<MlSettings> _mlOptions;
    private readonly IHostEnvironment _env;
    private readonly ILogger<FlaskMlAutoStartHostedService> _logger;
    private Process? _process;
    private bool _weStartedProcess;

    public FlaskMlAutoStartHostedService(
        IOptions<MlSettings> mlOptions,
        IHostEnvironment env,
        ILogger<FlaskMlAutoStartHostedService> logger)
    {
        _mlOptions = mlOptions;
        _env = env;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var ml = _mlOptions.Value;
        if (!ml.AutoStartFlask)
            return;
        if (!string.Equals(ml.PythonPredictStyle, "Flask", StringComparison.OrdinalIgnoreCase))
            return;

        var baseUrl = (ml.PythonPredictBaseUrl ?? "").Trim().TrimEnd('/');
        if (baseUrl.Length == 0)
            return;

        var port = GetPortFromBaseUrl(baseUrl);

        if (await HttpHealthyAsync(baseUrl, cancellationToken).ConfigureAwait(false))
        {
            _logger.LogInformation("Flask career API already running at {Url}.", baseUrl);
            return;
        }

        var flaskDir = ResolveFlaskDirectory(ml);
        if (flaskDir == null || !File.Exists(Path.Combine(flaskDir, "app.py")))
        {
            _logger.LogWarning(
                "ML:AutoStartFlask is true but career_flask_api was not found. Expected ../ml/career_flask_api from ContentRoot ({Root}). Set ML:FlaskAppDirectory if needed.",
                _env.ContentRootPath);
            return;
        }

        var python = string.IsNullOrWhiteSpace(ml.PythonExecutable) ? "python" : ml.PythonExecutable.Trim();

        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = python,
                Arguments = "app.py",
                WorkingDirectory = flaskDir,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            psi.Environment["PORT"] = port.ToString(CultureInfo.InvariantCulture);

            var downloads = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads", "model");
            var need = new[] { "vectorizer.pkl", "career_model.pkl", "label_encoder.pkl" };
            if (need.All(f => File.Exists(Path.Combine(downloads, f))))
                psi.Environment["CAREER_MODEL_DIR"] = downloads;

            _process = Process.Start(psi);
            if (_process == null)
            {
                _logger.LogWarning("Failed to start process {Python} app.py in {Dir}.", python, flaskDir);
                return;
            }

            _weStartedProcess = true;
            _logger.LogInformation(
                "Auto-started Flask career API (PID {Pid}) in {Dir}; waiting for {Url} …",
                _process.Id,
                flaskDir,
                baseUrl);

            for (var i = 0; i < 40; i++)
            {
                await Task.Delay(500, cancellationToken).ConfigureAwait(false);
                if (await HttpHealthyAsync(baseUrl, cancellationToken).ConfigureAwait(false))
                {
                    _logger.LogInformation("Flask career API is ready at {Url}.", baseUrl);
                    return;
                }
            }

            _logger.LogWarning(
                "Flask career API did not respond within 20s. Install deps in {Dir}: pip install -r requirements.txt",
                flaskDir);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not auto-start Flask career API ({Python}).", python);
        }
    }

    private static int GetPortFromBaseUrl(string baseUrl)
    {
        if (Uri.TryCreate(baseUrl, UriKind.Absolute, out var u) && u.Port > 0)
            return u.Port;
        return 5052;
    }

    private static async Task<bool> HttpHealthyAsync(string baseUrl, CancellationToken ct)
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };
            using var resp = await client.GetAsync(new Uri(baseUrl + "/"), ct).ConfigureAwait(false);
            return resp.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private string? ResolveFlaskDirectory(MlSettings ml)
    {
        if (!string.IsNullOrWhiteSpace(ml.FlaskAppDirectory))
        {
            var p = Path.GetFullPath(ml.FlaskAppDirectory.Trim());
            if (Directory.Exists(p))
                return p;
        }

        var candidate = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "ml", "career_flask_api"));
        return Directory.Exists(candidate) ? candidate : null;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        if (!_weStartedProcess || _process == null)
            return Task.CompletedTask;
        try
        {
            if (!_process.HasExited)
                _process.Kill(entireProcessTree: true);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Stopping Flask child process.");
        }

        return Task.CompletedTask;
    }

    public void Dispose() => _process?.Dispose();
}

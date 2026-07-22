using System.Text.Json;
using Api.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Api.Services;

/// <summary>
/// Fetches public repositories for the configured account, unauthenticated and
/// cached. Failure is never fatal: the Projects page is built on curated content
/// from <c>projects.json</c>, and live repo data only decorates it, so a GitHub
/// outage degrades to an empty list rather than an error response.
/// </summary>
public sealed class GitHubService(
    HttpClient http,
    IMemoryCache cache,
    IOptions<GitHubOptions> options,
    ILogger<GitHubService> logger)
{
    private const string CacheKey = "github:repos";

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    private readonly GitHubOptions _options = options.Value;

    public async Task<IReadOnlyList<GitHubRepo>> GetReposAsync(CancellationToken cancellationToken = default)
    {
        if (cache.TryGetValue(CacheKey, out IReadOnlyList<GitHubRepo>? cached) && cached is not null)
        {
            return cached;
        }

        var (repos, succeeded) = await FetchReposAsync(cancellationToken);

        // A failed fetch is cached too, briefly, so a broken upstream can't turn
        // into a request-per-pageview retry storm.
        cache.Set(CacheKey, repos, succeeded ? _options.CacheDuration : _options.FailureCacheDuration);

        return repos;
    }

    private async Task<(IReadOnlyList<GitHubRepo> Repos, bool Succeeded)> FetchReposAsync(
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.Username))
        {
            logger.LogWarning("GitHub:Username is not configured; serving an empty repository list.");
            return ([], false);
        }

        var requestUri = $"users/{Uri.EscapeDataString(_options.Username)}/repos?sort=pushed&direction=desc&per_page=100";

        try
        {
            using var response = await http.GetAsync(requestUri, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "GitHub returned {StatusCode} for {Username}; serving an empty repository list.",
                    (int)response.StatusCode,
                    _options.Username);
                return ([], false);
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await JsonSerializer.DeserializeAsync<List<GitHubRepoPayload>>(
                stream, SerializerOptions, cancellationToken);

            if (payload is null)
            {
                logger.LogWarning("GitHub returned an unreadable body for {Username}.", _options.Username);
                return ([], false);
            }

            var repos = payload
                .Where(r => !(_options.ExcludeForks && r.Fork))
                .Where(r => !(_options.ExcludeArchived && r.Archived))
                .OrderByDescending(r => r.PushedAt)
                .Take(_options.MaxRepos)
                .Select(r => new GitHubRepo(
                    r.Name,
                    r.FullName,
                    r.Description,
                    r.HtmlUrl,
                    r.Language,
                    r.StargazersCount,
                    r.ForksCount,
                    r.PushedAt,
                    r.Topics ?? []))
                .ToList();

            return (repos, true);
        }
        // A cancellation that isn't ours is an HttpClient timeout, so it belongs
        // with the other upstream failures; a genuine caller cancellation is
        // left to propagate.
        catch (Exception ex) when (ex is HttpRequestException or JsonException
            || (ex is OperationCanceledException && !cancellationToken.IsCancellationRequested))
        {
            logger.LogWarning(ex, "Could not reach GitHub for {Username}; serving an empty repository list.",
                _options.Username);
            return ([], false);
        }
    }

    /// <summary>GitHub's wire shape. Kept private so its churn never reaches our
    /// clients; only the fields mapped onto <see cref="GitHubRepo"/> matter.</summary>
    private sealed record GitHubRepoPayload
    {
        public string Name { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;
        public string? Description { get; init; }
        public string HtmlUrl { get; init; } = string.Empty;
        public string? Language { get; init; }
        public int StargazersCount { get; init; }
        public int ForksCount { get; init; }
        public DateTimeOffset? PushedAt { get; init; }
        public List<string>? Topics { get; init; }
        public bool Fork { get; init; }
        public bool Archived { get; init; }
    }
}

namespace Api.Models;

/// <summary>The slice of a GitHub repository the Projects page actually uses.
/// Deliberately narrower than GitHub's payload so the public API shape does not
/// drift when GitHub adds fields.</summary>
public sealed record GitHubRepo(
    string Name,
    string FullName,
    string? Description,
    string HtmlUrl,
    string? Language,
    int Stars,
    int Forks,
    DateTimeOffset? PushedAt,
    IReadOnlyList<string> Topics);

namespace Api.Models;

/// <summary>A curated project, from <c>Data/projects.json</c>.</summary>
/// <param name="RepoSlug"><c>"owner/name"</c>, the join key against
/// <see cref="GitHubRepo.FullName"/> so a card can show live repo stats.
/// <c>null</c> for projects with no public repository.</param>
/// <param name="Order">Ascending display order; ties fall back to file order.</param>
public sealed record Project(
    string Id,
    string Name,
    string Summary,
    string? Description,
    IReadOnlyList<string> Tech,
    string? RepoSlug,
    string? LiveUrl,
    string? ImageUrl,
    bool Featured,
    int Order);

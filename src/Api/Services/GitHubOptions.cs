namespace Api.Services;

/// <summary>Bound from the <c>GitHub</c> section of appsettings.</summary>
public sealed class GitHubOptions
{
    public const string SectionName = "GitHub";

    /// <summary>Account whose public repositories are listed.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>How long a successful response stays cached. GitHub allows 60
    /// unauthenticated requests per hour per IP, so one call an hour leaves
    /// plenty of headroom.</summary>
    public TimeSpan CacheDuration { get; set; } = TimeSpan.FromHours(1);

    /// <summary>How long an empty fallback stays cached after a failure. Short,
    /// so a transient GitHub outage doesn't blank the section for an hour, but
    /// long enough that we don't retry on every page load.</summary>
    public TimeSpan FailureCacheDuration { get; set; } = TimeSpan.FromMinutes(5);

    /// <summary>Cap on repositories returned, most recently pushed first.</summary>
    public int MaxRepos { get; set; } = 12;

    /// <summary>Drop forks from the list — they're rarely worth showing.</summary>
    public bool ExcludeForks { get; set; } = true;

    /// <summary>Drop archived repositories from the list.</summary>
    public bool ExcludeArchived { get; set; } = true;
}

namespace Api.Models;

/// <summary>Identity and public profiles, from <c>Data/profile.json</c>.</summary>
/// <param name="Bio">Paragraphs, rendered in order. Kept as separate strings so
/// the frontend can lay them out without parsing markup.</param>
public sealed record Profile(
    string Name,
    string Headline,
    string Location,
    IReadOnlyList<string> Bio,
    ProfileLinks Links);

/// <summary>
/// Profiles only, deliberately. There is no email address anywhere in the site's
/// content or markup — the résumé PDF is the one place it appears, which keeps
/// it off the pages a scraper walks.
/// </summary>
public sealed record ProfileLinks(
    string GitHub,
    string LinkedIn);

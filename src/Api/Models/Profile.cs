namespace Api.Models;

/// <summary>Identity and contact details, from <c>Data/profile.json</c>.</summary>
/// <param name="Bio">Paragraphs, rendered in order. Kept as separate strings so
/// the frontend can lay them out without parsing markup.</param>
public sealed record Profile(
    string Name,
    string Headline,
    string Location,
    IReadOnlyList<string> Bio,
    ProfileLinks Links);

public sealed record ProfileLinks(
    string GitHub,
    string LinkedIn,
    string Email);

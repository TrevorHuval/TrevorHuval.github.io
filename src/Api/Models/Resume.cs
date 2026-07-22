namespace Api.Models;

/// <summary>Work history, from <c>Data/resume.json</c>.</summary>
public sealed record Resume(
    IReadOnlyList<ExperienceEntry> Experience,
    IReadOnlyList<EducationEntry> Education,
    IReadOnlyList<Certification> Certifications);

/// <param name="StartDate">Month precision, <c>"2023-01"</c>. Dates stay strings
/// because they are only ever displayed, never compared or arithmetic'd.</param>
/// <param name="EndDate"><c>null</c> means the role is current.</param>
public sealed record ExperienceEntry(
    string Company,
    string Title,
    string Location,
    string StartDate,
    string? EndDate,
    IReadOnlyList<string> Highlights,
    IReadOnlyList<string> Tech);

public sealed record EducationEntry(
    string Institution,
    string Degree,
    string? Field,
    string StartDate,
    string? EndDate,
    string? Notes);

public sealed record Certification(
    string Name,
    string Issuer,
    string IssueDate,
    string? ExpiryDate,
    string? CredentialUrl);

namespace Api.Models;

/// <summary>One labelled cluster of skills, from <c>Data/skills.json</c>.</summary>
public sealed record SkillGroup(
    string Name,
    IReadOnlyList<string> Items);

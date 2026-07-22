using System.Text.Json;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Reads the JSON files in <c>Data/</c> once and holds them in memory. The site's
/// content is a few kilobytes that only changes on redeploy, so loading it at
/// startup beats re-reading per request and gives us a fail-fast check: a
/// malformed or incomplete content file stops the app from starting instead of
/// surfacing as an empty panel in production.
/// </summary>
public sealed class ContentService
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        // Content files are hand-edited, so tolerate the things humans leave
        // behind, but not a missing required field.
        AllowTrailingCommas = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        RespectRequiredConstructorParameters = true,
        RespectNullableAnnotations = true,
    };

    public Profile Profile { get; }
    public Resume Resume { get; }
    public IReadOnlyList<SkillGroup> Skills { get; }
    public IReadOnlyList<Project> Projects { get; }
    public IReadOnlyList<Photo> Photos { get; }

    public ContentService(IHostEnvironment environment)
        : this(Path.Combine(environment.ContentRootPath, "Data"))
    {
    }

    /// <param name="dataDirectory">Folder holding the five content files. Taken
    /// explicitly so tests can point at the real files without a host.</param>
    public ContentService(string dataDirectory)
    {
        Profile = Load<Profile>(dataDirectory, "profile.json");
        Resume = Load<Resume>(dataDirectory, "resume.json");
        Skills = Load<List<SkillGroup>>(dataDirectory, "skills.json");
        Projects = [.. Load<List<Project>>(dataDirectory, "projects.json").OrderBy(p => p.Order)];
        Photos = Load<List<Photo>>(dataDirectory, "photos.json");
    }

    private static T Load<T>(string dataDirectory, string fileName)
    {
        var path = Path.Combine(dataDirectory, fileName);

        if (!File.Exists(path))
        {
            throw new ContentLoadException($"Content file not found: {path}");
        }

        try
        {
            using var stream = File.OpenRead(path);
            return JsonSerializer.Deserialize<T>(stream, SerializerOptions)
                ?? throw new ContentLoadException($"Content file {fileName} deserialized to null.");
        }
        catch (JsonException ex)
        {
            throw new ContentLoadException($"Content file {fileName} is not valid: {ex.Message}", ex);
        }
    }
}

public sealed class ContentLoadException : Exception
{
    public ContentLoadException(string message) : base(message)
    {
    }

    public ContentLoadException(string message, Exception innerException) : base(message, innerException)
    {
    }
}

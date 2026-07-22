using System.Text.Json;
using Api.Services;

namespace Api.Tests;

/// <summary>
/// These run against the real files in <c>src/Api/Data</c> (copied into the test
/// output by the csproj), so they double as a content lint: a trailing comma
/// slip or a renamed field breaks the build instead of the deployed site.
/// </summary>
public sealed class ContentServiceTests
{
    private static readonly ContentService Content = new(DataDirectory);

    private static string DataDirectory => Path.Combine(AppContext.BaseDirectory, "Data");

    [Theory]
    [InlineData("profile.json")]
    [InlineData("resume.json")]
    [InlineData("skills.json")]
    [InlineData("projects.json")]
    [InlineData("photos.json")]
    public void EveryContentFileIsPresent(string fileName)
    {
        Assert.True(File.Exists(Path.Combine(DataDirectory, fileName)), $"{fileName} is missing from Data/.");
    }

    [Fact]
    public void ProfileDeserializes()
    {
        var profile = Content.Profile;

        Assert.False(string.IsNullOrWhiteSpace(profile.Name));
        Assert.False(string.IsNullOrWhiteSpace(profile.Headline));
        Assert.False(string.IsNullOrWhiteSpace(profile.Location));
        Assert.NotEmpty(profile.Bio);
        Assert.All(profile.Bio, paragraph => Assert.False(string.IsNullOrWhiteSpace(paragraph)));
        Assert.False(string.IsNullOrWhiteSpace(profile.Links.GitHub));
        Assert.False(string.IsNullOrWhiteSpace(profile.Links.LinkedIn));
        Assert.Contains("@", profile.Links.Email);
    }

    [Fact]
    public void ResumeDeserializes()
    {
        var resume = Content.Resume;

        Assert.NotEmpty(resume.Experience);
        Assert.NotEmpty(resume.Education);
        Assert.NotNull(resume.Certifications);

        Assert.All(resume.Experience, entry =>
        {
            Assert.False(string.IsNullOrWhiteSpace(entry.Company));
            Assert.False(string.IsNullOrWhiteSpace(entry.Title));
            Assert.NotEmpty(entry.Highlights);
        });
    }

    /// <summary>A <c>null</c> end date is how "present" is expressed, so the
    /// nullable has to survive the round trip rather than becoming "".</summary>
    [Fact]
    public void CurrentRoleHasNoEndDate()
    {
        var current = Content.Resume.Experience[0];

        Assert.Null(current.EndDate);
    }

    [Theory]
    [InlineData("startDate")]
    [InlineData("endDate")]
    public void ExperienceDatesUseMonthPrecision(string field)
    {
        foreach (var entry in Content.Resume.Experience)
        {
            var value = field == "startDate" ? entry.StartDate : entry.EndDate;

            if (value is null)
            {
                continue;
            }

            Assert.Matches(@"^\d{4}-\d{2}$", value);
        }
    }

    [Fact]
    public void SkillsDeserializeIntoNonEmptyGroups()
    {
        Assert.NotEmpty(Content.Skills);
        Assert.All(Content.Skills, group =>
        {
            Assert.False(string.IsNullOrWhiteSpace(group.Name));
            Assert.NotEmpty(group.Items);
        });

        Assert.Equal(
            Content.Skills.Select(g => g.Name).Distinct(StringComparer.OrdinalIgnoreCase).Count(),
            Content.Skills.Count);
    }

    [Fact]
    public void ProjectsDeserializeAndAreSortedByOrder()
    {
        Assert.NotEmpty(Content.Projects);
        Assert.All(Content.Projects, project =>
        {
            Assert.False(string.IsNullOrWhiteSpace(project.Id));
            Assert.False(string.IsNullOrWhiteSpace(project.Name));
            Assert.False(string.IsNullOrWhiteSpace(project.Summary));
            Assert.NotEmpty(project.Tech);
        });

        Assert.Equal(Content.Projects.OrderBy(p => p.Order).Select(p => p.Id), Content.Projects.Select(p => p.Id));
    }

    /// <summary>Ids are the React keys and the merge key for GitHub data.</summary>
    [Fact]
    public void ProjectAndPhotoIdsAreUnique()
    {
        Assert.Equal(Content.Projects.Select(p => p.Id).Distinct().Count(), Content.Projects.Count);
        Assert.Equal(Content.Photos.Select(p => p.Id).Distinct().Count(), Content.Photos.Count);
    }

    [Fact]
    public void PhotosDeserialize()
    {
        Assert.NotEmpty(Content.Photos);
        Assert.All(Content.Photos, photo =>
        {
            Assert.StartsWith("/", photo.Src);
            Assert.StartsWith("/", photo.Thumbnail);
            Assert.False(string.IsNullOrWhiteSpace(photo.Caption));
            Assert.False(string.IsNullOrWhiteSpace(photo.Album));
            Assert.True(photo.Width > 0, $"{photo.Id} needs a positive width.");
            Assert.True(photo.Height > 0, $"{photo.Id} needs a positive height.");
        });
    }

    /// <summary>
    /// A &lt;picture&gt; will not fall back to its &lt;img&gt; when a source it
    /// accepts fails to load, so an AVIF path that does not lead to a real file
    /// is a broken photo rather than a slow one. The pipeline writes these in
    /// lockstep with the JPEGs; this catches a hand edit that breaks the pair.
    /// </summary>
    [Fact]
    public void PhotoAvifPathsMirrorTheirJpegs()
    {
        foreach (var photo in Content.Photos)
        {
            AssertMirrors(photo.Src, photo.SrcAvif, photo.Id);
            AssertMirrors(photo.Thumbnail, photo.ThumbnailAvif, photo.Id);
        }

        static void AssertMirrors(string jpeg, string? avif, string id)
        {
            if (avif is null)
            {
                return;
            }

            Assert.Equal(Path.ChangeExtension(jpeg, ".avif"), avif);
            Assert.EndsWith(".jpg", jpeg, StringComparison.Ordinal);
        }
    }

    [Fact]
    public void PhotoDatesAreIsoDates()
    {
        foreach (var photo in Content.Photos.Where(p => p.Date is not null))
        {
            Assert.True(
                DateOnly.TryParse(photo.Date, out _),
                $"{photo.Id} has an unparseable date: {photo.Date}");
        }
    }

    [Fact]
    public void MissingDataDirectoryFailsLoudly()
    {
        var missing = Path.Combine(DataDirectory, "does-not-exist");

        var ex = Assert.Throws<ContentLoadException>(() => new ContentService(missing));
        Assert.Contains("profile.json", ex.Message);
    }

    /// <summary>Startup should reject incomplete content rather than serve a
    /// half-populated object, so a missing required field must throw.</summary>
    [Fact]
    public void IncompleteContentFileFailsLoudly()
    {
        var directory = Directory.CreateTempSubdirectory("content-tests-");

        try
        {
            // profile.json without the required "links" property.
            File.WriteAllText(
                Path.Combine(directory.FullName, "profile.json"),
                """{ "name": "Test", "headline": "h", "location": "l", "bio": ["b"] }""");

            var ex = Assert.Throws<ContentLoadException>(() => new ContentService(directory.FullName));
            Assert.IsType<JsonException>(ex.InnerException);
        }
        finally
        {
            directory.Delete(recursive: true);
        }
    }
}

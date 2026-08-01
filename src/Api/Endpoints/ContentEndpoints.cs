using Api.Models;
using Api.Services;

namespace Api.Endpoints;

/// <summary>The site's own content: everything served straight out of
/// <c>Data/</c> via <see cref="ContentService"/>.</summary>
public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/profile", (ContentService content) => TypedResults.Ok(content.Profile))
            .WithName("GetProfile")
            .WithSummary("Name, headline, bio paragraphs, location and social links.");

        api.MapGet("/resume", (ContentService content) => TypedResults.Ok(content.Resume))
            .WithName("GetResume")
            .WithSummary("Work experience and education.");

        api.MapGet("/skills", (ContentService content) => TypedResults.Ok(content.Skills))
            .WithName("GetSkills")
            .WithSummary("Skills grouped by category.");

        api.MapGet("/projects", (ContentService content) => TypedResults.Ok(content.Projects))
            .WithName("GetProjects")
            .WithSummary("Curated projects, ordered for display.");

        api.MapGet("/photos", (ContentService content) => TypedResults.Ok(content.Photos))
            .WithName("GetPhotos")
            .WithSummary("Gallery metadata for the photo grid and lightbox.");

        return api;
    }
}

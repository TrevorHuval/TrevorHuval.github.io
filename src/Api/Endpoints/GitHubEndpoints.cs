using Api.Services;

namespace Api.Endpoints;

public static class GitHubEndpoints
{
    public static IEndpointRouteBuilder MapGitHubEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/github/repos", async (GitHubService github, CancellationToken cancellationToken) =>
                TypedResults.Ok(await github.GetReposAsync(cancellationToken)))
            .WithName("GetGitHubRepos")
            .WithSummary("Public repositories, most recently pushed first.")
            .WithDescription(
                "Cached in memory for an hour to stay well inside GitHub's unauthenticated rate limit. " +
                "Returns an empty list rather than an error if GitHub is unreachable, so the curated " +
                "projects still render.");

        return api;
    }
}

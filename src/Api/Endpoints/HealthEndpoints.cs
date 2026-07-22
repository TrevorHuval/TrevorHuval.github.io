using Api.Models;
using Microsoft.Net.Http.Headers;

namespace Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/health", (HttpContext http) =>
            {
                // A liveness probe answered from a cache is not a liveness
                // probe. Set here rather than left to the group's default,
                // which only fills in a policy nothing else has chosen.
                http.Response.GetTypedHeaders().CacheControl =
                    new CacheControlHeaderValue { NoStore = true, NoCache = true };

                return TypedResults.Ok(new HealthStatus("ok", DateTimeOffset.UtcNow));
            })
            .WithName("GetHealth")
            .WithSummary("Liveness probe, used by the App Runner health check.");

        return api;
    }
}

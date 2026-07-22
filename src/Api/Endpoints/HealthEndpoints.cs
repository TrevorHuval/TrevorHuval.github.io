using Api.Models;

namespace Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/health", () => TypedResults.Ok(new HealthStatus("ok", DateTimeOffset.UtcNow)))
            .WithName("GetHealth")
            .WithSummary("Liveness probe, used by the App Runner health check.");

        return api;
    }
}

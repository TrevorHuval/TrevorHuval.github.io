var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// API routes are registered before the SPA wiring so they always take priority
// over the static-file fallback below.
var api = app.MapGroup("/api");

api.MapGet("/health", () => new HealthStatus("ok", DateTimeOffset.UtcNow));

// In production the built React app lives in wwwroot and is served from the
// same origin as the API, with unmatched routes falling back to index.html so
// client-side routing survives deep links and refreshes. In development
// wwwroot is empty: the Vite dev server serves the app and proxies /api here.
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();

internal sealed record HealthStatus(string Status, DateTimeOffset Timestamp);

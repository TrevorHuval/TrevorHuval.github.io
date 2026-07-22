using System.Net.Http.Headers;
using Api.Endpoints;
using Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

// Content is read from disk once and shared; see ContentService for why.
builder.Services.AddSingleton<ContentService>();

builder.Services.AddOptions<GitHubOptions>()
    .Bind(builder.Configuration.GetSection(GitHubOptions.SectionName));

builder.Services.AddHttpClient<GitHubService>(client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
    // GitHub rejects requests without a User-Agent, and pinning the API version
    // keeps the payload shape stable.
    client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("personalSite", "1.0"));
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
    client.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

// Resolve the content eagerly so a malformed content file fails startup rather
// than the first request that needs it.
_ = app.Services.GetRequiredService<ContentService>();

if (app.Environment.IsDevelopment())
{
    // Served at /openapi/v1.json for dev-time inspection.
    app.MapOpenApi();
}

// API routes are registered before the SPA wiring so they always take priority
// over the static-file fallback below.
var api = app.MapGroup("/api");

api.MapHealthEndpoints();
api.MapContentEndpoints();
api.MapGitHubEndpoints();

// Catch-all routes lose to literal ones, so this only takes effect for /api
// paths nothing above matched. Without it a typo'd endpoint would drop through
// to the static-file fallback and answer with the SPA shell in production.
api.Map("/{*path}", () => Results.NotFound()).ExcludeFromDescription();

// In production the built React app lives in wwwroot and is served from the
// same origin as the API, with unmatched routes falling back to index.html so
// client-side routing survives deep links and refreshes. In development
// wwwroot is empty: the Vite dev server serves the app and proxies /api here.
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();

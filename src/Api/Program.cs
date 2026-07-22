using System.Net.Http.Headers;
using Api;
using Api.Endpoints;
using Api.Services;
using Microsoft.AspNetCore.ResponseCompression;
// Both header namespaces define a CacheControlHeaderValue; the HttpClient
// configuration below needs the System one, the response headers need this one.
using CacheControlHeaderValue = Microsoft.Net.Http.Headers.CacheControlHeaderValue;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // The content root defaults to the *working directory*, which makes a
    // published app depend on where it was launched from — `dotnet
    // artifacts/.../Api.dll` from the repo root would look for Data/ and
    // wwwroot/ in the repo root and fail at startup. Both ship next to the
    // assembly, so that is where they are read from. Development is unaffected:
    // the build copies Data/*.json into the output directory, and content is
    // loaded once at startup, so a content edit needs a restart either way.
    ContentRootPath = AppContext.BaseDirectory,
});

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

// The JavaScript bundle is ~270 KB and compresses to under a third of that.
// Nothing in front of this app compresses for it — App Runner terminates TLS
// and passes the body straight through — so it does its own. Defaults are kept
// for HTTPS (off), which is the safe side of the BREACH trade and moot here
// anyway, since the container only ever speaks plain HTTP behind the edge.
builder.Services.AddResponseCompression(options =>
{
    // The defaults miss the two types this site actually serves most of.
    options.MimeTypes =
    [
        .. ResponseCompressionDefaults.MimeTypes,
        "image/svg+xml",
        "application/manifest+json",
    ];
});

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

// Ahead of the endpoints and the static files, so it can compress both.
app.UseResponseCompression();

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

// Everything under /api is a GET of content that changes when Trevor deploys,
// not between requests, so a few minutes in a browser cache costs nothing and
// saves a round trip on every page change. An endpoint that needs something
// stricter — /health, which must never answer from a cache — sets its own
// header, and this leaves it alone.
api.AddEndpointFilter(async (context, next) =>
{
    var result = await next(context);

    // The result has not been written yet — Response.StatusCode is still the
    // untouched default here — so the verdict has to come from the result
    // itself. Only a good answer is worth keeping: caching a 404 would hand
    // the same miss back for five minutes after the route was fixed.
    var status = (result as IStatusCodeHttpResult)?.StatusCode ?? StatusCodes.Status200OK;

    if (status is >= 200 and < 300)
    {
        context.HttpContext.Response.GetTypedHeaders().CacheControl ??= new CacheControlHeaderValue
        {
            Public = true,
            MaxAge = TimeSpan.FromMinutes(5),
        };
    }

    return result;
});

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
var staticFiles = new StaticFileOptions { OnPrepareResponse = StaticAssets.SetCaching };

app.UseDefaultFiles();
app.UseStaticFiles(staticFiles);

// The same options on the fallback, or every deep link would serve an
// index.html carrying the default (absent) cache policy.
app.MapFallbackToFile("index.html", staticFiles);

app.Run();

using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;

namespace Api;

/// <summary>Cache policy for everything served out of <c>wwwroot</c>.</summary>
public static class StaticAssets
{
    /// <summary>
    /// Vite writes its JavaScript and CSS under <c>/assets</c> with a content
    /// hash in every filename, so a changed file is a changed URL and the old
    /// one can be held forever.
    /// </summary>
    private static readonly TimeSpan Fingerprinted = TimeSpan.FromDays(365);

    /// <summary>
    /// Photographs, the résumé PDF and the icons keep stable names, so a cache
    /// entry has to expire for a replacement to be seen. A week is long enough
    /// to matter on a repeat visit and short enough that swapping a photo does
    /// not need a deployment to be noticed.
    /// </summary>
    private static readonly TimeSpan Stable = TimeSpan.FromDays(7);

    public static void SetCaching(StaticFileResponseContext context)
    {
        var headers = context.Context.Response.GetTypedHeaders();
        var path = context.Context.Request.Path;

        // index.html names every other asset, so caching it is how a deploy
        // goes unseen. It always revalidates; everything it points at is
        // fingerprinted, which is what makes that cheap.
        if (context.File.Name.Equals("index.html", StringComparison.OrdinalIgnoreCase))
        {
            headers.CacheControl = new CacheControlHeaderValue { NoCache = true, MustRevalidate = true };
            return;
        }

        var fingerprinted = path.StartsWithSegments("/assets", StringComparison.OrdinalIgnoreCase);

        var cacheControl = new CacheControlHeaderValue
        {
            Public = true,
            MaxAge = fingerprinted ? Fingerprinted : Stable,
        };

        // `immutable` is what stops a browser revalidating on a reload; it is
        // only ever true of a URL that changes when its bytes change.
        if (fingerprinted)
        {
            cacheControl.Extensions.Add(new NameValueHeaderValue("immutable"));
        }

        headers.CacheControl = cacheControl;
    }
}

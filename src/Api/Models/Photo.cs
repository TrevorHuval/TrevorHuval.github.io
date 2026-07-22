namespace Api.Models;

/// <summary>Gallery metadata, from <c>Data/photos.json</c>. The image files
/// themselves are static assets under the web root.</summary>
/// <param name="Src">Web-root-relative path to the full-size image.</param>
/// <param name="Width">Intrinsic dimensions of the full-size image, used to
/// reserve layout space before it loads.</param>
/// <param name="SrcAvif">Optional AVIF twin of <paramref name="Src"/>, written
/// by the image pipeline (<c>npm run photos</c>). Null means only the JPEG
/// exists — a browser given a <c>&lt;source&gt;</c> whose file 404s will not
/// fall back, so the frontend must offer AVIF only when it is really there.
/// </param>
public sealed record Photo(
    string Id,
    string Src,
    string Thumbnail,
    string Caption,
    string? Location,
    string? Date,
    string Album,
    int Width,
    int Height,
    string? SrcAvif = null,
    string? ThumbnailAvif = null);

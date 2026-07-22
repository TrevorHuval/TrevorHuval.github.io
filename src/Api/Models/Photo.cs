namespace Api.Models;

/// <summary>Gallery metadata, from <c>Data/photos.json</c>. The image files
/// themselves are static assets under the web root.</summary>
/// <param name="Src">Web-root-relative path to the full-size image.</param>
/// <param name="Width">Intrinsic dimensions of the full-size image, used to
/// reserve layout space before it loads.</param>
public sealed record Photo(
    string Id,
    string Src,
    string Thumbnail,
    string Caption,
    string? Location,
    string? Date,
    string Album,
    int Width,
    int Height);

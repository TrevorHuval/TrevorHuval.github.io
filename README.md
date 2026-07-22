# personalSite

Trevor Huval's personal website: an About Me, resume (HTML + PDF download), a
projects showcase, a skills/experience timeline, and a photo gallery.

**Stack:** .NET 10 minimal API + React (Vite, TypeScript, Tailwind v4). In
production the .NET app serves both the API and the built React assets from a
single container.

## Layout

```
personalSite.slnx
src/
  Api/        .NET 10 minimal API — serves /api/* and, in production, the SPA
    Data/     site content as JSON — see src/Api/Data/README.md
    Models/   DTO records
    Services/ ContentService, GitHubService
    Endpoints/route registrations
  web/        Vite + React + TypeScript + Tailwind frontend
tests/
  Api.Tests/  xUnit tests over the real content files
```

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org)

## Running in development

The two servers run separately. Start the API first:

```bash
dotnet run --project src/Api
```

It listens on <http://localhost:5000> (see `src/Api/Properties/launchSettings.json`).

Then, in a second terminal, start the frontend:

```bash
npm install --prefix src/web && npm run dev --prefix src/web
```

Open <http://localhost:5173>. Vite proxies `/api` to the API on port 5000
(configured in `src/web/vite.config.ts`), so the app talks to a single origin in
development just as it does in production — always fetch relative `/api/...`
paths, never an absolute API URL.

Quick check that the plumbing is live:

```bash
curl http://localhost:5173/api/health
```

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/health` | Liveness probe |
| `GET /api/profile` | Name, headline, bio, location, social links |
| `GET /api/resume` | Experience, education, certifications |
| `GET /api/skills` | Skill groups |
| `GET /api/projects` | Curated projects, display-ordered |
| `GET /api/photos` | Gallery metadata |
| `GET /api/github/repos` | Public repos, most recently pushed first |

Everything but `/api/github/repos` is served from the JSON files in
`src/Api/Data/` — see [the content README](src/Api/Data/README.md) for the file
shapes and editing conventions. The files are read once at startup, so restart
the API after editing content.

`/api/github/repos` hits GitHub unauthenticated and caches the result in memory
for an hour, well inside the 60-requests-per-hour rate limit. If GitHub is
unreachable it returns an empty list rather than an error, so the curated
projects still render. The account is set by `GitHub:Username` in
`appsettings.json`.

In development the OpenAPI document is at
<http://localhost:5000/openapi/v1.json>.

## Content

All site copy lives in `src/Api/Data/*.json` — nothing is hardcoded in
components. Placeholder text is marked `TODO: Trevor fills in`:

```bash
grep -rn "TODO: Trevor fills in" src/Api/Data
```

## Testing

```bash
dotnet test
```

The tests deserialize the real content files, so a malformed or incomplete one
fails the build rather than the deployed site.

## Media

Gallery images and the social card are generated, not hand-made. Both scripts
are authoring steps — their output is committed, so a normal build never runs
them.

```bash
npm run photos --prefix src/web   # resize originals, refresh photos.json
npm run og --prefix src/web       # og.png, apple-touch-icon.png, site.webmanifest
```

See [the content README](src/Api/Data/README.md) for what `npm run photos`
takes as input and what it writes.

## Building

```bash
dotnet publish src/Api -c Release -o out
```

That is the whole build: an MSBuild target in `src/Api/Api.csproj` runs
`npm ci` (when needed) and `npm run build`, which writes the frontend into
`src/Api/wwwroot`, and the published app then serves the API and the site
together on one port.

```bash
dotnet out/Api.dll     # http://localhost:5000 — the whole site
```

`/api/*` routes take priority and everything else falls back to `index.html`
for client-side routing. Hashed assets under `/assets` are cached for a year
and marked `immutable`; `index.html` always revalidates, so a deploy is picked
up immediately. Responses are compressed by the app itself, since nothing in
front of it will be.

Set `SITE_URL` before building to bake absolute Open Graph URLs and emit a
`sitemap.xml`:

```bash
SITE_URL=https://example.com dotnet publish src/Api -c Release -o out
```

Without it the build still succeeds — Open Graph paths stay root-relative and
no sitemap is written.

To build the frontend alone (for a Docker stage that has node but not the SDK,
or just to iterate):

```bash
npm run build --prefix src/web
dotnet publish src/Api -c Release -o out -p:SkipSpaBuild=true
```

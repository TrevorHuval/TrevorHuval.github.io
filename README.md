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
  web/        Vite + React + TypeScript + Tailwind frontend
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

## Building

```bash
npm run build --prefix src/web
dotnet build
```

In production the frontend build output is served from the API's `wwwroot`, with
`/api/*` routes taking priority and everything else falling back to
`index.html` for client-side routing.

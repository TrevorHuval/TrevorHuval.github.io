# Site content

Every piece of copy on the site lives in this folder. Nothing here is compiled
in — edit a file, restart the API, and the site changes. `ContentService` reads
all five files once at startup and holds them in memory, so a running instance
will not pick up edits until it restarts.

Anything still reading **`TODO: Trevor fills in`** is placeholder text waiting on
real content. Search the folder for `TODO:` to find what's left.

| File | Shape | Served at |
| --- | --- | --- |
| `profile.json` | object | `GET /api/profile` |
| `resume.json` | object with `experience`, `education`, `certifications` | `GET /api/resume` |
| `skills.json` | array of groups | `GET /api/skills` |
| `projects.json` | array of projects | `GET /api/projects` |
| `photos.json` | array of photos | `GET /api/photos` |

## Conventions

- **Dates** are strings, not timestamps: `"2024-06"` for month precision
  (experience, education, certifications) and `"2024-06-15"` for photos. The
  frontend decides how to display them. A `null` `endDate` means "present".
- **Fields typed as nullable in the DTOs** (`description`, `liveUrl`,
  `location`, `notes`, …) can be set to `null` and the UI will drop the
  corresponding element rather than render an empty one. Every other field is
  required — a missing one fails deserialization and the API refuses to start,
  which is deliberate: content bugs should surface immediately, not as blank
  panels in production.
- **Property names are camelCase** and must match the record properties in
  `src/Api/Models/`. Adding a field means changing the record too.

## Photos

`src` and `thumbnail` are web-root-relative paths, so the files belong in
`src/web/public/photos/` (and `src/web/public/photos/thumbs/`) — Vite serves
that folder at `/` in dev and it is copied into `wwwroot` for production. The
four entries here point at placeholder filenames that do not exist yet; drop
real images in with matching names, or rename the entries to match the images.

`width` and `height` are the intrinsic pixel dimensions of the **full-size**
image. The gallery uses them to reserve space before the image loads, so wrong
values mean layout shift.

## Projects and GitHub

`repoSlug` (`"owner/name"`) is the join key between a curated project here and
the live repository data from `GET /api/github/repos`. Set it to pull stars,
language, and last-pushed date onto the project card; leave it `null` for
projects with no public repo.

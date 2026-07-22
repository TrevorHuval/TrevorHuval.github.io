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

`src`, `srcAvif`, `thumbnail`, `thumbnailAvif`, `width` and `height` are all
**generated** — do not hand-edit them. The pipeline owns the files, you own the
words (`caption`, `location`, `date`, `album`):

```bash
npm run photos --prefix src/web
```

It reads the originals named in `src/web/scripts/photo-sources.json` (from
`~/Pictures/personalSitePics`, or wherever `PHOTOS_SRC` points), writes a
2000px JPEG and AVIF plus an 800px thumbnail of each into
`src/web/public/photos/`, and updates the six generated fields here to match.
Adding a photo means adding an entry with the words filled in, mapping its id to
a source file in `photo-sources.json`, and running the script. Anything with no
mapping is left alone, so a hand-added photo keeps working.

`width` and `height` are the intrinsic pixel dimensions of the **full-size**
image; the gallery reserves space from them before the image loads, so a wrong
value means layout shift. `npm run photos -- --check` verifies them against
what is actually on disk without re-encoding anything.

The AVIF paths must lead to real files: a `<picture>` does **not** fall back to
its `<img>` when a source it accepts fails to load. Set them to `null` for a
photo the pipeline did not produce, and it will serve the JPEG alone.

## Projects and GitHub

`repoSlug` (`"owner/name"`) is the join key between a curated project here and
the live repository data from `GET /api/github/repos`. Set it to pull stars,
language, and last-pushed date onto the project card; leave it `null` for
projects with no public repo.

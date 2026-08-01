/**
 * Wire shapes for the API. These mirror the C# records in `src/Api/Models/`
 * one-for-one — if a record changes there, change it here too.
 *
 * Note the camelCase of `gitHub` / `linkedIn` on {@link ProfileLinks}: that is
 * what System.Text.Json's default naming policy produces from the C# `GitHub`
 * and `LinkedIn` properties, and it is what actually comes down the wire.
 */

/**
 * Profiles only. There is no email address in the site's content or markup by
 * design — the résumé PDF is the single place it appears.
 */
export interface ProfileLinks {
  gitHub: string
  linkedIn: string
}

export interface Profile {
  name: string
  headline: string
  location: string
  /** Paragraphs, rendered in order. */
  bio: string[]
  links: ProfileLinks
}

export interface ExperienceEntry {
  company: string
  title: string
  location: string
  /** Month precision, e.g. `"2023-01"`. */
  startDate: string
  /** `null` means the role is current. */
  endDate: string | null
  highlights: string[]
  tech: string[]
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string | null
  startDate: string
  endDate: string | null
  notes: string | null
}

export interface Resume {
  experience: ExperienceEntry[]
  education: EducationEntry[]
}

export interface SkillGroup {
  name: string
  items: string[]
}

export interface Project {
  id: string
  name: string
  summary: string
  description: string | null
  tech: string[]
  /** `"owner/name"`, the join key against {@link GitHubRepo.fullName}. */
  repoSlug: string | null
  liveUrl: string | null
  imageUrl: string | null
  featured: boolean
  order: number
}

export interface Photo {
  id: string
  src: string
  thumbnail: string
  /**
   * AVIF twins written by the image pipeline. `null` when only the JPEG exists:
   * a `<picture>` will not fall back if a `<source>` it accepts turns out to be
   * missing, so these are offered only when the pipeline really produced them.
   */
  srcAvif: string | null
  thumbnailAvif: string | null
  caption: string
  location: string | null
  date: string | null
  album: string
  width: number
  height: number
}

export interface GitHubRepo {
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  language: string | null
  stars: number
  forks: number
  pushedAt: string | null
  topics: string[]
}

export interface HealthStatus {
  status: string
  timestamp: string
}

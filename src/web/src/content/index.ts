/**
 * The site's content, resolved at build time.
 *
 * Every word on this site is in one of the JSON files in this folder. They
 * are imported rather than fetched, which is the whole point: the content is
 * already in the repository at build time, so making the browser ask for it
 * again would only buy a loading spinner. It also means TypeScript checks the
 * files against `types.ts` — a typo in a key name fails `tsc` instead of
 * rendering a blank panel in production.
 *
 * The annotations below are load-bearing. Without them these would be inferred
 * as their own literal shapes and nothing would ever be validated.
 */

import photosJson from './photos.json'
import profileJson from './profile.json'
import projectsJson from './projects.json'
import resumeJson from './resume.json'
import skillsJson from './skills.json'
import presentationJson from './presentation.json'
import type { Photo, Presentation, Profile, Project, Resume, SkillGroup } from './types'

export const profile: Profile = profileJson
export const resume: Resume = resumeJson
export const skills: SkillGroup[] = skillsJson
export const photos: Photo[] = photosJson
export const presentation: Presentation = presentationJson

/**
 * Display order is content, not code — `order` in the JSON decides it, the way
 * it did when the API sorted these on the way out. Sorted once here so no page
 * has to remember to.
 */
export const projects: Project[] = [...projectsJson].sort((a, b) => a.order - b.order)

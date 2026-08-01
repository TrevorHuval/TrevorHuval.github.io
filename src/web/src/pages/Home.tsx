import { Link } from 'react-router-dom'
import { photos, profile, resume, skills } from '../content'
import PhotoImage from '../components/PhotoImage'
import SkillsGrid from '../components/SkillsGrid'
import Timeline from '../components/Timeline'
import { ArrowUpRightIcon, DownloadIcon } from '../components/Icons'
import { ActionLink, Section } from '../components/Ui'
import { usePageMeta } from '../lib/usePageMeta'

/**
 * The one page most visitors will read all of, so it carries the whole story in
 * order: who, then what he can do, then what he has done, then the life around
 * it. Every section reads from imported content, so the whole page arrives in
 * the first paint — there is nothing here to wait for.
 */
export default function Home() {
  // No override: the home page is what index.html's build-time title and
  // description were written for.
  usePageMeta()

  return (
    <div className="flex flex-col gap-20 sm:gap-24">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <PhotoTeaser />
    </div>
  )
}

function Hero() {
  return (
    /* Left-aligned and editorial rather than a centred card: the name is the
       focal point of the whole site and wins on sheer scale, with nothing
       competing beside it. */
    <section className="flex flex-col items-start gap-6 pt-6">
      <p className="gutter-date">{profile.location}</p>

      <h1 className="text-3xl font-semibold text-ink sm:text-display">{profile.name}</h1>

      <p className="max-w-[36ch] text-lg text-ink-muted sm:text-xl">{profile.headline}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <ActionLink to="/resume" variant="primary">
          <DownloadIcon className="size-4" />
          View resume
        </ActionLink>
        <ActionLink to="/projects">
          See the work
          <ArrowUpRightIcon className="size-4 opacity-60" />
        </ActionLink>
      </div>
    </section>
  )
}

function About() {
  return (
    <Section eyebrow="About" title="A little background">
      {/* Capped at 68 characters — past that the eye loses the line on the
          return sweep, however wide the viewport gets. */}
      <div className="flex max-w-[68ch] flex-col gap-4">
        {profile.bio.map((paragraph, index) => (
          <p key={index} className="text-base text-ink-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  )
}

function Skills() {
  return (
    <Section eyebrow="Toolkit" title="Skills">
      <SkillsGrid groups={skills} />
    </Section>
  )
}

function Experience() {
  return (
    <Section eyebrow="Experience" title="Where I've worked">
      <Timeline entries={resume.experience} maxHighlights={3} />
      <div>
        <ActionLink to="/resume">
          Full resume
          <ArrowUpRightIcon className="size-4 opacity-60" />
        </ActionLink>
      </div>
    </Section>
  )
}

/** A four-frame teaser. Enough to show the gallery exists and is worth a click;
 * the page itself does the actual work. */
function PhotoTeaser() {
  return (
    <Section eyebrow="Elsewhere" title="Life and travels">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.slice(0, 4).map((photo) => (
          <li key={photo.id}>
            <Link
              to="/photos"
              aria-label={`Photo gallery: ${photo.caption}`}
              className="block overflow-hidden rounded-card transition-[transform,box-shadow] duration-200 ease-out-quint hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift-high)]"
            >
              {/* Square crops here on purpose — the strip is a rhythm device,
                  and the real aspect ratios get their moment on /photos. */}
              <PhotoImage
                src={photo.thumbnail}
                avif={photo.thumbnailAvif}
                alt={photo.caption}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 640px) 16rem, 45vw"
                crop
                className="aspect-square w-full rounded-card object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <ActionLink to="/photos">
          See the gallery
          <ArrowUpRightIcon className="size-4 opacity-60" />
        </ActionLink>
      </div>
    </Section>
  )
}

import { photos, presentation, profile, resume, skills } from '../content'
import HeroCarousel from '../components/HeroCarousel'
import ResumeAction from '../components/ResumeAction'
import SkillsGrid from '../components/SkillsGrid'
import Timeline from '../components/Timeline'
import { ArrowUpRightIcon } from '../components/Icons'
import { ActionLink, Section } from '../components/Ui'
import { usePageMeta } from '../lib/usePageMeta'

const copy = presentation.home

/**
 * Who, then the life around it (the carousel), then what he can do and what he
 * has done. One plain heading per section; the eyebrow treatment is reserved
 * for the hero.
 */
export default function Home() {
  usePageMeta()

  return (
    <div className="home-sections">
      <section className="home-hero">
        <div className="hero-intro">
          <p className="gutter-date">{copy.eyebrow}</p>
          <h1 className="hero-name">{profile.name}</h1>
          <p className="hero-description">{profile.headline}</p>
          <div className="hero-actions">
            <ResumeAction variant="primary">View resume</ResumeAction>
            <ActionLink to="/projects">See the work<ArrowUpRightIcon className="size-4" /></ActionLink>
          </div>
          <p className="hero-location gutter-date">{profile.location}</p>
        </div>
        <HeroCarousel photos={photos} />
      </section>

      <Section title={copy.aboutTitle} className="editorial-section">
        <div className="bio-copy">{profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </Section>

      <Section title={copy.skillsTitle} className="editorial-section">
        <SkillsGrid groups={skills} />
      </Section>

      <Section title={copy.experienceTitle} className="editorial-section">
        <div className="flex flex-col gap-6">
          <Timeline entries={resume.experience} maxHighlights={3} />
          <div><ActionLink to="/resume">Full resume<ArrowUpRightIcon className="size-4" /></ActionLink></div>
        </div>
      </Section>
    </div>
  )
}

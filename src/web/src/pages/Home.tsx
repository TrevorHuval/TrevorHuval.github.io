import { Link } from 'react-router-dom'
import { photos, presentation, profile, resume, skills } from '../content'
import PhotoImage from '../components/PhotoImage'
import SkillsGrid from '../components/SkillsGrid'
import Timeline from '../components/Timeline'
import { ArrowUpRightIcon } from '../components/Icons'
import ResumeAction from '../components/ResumeAction'
import { ActionLink, Section } from '../components/Ui'
import { usePageMeta } from '../lib/usePageMeta'

const copy = presentation.home
const heroPhotos = copy.photoIds.flatMap((id) => photos.filter((photo) => photo.id === id))

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
        <div className="hero-photos">
          {heroPhotos.map((photo, index) => (
            <Link key={photo.id} to="/photos" className={`hero-photo hero-photo-${index + 1}`} aria-label={`Photo gallery: ${photo.caption}`}>
              <PhotoImage src={photo.src} avif={photo.srcAvif} alt={photo.caption} width={photo.width} height={photo.height} crop eager className="h-full w-full object-cover" />
              <span className="photo-label glass-high"><span className="gutter-date">{String(photos.indexOf(photo) + 1).padStart(2, '0')}</span><span>{photo.location}</span><ArrowUpRightIcon className="size-4" /></span>
            </Link>
          ))}
        </div>
      </section>
      <section className="journal-section">
        <div className="section-heading-row">
          <div><p className="gutter-date">{copy.galleryEyebrow}</p><h2 className="section-title">{copy.galleryTitle}</h2></div>
          <ActionLink to="/photos">See the gallery<ArrowUpRightIcon className="size-4" /></ActionLink>
        </div>
        <ul className="contact-sheet">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <Link to="/photos" className="contact-frame" aria-label={`Photo gallery: ${photo.caption}`}>
                <PhotoImage src={photo.thumbnail} avif={photo.thumbnailAvif} alt={photo.caption} width={photo.width} height={photo.height} crop className="contact-image" />
                <span className="contact-caption"><span className="gutter-date">{String(index + 1).padStart(2, '0')}</span><span>{photo.location ?? photo.album}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Section eyebrow={copy.aboutEyebrow} title={copy.aboutTitle} className="editorial-section">
        <div className="bio-copy">{profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </Section>
      <Section eyebrow={copy.skillsEyebrow} title={copy.skillsTitle} className="editorial-section"><SkillsGrid groups={skills} /></Section>
      <Section eyebrow={copy.experienceEyebrow} title={copy.experienceTitle} className="editorial-section">
        <div className="flex flex-col gap-6"><Timeline entries={resume.experience} maxHighlights={3} /><div><ActionLink to="/resume">Full resume<ArrowUpRightIcon className="size-4" /></ActionLink></div></div>
      </Section>
    </div>
  )
}

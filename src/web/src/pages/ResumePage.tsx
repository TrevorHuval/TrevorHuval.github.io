import { useState } from 'react'
import { profile, resume, skills } from '../content'
import ResumeDialog, { RESUME_PDF } from '../components/ResumeDialog'
import SkillsGrid from '../components/SkillsGrid'
import Timeline from '../components/Timeline'
import { DocumentIcon, DownloadIcon } from '../components/Icons'
import { ActionButton, ActionLink, Section } from '../components/Ui'
import { formatRange } from '../lib/dates'
import { usePageMeta } from '../lib/usePageMeta'

/**
 * The résumé as a web page, with the PDF one click away for anyone who needs to
 * forward or print it. The HTML version is the primary artefact — it is what
 * gets read, linked and indexed.
 */
export default function ResumePage() {
  usePageMeta({
    title: 'Resume',
    description: 'Work experience, education and skills, with the printable PDF a click away.',
  })

  const [pdfOpen, setPdfOpen] = useState(false)

  return (
    <div className="flex flex-col gap-16">
      <ResumeHeader onViewPdf={() => setPdfOpen(true)} />
      <ResumeDialog open={pdfOpen} onClose={() => setPdfOpen(false)} />

      <Section eyebrow="Experience" title="Work">
        <Timeline entries={resume.experience} />
      </Section>

      <Section eyebrow="Education" title="Study">
        <ul className="flex flex-col gap-4">
          {resume.education.map((entry) => (
            <li
              key={`${entry.institution}-${entry.startDate}`}
              className="glass flex flex-col gap-1 rounded-card p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold text-ink">{entry.institution}</h3>
                <p className="gutter-date">{formatRange(entry.startDate, entry.endDate)}</p>
              </div>
              <p className="text-sm text-ink-muted">
                {entry.degree}
                {entry.field && `, ${entry.field}`}
              </p>
              {entry.notes && <p className="mt-1 text-sm text-ink-soft">{entry.notes}</p>}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Toolkit" title="Skills">
        <SkillsGrid groups={skills} />
      </Section>
    </div>
  )
}

function ResumeHeader({ onViewPdf }: { onViewPdf: () => void }) {
  return (
    <header className="flex flex-col gap-6 pt-6">
      <p className="gutter-date">Resume</p>

      <h1 className="text-3xl font-semibold text-ink">{profile.name}</h1>
      <p className="max-w-[48ch] text-lg text-ink-muted">{profile.headline}</p>

      <div className="flex flex-wrap items-center gap-3">
        {/* Trevor's real PDF, served straight out of the web root. It is also the
            only place on the site his email and phone number appear. */}
        <ActionButton variant="primary" onClick={onViewPdf} aria-haspopup="dialog">
          <DocumentIcon className="size-4" />
          View PDF
        </ActionButton>
        <ActionLink href={RESUME_PDF} download>
          <DownloadIcon className="size-4" />
          Download
        </ActionLink>
        <ActionLink href={profile.links.linkedIn} external>
          LinkedIn
        </ActionLink>
      </div>
    </header>
  )
}

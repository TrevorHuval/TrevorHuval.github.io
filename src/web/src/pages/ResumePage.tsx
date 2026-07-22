import { useResume, useSkills } from '../api/hooks'
import { useSiteProfile } from '../api/profile-context'
import SkillsGrid from '../components/SkillsGrid'
import Timeline from '../components/Timeline'
import { ArrowUpRightIcon, DownloadIcon } from '../components/Icons'
import { ErrorPanel, LoadingPanel, Skeleton } from '../components/States'
import { ActionLink, Section } from '../components/Ui'
import { formatMonth, formatRange } from '../lib/dates'
import { usePageMeta } from '../lib/usePageMeta'

/**
 * The résumé as a web page, with the PDF one click away for anyone who needs to
 * forward or print it. The HTML version is the primary artefact — it is what
 * gets read, linked and indexed.
 */
export default function ResumePage() {
  usePageMeta({
    title: 'Resume',
    description:
      'Work experience, education and certifications, with the printable PDF a click away.',
  })

  const { data: resume, error, loading, reload } = useResume()
  const skills = useSkills()

  return (
    <div className="flex flex-col gap-16">
      <ResumeHeader />

      <Section eyebrow="Experience" title="Work">
        {loading && <LoadingPanel label="Loading resume" lines={5} />}
        {error !== null && <ErrorPanel message={error} onRetry={reload} />}
        {resume && resume.experience.length > 0 && <Timeline entries={resume.experience} />}
      </Section>

      {resume && resume.education.length > 0 && (
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
      )}

      {resume && resume.certifications.length > 0 && (
        <Section eyebrow="Credentials" title="Certifications">
          <ul className="grid gap-4 sm:grid-cols-2">
            {resume.certifications.map((certification) => (
              <li
                key={`${certification.name}-${certification.issueDate}`}
                className="glass flex flex-col gap-1 rounded-card p-5"
              >
                <h3 className="text-meta font-semibold text-ink">{certification.name}</h3>
                <p className="text-sm text-ink-muted">{certification.issuer}</p>
                <p className="gutter-date mt-1.5">
                  Issued {formatMonth(certification.issueDate)}
                  {certification.expiryDate &&
                    ` · Expires ${formatMonth(certification.expiryDate)}`}
                </p>
                {certification.credentialUrl && (
                  <a
                    href={certification.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-meta font-medium text-ink-muted transition-colors duration-200 ease-out-quint hover:text-ember"
                  >
                    Verify
                    <ArrowUpRightIcon className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section eyebrow="Toolkit" title="Skills">
        {skills.loading && <LoadingPanel label="Loading skills" lines={3} />}
        {skills.error !== null && <ErrorPanel message={skills.error} onRetry={skills.reload} />}
        {skills.data && skills.data.length > 0 && <SkillsGrid groups={skills.data} />}
      </Section>
    </div>
  )
}

function ResumeHeader() {
  const { data, loading } = useSiteProfile()

  return (
    <header className="flex flex-col gap-6 pt-6">
      <p className="gutter-date">Resume</p>

      {loading ? (
        <>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold text-ink">{data?.name ?? 'Resume'}</h1>
          {data && <p className="max-w-[48ch] text-lg text-ink-muted">{data.headline}</p>}
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Trevor's real PDF, served straight out of the web root. */}
        <ActionLink href="/resume.pdf" variant="primary" download>
          <DownloadIcon className="size-4" />
          Download PDF
        </ActionLink>
        {data && (
          <ActionLink href={`mailto:${data.links.email}`}>{data.links.email}</ActionLink>
        )}
      </div>
    </header>
  )
}

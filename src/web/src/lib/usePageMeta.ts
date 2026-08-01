import { useEffect } from 'react'
import { profile } from '../content'

/**
 * Keeps the tab title and the crawlable meta in step with the route.
 *
 * A single-page app serves one `index.html` for every URL, so without this every
 * page shares one title and one description — which makes browser history,
 * bookmarks and search results all say the same thing.
 *
 * The site name is never written down here: it comes from `profile.json`, the
 * same file the build-time plugin reads to fill in `index.html`'s `<title>`, so
 * the delivered document and the rendered app cannot disagree.
 */

export interface PageMeta {
  /** Prefixed to the site name, e.g. `Photos · Trevor Huval`. */
  title: string
  /** One sentence, under ~160 characters — what a search result will show. */
  description: string
}

export function usePageMeta(page?: PageMeta) {
  const title = page === undefined ? profile.name : `${page.title} · ${profile.name}`
  const description = page?.description

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    if (description === undefined) return

    // The build-time description in index.html is the right one for the home
    // page, so only a page that brought its own overrides it.
    setMeta('name', 'description', description)
    setMeta('property', 'og:description', description)
  }, [description])

  useEffect(() => {
    setMeta('property', 'og:title', title)
    setMeta('name', 'twitter:title', title)
  }, [title])
}

/** Updates the tag if it is there and creates it if it is not. */
function setMeta(keyName: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${keyName}="${key}"]`
  let tag = document.head.querySelector<HTMLMetaElement>(selector)

  if (tag === null) {
    tag = document.createElement('meta')
    tag.setAttribute(keyName, key)
    document.head.appendChild(tag)
  }

  tag.content = content
}

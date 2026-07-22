import { useEffect } from 'react'

const SITE = 'Trevor Huval'

/**
 * Keeps the tab title in step with the route. Without this a single-page app
 * shows one title for every page, which makes browser history and bookmarks
 * useless. The fuller meta/OG pass lands in a later session.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE
  }, [title])
}

import { createContext, use } from 'react'
import type { AsyncState } from './hooks'
import type { Profile } from './types'

/**
 * The profile drives the nav, the footer and the whole Home hero. Fetching it
 * in each of those places would mean three identical requests on first paint,
 * so the layout fetches once and shares the result — including its loading and
 * error state, which consumers still have to render.
 *
 * The provider lives in `components/ProfileProvider.tsx` rather than here: a
 * module that exports both a component and a hook defeats fast refresh.
 */
export const ProfileContext = createContext<AsyncState<Profile> | null>(null)

export function useSiteProfile(): AsyncState<Profile> {
  const state = use(ProfileContext)

  if (state === null) {
    throw new Error('useSiteProfile must be used inside a ProfileProvider.')
  }

  return state
}

import { useProfile } from '../api/hooks'
import { ProfileContext } from '../api/profile-context'

/** Fetches the profile once and hands it to everything below. */
export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  const state = useProfile()

  return <ProfileContext value={state}>{children}</ProfileContext>
}

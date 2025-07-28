
import { getUserDigests } from '@/lib/database/digests'
import { DashboardClient } from './dashboard-client'

// Default user ID for open-source version (no auth)
const DEFAULT_USER_ID = 'anonymous';

export default async function DashboardPage() {
  // Use default user for open-source version
  const user = { id: DEFAULT_USER_ID, email: 'anonymous@localhost' };

  // Fetch user's digests
  const { data: digests, error: digestsError } = await getUserDigests(user.id, 50)
  console.log('Fetched user digests:', digests)
  if (digestsError) {
    console.error('Error fetching user digests:', digestsError)
    // Optionally handle the error, e.g., show a notification
  }
  return <DashboardClient user={user} digests={digests || []} />
}

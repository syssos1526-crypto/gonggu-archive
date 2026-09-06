import type { ReactNode } from 'react'
import { AdminShell } from '@/components/AdminShell'
import { requireAdminUser } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminUser()

  return <AdminShell>{children}</AdminShell>
}

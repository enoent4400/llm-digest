import { getDigestById } from '@/lib/database/digests'
import { notFound } from 'next/navigation'
import DigestPageClient from './digest-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DigestPageWrapper({ params }: PageProps) {
  const { id } = await params
  
  const { data: digest, error } = await getDigestById(id)
  
  if (error || !digest) {
    notFound()
  }
  
  return <DigestPageClient initialDigest={digest} />
}
import { LandingContent } from '@/components/LandingContent';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();

  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // Render landing page for unauthenticated users
  return <LandingContent />;
}

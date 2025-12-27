import { TechLibraryContent } from '@/components/TechLibraryContent';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const TECH_LABELS: Record<string, string> = {
  react: 'React',
  javascript: 'JavaScript',
  css: 'CSS',
};

// Initialize Convex client for server-side calls
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function TechLibraryPage({ params }: PageProps) {
  const { category } = await params;
  const slug = category;
  const tech = TECH_LABELS[slug?.toLowerCase()] || slug;

  // Fetch flashcards on the server
  const flashcards = await convex.query(api.flashcards.getFlashcardsByTech, {
    tech,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TechLibraryContent tech={tech} flashcards={flashcards} />
    </div>
  );
}

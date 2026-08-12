import { Skeleton } from '@/components/ui/skeleton';

type AppRouteLoadingShellProps = {
  variant?: 'default' | 'narrow' | 'editor';
};

export function AppRouteLoadingShell({
  variant = 'default',
}: AppRouteLoadingShellProps) {
  const mainMax =
    variant === 'narrow'
      ? 'max-w-3xl'
      : variant === 'editor'
        ? 'max-w-4xl'
        : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm safe-top">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="hidden h-6 w-24 sm:block" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton className="hidden h-4 w-16 md:block" />
              <Skeleton className="hidden h-4 w-14 md:block" />
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`mx-auto px-4 py-6 sm:px-6 sm:py-12 lg:px-8 ${mainMax}`}
      >
        <Skeleton className="mb-2 h-9 w-56 max-w-[85vw]" />
        <Skeleton className="mb-8 h-5 w-full max-w-xl" />
        {variant === 'narrow' ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : variant === 'editor' ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="min-h-[280px] w-full rounded-lg" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-36 rounded-lg sm:h-40" />
            <Skeleton className="h-36 rounded-lg sm:h-40" />
            <Skeleton className="h-36 rounded-lg sm:h-40" />
          </div>
        )}
      </main>
    </div>
  );
}

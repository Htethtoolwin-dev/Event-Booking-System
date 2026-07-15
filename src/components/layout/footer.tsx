export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EventBook. Built for portfolio demonstration.
        </p>
        <p className="text-sm text-muted-foreground">
          Next.js · Prisma · JWT Auth
        </p>
      </div>
    </footer>
  );
}

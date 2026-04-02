import { Link } from "@tanstack/react-router"

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-b-border bg-background">
      <nav className="mx-auto flex w-full max-w-3xl items-center p-4">
        <Link to="/" className="flex flex-col gap-0.5">
          <span>tinywebp</span>
          <span className="text-xs text-muted-foreground">
            Free & Privacy-First
          </span>
        </Link>
      </nav>
    </header>
  )
}

import { Link } from "@tanstack/react-router"

export const Header = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center border-b border-b-border bg-background">
      <nav className="flex w-full max-w-2xl items-center p-4">
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

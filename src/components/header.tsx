import { Image01Icon, UserShield01Icon, Github01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { Badge } from "./reui/badge"

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Image01Icon} size={20} />
          </div>
          <span className="text-lg font-semibold tracking-tight">tinywebp</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant="success-light" size="lg" radius="full" className="hidden sm:flex">
            <HugeiconsIcon icon={UserShield01Icon} size={14} />
            100% Private
          </Badge>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Github01Icon} size={18} />
          </a>
        </div>
      </nav>
    </header>
  )
}

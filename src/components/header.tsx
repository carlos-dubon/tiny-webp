import { Image01Icon, UserShield01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { Badge } from "./reui/badge"

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-b-border bg-background">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-stone-500 p-1 text-primary-foreground">
            <HugeiconsIcon icon={Image01Icon} size={28} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span>tinywebp</span>
            <span className="text-xs text-muted-foreground">
              Free & privacy-first
            </span>
          </div>
        </Link>

        <Badge variant="secondary" size="lg">
          <HugeiconsIcon icon={UserShield01Icon} size={18} />
          100% private & local
        </Badge>
      </nav>
    </header>
  )
}

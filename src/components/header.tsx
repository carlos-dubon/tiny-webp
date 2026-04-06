import {
  Image01Icon,
  UserShield01Icon,
  Moon02Icon,
  Sun03Icon,
  GithubIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { Badge } from "./reui/badge"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"

export const Header = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Read theme preference on client only
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const shouldBeDark = stored ? stored === "dark" : prefersDark
    setIsDark(shouldBeDark)
  }, [])

  useEffect(() => {
    // Apply class to DOM when dark mode changes
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Image01Icon} size={20} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Tiny WebP
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge
            variant="success-light"
            size="lg"
            radius="full"
            className="hidden sm:flex"
          >
            <HugeiconsIcon icon={UserShield01Icon} size={14} />
            100% Private & Local
          </Badge>
          <a
            href="https://github.com/carlos-dubon/tiny-webp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={GithubIcon} size={18} />
            </Button>
          </a>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} size={18} />
          </Button>
        </div>
      </nav>
    </header>
  )
}

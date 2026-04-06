import { createFileRoute } from "@tanstack/react-router"
import { Dropzone } from "@/components/dropzone"
import { HugeiconsIcon } from "@hugeicons/react"
import { Rocket01Icon, FlashIcon, UserShield01Icon } from "@hugeicons/core-free-icons"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="min-h-svh bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/30 py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Compress images without losing quality
          </h1>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Convert and optimize your images to WebP format. Fast, free, and completely
            private - all processing happens in your browser.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={FlashIcon} size={16} className="text-primary" />
              </div>
              <span>Lightning fast</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={UserShield01Icon} size={16} className="text-primary" />
              </div>
              <span>100% private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Rocket01Icon} size={16} className="text-primary" />
              </div>
              <span>No upload limits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <Dropzone />
      </main>
    </div>
  )
}

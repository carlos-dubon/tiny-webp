import { createFileRoute } from "@tanstack/react-router"
import { Dropzone } from "@/components/dropzone"
import { Button } from "@/components/ui/button"
import { Controls } from "@/components/controls"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="min-h-svh bg-secondary py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4">
        <Dropzone />
        <Controls />
      </div>
    </div>
  )
}

import { useAtom } from "jotai"
import { Button } from "./ui/button"
import { fileUploadStateAtom } from "@/state/file-upload-state"
import pica from "pica"
import { useCallback, useState } from "react"

export const Controls = () => {
  const [state] = useAtom(fileUploadStateAtom)
  const isDisabled = state.files.length === 0

  const [isLoading, setIsLoading] = useState(false)

  const handleCompress = useCallback(async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }, [])

  return (
    <div className="items-center rounded-2xl border border-border bg-card p-4">
      <Button
        size="lg"
        className="w-full"
        disabled={isDisabled}
        onClick={handleCompress}
      >
        Compress images
      </Button>
    </div>
  )
}

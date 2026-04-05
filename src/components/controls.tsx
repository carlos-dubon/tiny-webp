import { useAtom } from "jotai"
import { Button } from "./ui/button"
import { fileUploadStateAtom } from "@/state/file-upload-state"
import pica from "pica"
import { useCallback, useState } from "react"
import { fileToImage } from "@/lib/file-to-image"
import { formatSize } from "@/lib/format-bytes"

export const Controls = () => {
  const [state] = useAtom(fileUploadStateAtom)
  const isDisabled = state.files.length === 0

  const [isLoading, setIsLoading] = useState(false)

  const [results, setResults] = useState<
    {
      url: string
      name: string
      originalSize: number
      newSize: number
      savings: number
    }[]
  >([])

  const handleCompress = useCallback(async () => {
    setIsLoading(true)

    const picaInstance = pica()

    const compressed = await Promise.all(
      state.files.map(async (fileWrapper) => {
        const file = fileWrapper.file as File
        const originalSize = file.size

        const image = await fileToImage(file)
        const source = document.createElement("canvas")

        // Resize (optional, keep if you want)
        // const maxWidth = 800
        // const scale = Math.min(1, maxWidth / image.width)

        // source.width = image.width * scale
        // source.height = image.height * scale

        const canvas = await picaInstance.resize(image, source)
        const blob = await picaInstance.toBlob(canvas, "image/webp", 0.8)
        const newSize = blob.size

        const savings = ((originalSize - newSize) / originalSize) * 100

        return {
          url: URL.createObjectURL(blob),
          name: file.name.replace(/\.[^/.]+$/, "") + ".webp",
          originalSize,
          newSize,
          savings,
        }
      })
    )

    setResults(compressed)
    setIsLoading(false)
  }, [state.files])

  return (
    <div className="items-center space-y-4 rounded-2xl border border-border bg-card p-4">
      <Button
        size="lg"
        className="w-full"
        disabled={isDisabled || isLoading}
        onClick={handleCompress}
      >
        {isLoading ? "Compressing..." : "Compress images"}
      </Button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((file, i) => (
            <a
              key={i}
              href={file.url}
              download={file.name}
              className="block rounded-lg border p-3 hover:bg-muted"
            >
              <div className="font-medium">{file.name}</div>

              <div className="text-sm text-muted-foreground">
                {formatSize(file.originalSize)} → {formatSize(file.newSize)} (
                {file.savings.toFixed(1)}% smaller)
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

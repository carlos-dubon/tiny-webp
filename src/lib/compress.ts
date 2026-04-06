import { fileToImage } from "./file-to-image"
import { ImageQuality } from "@/state/config"

interface Config {
  quality: keyof typeof ImageQuality
  removeMetadata?: boolean
}

export async function compress(file: File, config?: Config) {
  const originalSize = file.size

  const source = await fileToImage(file)
  const canvas = document.createElement("canvas")

  canvas.width = source.width
  canvas.height = source.height

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")
  ctx.drawImage(source, 0, 0)

  // Convert to WebP blob with specified quality
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to create blob"))
        else resolve(blob)
      },
      "image/webp",
      config?.quality ?? 0.8
    )
  })
  const newSize = blob.size

  const savings = ((originalSize - newSize) / originalSize) * 100

  return {
    url: URL.createObjectURL(blob),
    name: file.name.replace(/\.[^/.]+$/, "") + ".webp",
    originalSize,
    newSize,
    savings,
  }
}

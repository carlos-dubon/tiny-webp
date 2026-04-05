import pica from "pica"
import { fileToImage } from "./file-to-image"

const picaInstance = pica()

export async function compress(file: File) {
  const originalSize = file.size

  const source = await fileToImage(file)
  const destination = document.createElement("canvas")

  // Resize (optional, keep if you want)
  // const maxWidth = 800
  // const scale = Math.min(1, maxWidth / source.width)

  destination.width = source.width
  destination.height = source.height
  // destination.width = destination.width * scale
  // destination.height = destination.height * scale

  const canvas = await picaInstance.resize(source, destination)
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
}

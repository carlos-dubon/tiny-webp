export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => resolve(img)
  })
}
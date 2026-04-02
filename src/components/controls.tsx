import { useAtom } from "jotai"
import { Button } from "./ui/button"
import { fileUploadStateAtom } from "@/state/file-upload-state"

export const Controls = () => {
  const [state] = useAtom(fileUploadStateAtom)
  return (
    <div className="items-center rounded-2xl border border-border bg-card p-4">
      {state.files.length} files
      <Button size="lg" className="w-full">
        Compress images
      </Button>
    </div>
  )
}

import type { FileUploadState } from "@/hooks/use-file-upload"
import { atom } from "jotai"

export const fileUploadStateAtom = atom<FileUploadState>({
  files: [],
  isDragging: false,
  errors: [],
})

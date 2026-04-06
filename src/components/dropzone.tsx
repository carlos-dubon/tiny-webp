import { useEffect, useState, type DragEvent as ReactDragEvent } from "react"
import JSZip from "jszip"
import {
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/hooks/use-file-upload"
import { compress } from "@/lib/compress"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { Badge } from "@/components/reui/badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  CloudUploadIcon,
  Delete02Icon,
  Download01Icon,
  ImageIcon,
  Refresh04Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { formatBytes } from "@/lib/format-bytes"
import { Controls } from "./controls"
import { useAtom } from "jotai"
import { configAtom } from "@/state/config"

interface FileUploadItem extends FileWithPreview {
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
  originalSize?: number
  progressInitialized?: boolean
}

interface ProgressUploadProps {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  className?: string
  onFilesChange?: (files: FileWithPreview[]) => void
}

export function Dropzone({
  maxFiles = 50,
  maxSize = 50 * 1024 * 1024,
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif",
  multiple = true,
  className,
  onFilesChange,
}: ProgressUploadProps) {
  const [config] = useAtom(configAtom)
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([])
  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: [],
    onFilesChange: (newFiles) => {
      const newUploadFiles = newFiles.map((file) => {
        const existingFile = uploadFiles.find(
          (existing) => existing.id === file.id
        )
        if (existingFile) {
          return existingFile
        } else {
          return {
            ...file,
            originalSize: file.file.size,
            progress: 0,
            progressInitialized: false,
            status: "uploading" as const,
          }
        }
      })
      setUploadFiles(newUploadFiles)
      onFilesChange?.(newFiles)
    },
  })

  useEffect(() => {
    const compressFiles = async () => {
      const filesToCompress = uploadFiles.filter(
        (f) => f.status === "uploading" && f.file instanceof File
      )

      const hasUninitialized = filesToCompress.some(
        (f) => !f.progressInitialized
      )

      if (hasUninitialized) {
        setUploadFiles((prev) =>
          prev.map((f) => {
            const needsInit = filesToCompress.find(
              (ftp) => ftp.id === f.id && !ftp.progressInitialized
            )
            if (needsInit) {
              return {
                ...f,
                progress: Math.floor(Math.random() * 41) + 10,
                progressInitialized: true,
              }
            }
            return f
          })
        )
        return
      }

      await Promise.all(
        filesToCompress.map(async (file) => {
          try {
            const result = await compress(file.file as File, {
              quality: config.quality,
            })

            const timestamp = Date.now()
            const nameWithoutExtension = result.name.replace(/\.[^/.]+$/, "")
            const compressedFileName = `${nameWithoutExtension}-${timestamp}-compressed.webp`

            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed" as const,
                      preview: result.url,
                      file: {
                        ...f.file,
                        name: compressedFileName,
                        size: result.newSize,
                        type: "image/webp",
                      },
                    }
                  : f
              )
            )
          } catch {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      status: "error" as const,
                      error: "Compression failed. Please try again.",
                    }
                  : f
              )
            )
          }
        })
      )
    }

    compressFiles()
  }, [uploadFiles, config])

  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleDragOver(e as unknown as ReactDragEvent<HTMLElement>)
    }

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleDrop(e as unknown as ReactDragEvent<HTMLElement>)
    }

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault()
      handleDragEnter(e as unknown as ReactDragEvent<HTMLElement>)
    }

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault()
      handleDragLeave(e as unknown as ReactDragEvent<HTMLElement>)
    }

    window.addEventListener("dragover", handleWindowDragOver)
    window.addEventListener("drop", handleWindowDrop)
    window.addEventListener("dragenter", handleWindowDragEnter)
    window.addEventListener("dragleave", handleWindowDragLeave)

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver)
      window.removeEventListener("drop", handleWindowDrop)
      window.removeEventListener("dragenter", handleWindowDragEnter)
      window.removeEventListener("dragleave", handleWindowDragLeave)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  const retryUpload = (fileId: string) => {
    setUploadFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              progress: 0,
              status: "uploading" as const,
              error: undefined,
              progressInitialized: false,
            }
          : file
      )
    )
  }

  const removeUploadFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== fileId))
    removeFile(fileId)
  }

  const completedCount = uploadFiles.filter(
    (f) => f.status === "completed"
  ).length
  const errorCount = uploadFiles.filter((f) => f.status === "error").length
  const uploadingCount = uploadFiles.filter(
    (f) => f.status === "uploading"
  ).length

  const totalOriginalSize = uploadFiles
    .filter((f) => f.status === "completed" && f.originalSize)
    .reduce((acc, f) => acc + (f.originalSize || 0), 0)

  const totalCompressedSize = uploadFiles
    .filter((f) => f.status === "completed")
    .reduce((acc, f) => acc + f.file.size, 0)

  const totalSavings = totalOriginalSize > 0
    ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
    : 0

  const downloadFile = async (fileItem: FileUploadItem) => {
    if (!fileItem.preview) return
    const link = document.createElement("a")
    link.href = fileItem.preview
    link.download = fileItem.file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllFiles = async () => {
    const completedFiles = uploadFiles.filter((f) => f.status === "completed")
    if (completedFiles.length === 0) return

    if (completedFiles.length === 1) {
      downloadFile(completedFiles[0])
      return
    }

    const zip = new JSZip()
    const timestamp = Date.now()

    for (const file of completedFiles) {
      if (file.preview) {
        const response = await fetch(file.preview)
        const blob = await response.blob()
        zip.file(file.file.name, blob)
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(zipBlob)
    link.download = `compressed-images-${timestamp}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const handleClearAll = () => {
    setUploadFiles([])
    clearFiles()
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed bg-card p-8 text-center transition-all duration-200 md:p-12",
          isDragging
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-2xl transition-all duration-200",
              isDragging
                ? "scale-110 bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <HugeiconsIcon
              icon={isDragging ? ArrowDown01Icon : CloudUploadIcon}
              strokeWidth={1.5}
              size={28}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isDragging ? "Drop your images here" : "Drop images or click to upload"}
            </h3>
            <p className="text-sm text-muted-foreground">
              JPEG, PNG, WebP, AVIF, GIF up to {formatBytes(maxSize)}
            </p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              openFileDialog()
            }}
            size="lg"
            className="mt-2"
          >
            Select Images
          </Button>
        </div>
      </div>

      {/* Controls Panel */}
      <Controls />

      {/* Results Section */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {uploadFiles.length} {uploadFiles.length === 1 ? "image" : "images"}
              </span>
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <Badge size="sm" variant="success-light" radius="full">
                    {completedCount} completed
                  </Badge>
                )}
                {uploadingCount > 0 && (
                  <Badge size="sm" variant="secondary" radius="full">
                    {uploadingCount} processing
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge size="sm" variant="destructive-light" radius="full">
                    {errorCount} failed
                  </Badge>
                )}
              </div>
              {totalSavings > 0 && (
                <div className="hidden text-sm text-muted-foreground sm:block">
                  <span className="font-medium text-success">{totalSavings}%</span> saved ({formatBytes(totalOriginalSize - totalCompressedSize)})
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={downloadAllFiles}
                variant="default"
                size="sm"
                disabled={completedCount === 0}
              >
                <HugeiconsIcon icon={Download01Icon} size={14} />
                Download All
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                Clear
              </Button>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadFiles.map((fileItem: FileUploadItem) => (
              <ImageCard
                key={fileItem.id}
                fileItem={fileItem}
                onDownload={() => downloadFile(fileItem)}
                onRemove={() => removeUploadFile(fileItem.id)}
                onRetry={() => retryUpload(fileItem.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadFiles.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon icon={ImageIcon} size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No images yet</p>
            <p className="text-sm text-muted-foreground">
              Upload images to start compressing
            </p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface ImageCardProps {
  fileItem: FileUploadItem
  onDownload: () => void
  onRemove: () => void
  onRetry: () => void
}

function ImageCard({ fileItem, onDownload, onRemove, onRetry }: ImageCardProps) {
  const isCompleted = fileItem.status === "completed"
  const isError = fileItem.status === "error"
  const isUploading = fileItem.status === "uploading"

  const savings = isCompleted && fileItem.originalSize
    ? Math.round(((fileItem.originalSize - fileItem.file.size) / fileItem.originalSize) * 100)
    : 0

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all",
        isError ? "border-destructive/50" : "border-border",
        isCompleted && "hover:shadow-md"
      )}
    >
      {/* Image Preview */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {fileItem.preview ? (
          <img
            src={fileItem.preview}
            alt={fileItem.file.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <HugeiconsIcon icon={ImageIcon} size={32} className="text-muted-foreground" />
          </div>
        )}

        {/* Overlay for completed images */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              onClick={(e) => {
                e.preventDefault()
                onDownload()
              }}
              size="sm"
              variant="default"
            >
              <HugeiconsIcon icon={Download01Icon} size={14} />
              Download
            </Button>
          </div>
        )}

        {/* Progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <div className="w-3/4">
              <Progress value={fileItem.progress} className="h-1.5" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Compressing...</p>
          </div>
        )}

        {/* Error overlay */}
        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
            <HugeiconsIcon icon={AlertCircleIcon} size={24} className="text-destructive" />
            <p className="mt-2 text-xs text-destructive">{fileItem.error}</p>
            <Button
              onClick={(e) => {
                e.preventDefault()
                onRetry()
              }}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              <HugeiconsIcon icon={Refresh04Icon} size={14} />
              Retry
            </Button>
          </div>
        )}

        {/* Savings badge */}
        {isCompleted && savings > 0 && (
          <Badge
            variant="success"
            size="sm"
            radius="full"
            className="absolute right-2 top-2"
          >
            -{savings}%
          </Badge>
        )}
      </div>

      {/* File Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-foreground">
          {fileItem.file.name.replace(/-\d+-compressed\.webp$/, ".webp")}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {isCompleted && fileItem.originalSize ? (
            <>
              <span>{formatBytes(fileItem.originalSize)}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              <span className="font-medium text-foreground">{formatBytes(fileItem.file.size)}</span>
            </>
          ) : (
            <span>{formatBytes(fileItem.file.size)}</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
        style={{ display: isCompleted && savings > 0 ? "none" : undefined }}
      >
        <HugeiconsIcon icon={Delete02Icon} size={12} />
      </button>
    </div>
  )
}

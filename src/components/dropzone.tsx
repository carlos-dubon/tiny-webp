import { useEffect, useState } from "react"
import JSZip from "jszip"
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/hooks/use-file-upload"
import { compress } from "@/lib/compress"
import {
  Alert,
  AlertAction,
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
  ArchiveIcon,
  File02Icon,
  GoogleSheetIcon,
  HeadphonesIcon,
  ImageIcon,
  MultiplicationSignIcon,
  Refresh04Icon,
  Upload01Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
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
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif",
  multiple = true,
  className,
  onFilesChange,
}: ProgressUploadProps) {
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
      // Convert to upload items when files change, preserving existing status
      const newUploadFiles = newFiles.map((file) => {
        // Check if this file already exists in uploadFiles
        const existingFile = uploadFiles.find(
          (existing) => existing.id === file.id
        )
        if (existingFile) {
          // Preserve existing file status and progress
          return {
            ...existingFile,
            ...file, // Update any changed properties from the file
          }
        } else {
          // New file - set to uploading
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
  // Compress images when they're added
  useEffect(() => {
    const compressFiles = async () => {
      const filesToCompress = uploadFiles.filter(
        (f) => f.status === "uploading" && f.file instanceof File
      )

      // Set random progress for uninitialized files
      const hasUninitialized = filesToCompress.some(
        (f) => !f.progressInitialized
      )

      if (hasUninitialized) {
        // Update state with random progress
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
        return // Wait for next effect run to compress
      }

      await Promise.all(
        filesToCompress.map(async (file) => {
          try {
            // Run compression
            const result = await compress(file.file as File)

            // Add timestamp to compressed filename
            const timestamp = Date.now()
            const nameWithoutExtension = result.name.replace(/\.[^/.]+$/, "")
            const compressedFileName = `${nameWithoutExtension}-${timestamp}-compressed.webp`

            // Update with completed status
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
          } catch (error) {
            // Handle compression error
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
  }, [uploadFiles])
  const retryUpload = (fileId: string) => {
    setUploadFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              progress: 0,
              status: "uploading" as const,
              error: undefined,
            }
          : file
      )
    )
  }
  const removeUploadFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== fileId))
    removeFile(fileId)
  }
  const getFileIcon = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type
    if (type.startsWith("image/"))
      return (
        <HugeiconsIcon icon={ImageIcon} strokeWidth={2} className="size-4" />
      )
    if (type.startsWith("video/"))
      return (
        <HugeiconsIcon icon={Video02Icon} strokeWidth={2} className="size-4" />
      )
    if (type.startsWith("audio/"))
      return (
        <HugeiconsIcon
          icon={HeadphonesIcon}
          strokeWidth={2}
          className="size-4"
        />
      )
    if (type.includes("pdf"))
      return (
        <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-4" />
      )
    if (type.includes("word") || type.includes("doc"))
      return (
        <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-4" />
      )
    if (type.includes("excel") || type.includes("sheet"))
      return (
        <HugeiconsIcon
          icon={GoogleSheetIcon}
          strokeWidth={2}
          className="size-4"
        />
      )
    if (type.includes("zip") || type.includes("rar"))
      return (
        <HugeiconsIcon icon={ArchiveIcon} strokeWidth={2} className="size-4" />
      )
    return (
      <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-4" />
    )
  }
  const completedCount = uploadFiles.filter(
    (f) => f.status === "completed"
  ).length
  const errorCount = uploadFiles.filter((f) => f.status === "error").length
  const uploadingCount = uploadFiles.filter(
    (f) => f.status === "uploading"
  ).length

  const downloadAllFiles = async () => {
    const zip = new JSZip()
    const timestamp = Date.now()

    // Add all files to zip
    for (const file of uploadFiles) {
      if (file.preview) {
        const response = await fetch(file.preview)
        const blob = await response.blob()
        zip.file(file.file.name, blob)
      }
    }

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(zipBlob)
    link.download = `compressed-images-${timestamp}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-lg border border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}
          >
            <HugeiconsIcon
              icon={Upload01Icon}
              strokeWidth={2}
              className={cn(
                "h-6",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload your files</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Support for multiple file types up to {formatBytes(maxSize)} each
            </p>
          </div>
          <Button onClick={openFileDialog}>
            <HugeiconsIcon
              icon={Upload01Icon}
              strokeWidth={2}
              className="h-4 w-4"
            />
            Select files
          </Button>
        </div>
      </div>
      {/* Upload Stats */}
      {uploadFiles.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Compressed Images</h4>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <Badge size="sm" variant="success-light">
                  Completed: {completedCount}
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge size="sm" variant="destructive">
                  Failed: {errorCount}
                </Badge>
              )}
              {uploadingCount > 0 && (
                <Badge size="sm" variant="secondary">
                  Uploading: {uploadingCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadAllFiles}
              variant="outline"
              size="sm"
              disabled={uploadFiles.length === 0}
            >
              <HugeiconsIcon
                icon={Upload01Icon}
                strokeWidth={2}
                className="h-4 w-4"
              />
              Download all
            </Button>
            <Button onClick={clearFiles} variant="outline" size="sm">
              Clear all
            </Button>
          </div>
        </div>
      )}
      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadFiles.map((fileItem: FileUploadItem) => (
            <a
              href={fileItem.preview}
              download={fileItem.file.name}
              key={fileItem.id}
              className="block rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-card/60"
            >
              <div className="flex items-start gap-2.5">
                {/* File Icon */}
                <div className="shrink-0">
                  {fileItem.preview &&
                  fileItem.file.type.startsWith("image/") ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-12 w-12 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-muted-foreground">
                      {getFileIcon(fileItem.file)}
                    </div>
                  )}
                </div>
                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="mt-0.75 flex items-center justify-between">
                    <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
                      <span className="text-sm">{fileItem.file.name}</span>
                      {fileItem.status === "completed" &&
                      fileItem.originalSize ? (
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(fileItem.originalSize)} →{" "}
                          {formatBytes(fileItem.file.size)} (
                          {Math.round(
                            ((fileItem.originalSize - fileItem.file.size) /
                              fileItem.originalSize) *
                              100
                          )}
                          % saved)
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(fileItem.file.size)}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Remove Button */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeUploadFile(fileItem.id)
                        }}
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:bg-transparent hover:opacity-100"
                      >
                        <HugeiconsIcon
                          icon={MultiplicationSignIcon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  {fileItem.status === "uploading" && (
                    <div className="mt-2">
                      <Progress value={fileItem.progress} className="h-1" />
                    </div>
                  )}
                  {/* Error Message */}
                  {fileItem.status === "error" && fileItem.error && (
                    <Alert variant="destructive" className="mt-2 px-2 py-1">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        strokeWidth={2}
                        className="size-4"
                      />
                      <AlertTitle className="text-xs">
                        {fileItem.error}
                      </AlertTitle>
                      <AlertAction>
                        <Button
                          onClick={() => retryUpload(fileItem.id)}
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:bg-transparent hover:opacity-100"
                        >
                          <HugeiconsIcon
                            icon={Refresh04Icon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                        </Button>
                      </AlertAction>
                    </Alert>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>File upload error(s)</AlertTitle>
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

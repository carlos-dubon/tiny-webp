import { cn } from "@/lib/utils"
import type { FileUploadItem } from "./dropzone"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowRight01Icon,
  Delete02Icon,
  Download01Icon,
  ImageIcon,
  Refresh04Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Badge } from "./reui/badge"
import { formatBytes } from "@/lib/format-bytes"

interface ImageCardProps {
  fileItem: FileUploadItem
  onDownload: () => void
  onRemove: () => void
  onRetry: () => void
}

export function ImageCard({
  fileItem,
  onDownload,
  onRemove,
  onRetry,
}: ImageCardProps) {
  const isCompleted = fileItem.status === "completed"
  const isError = fileItem.status === "error"
  const isUploading = fileItem.status === "uploading"

  const savings =
    isCompleted && fileItem.originalSize
      ? Math.round(
          ((fileItem.originalSize - fileItem.file.size) /
            fileItem.originalSize) *
            100
        )
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
            <HugeiconsIcon
              icon={ImageIcon}
              size={32}
              className="text-muted-foreground"
            />
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
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={24}
              className="text-destructive"
            />
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
            className="absolute top-2 right-2"
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
              <span className="font-medium text-foreground">
                {formatBytes(fileItem.file.size)}
              </span>
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
        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
        style={{ display: isCompleted && savings > 0 ? "none" : undefined }}
      >
        <HugeiconsIcon icon={Delete02Icon} size={12} />
      </button>
    </div>
  )
}

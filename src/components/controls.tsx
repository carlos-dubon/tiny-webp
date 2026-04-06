import { Slider } from "@/components/ui/slider"
import { configAtom } from "@/state/config"
import { useAtom } from "jotai"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const qualityPresets = [
  { value: 0.2, label: "Tiny", description: "Smallest file size" },
  { value: 0.4, label: "Low", description: "Good for thumbnails" },
  { value: 0.6, label: "Balanced", description: "Best for web" },
  { value: 0.8, label: "High", description: "Near-original quality" },
  { value: 1.0, label: "Max", description: "Lossless quality" },
]

export function Controls() {
  const [config, setConfig] = useAtom(configAtom)

  const currentPreset = qualityPresets.find((p) => p.value === config.quality) || qualityPresets[2]

  const handleSliderChange = (value: number[]) => {
    const quality = value[0]
    // Snap to nearest preset
    const nearestPreset = qualityPresets.reduce((prev, curr) =>
      Math.abs(curr.value - quality) < Math.abs(prev.value - quality) ? curr : prev
    )
    setConfig((prev) => ({
      ...prev,
      quality: nearestPreset.value as typeof prev.quality,
    }))
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HugeiconsIcon icon={Settings02Icon} size={16} className="text-muted-foreground" />
        Compression Settings
      </div>

      <div className="mt-4 space-y-4">
        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quality</span>
            <span className="text-sm font-medium text-foreground">
              {Math.round(config.quality * 100)}% - {currentPreset.label}
            </span>
          </div>
          <Slider
            value={[config.quality]}
            onValueChange={handleSliderChange}
            min={0.2}
            max={1}
            step={0.2}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          {qualityPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  quality: preset.value as typeof prev.quality,
                }))
              }
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                config.quality === preset.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Output Info */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Output format:</span> WebP - optimized for web with excellent compression
          </p>
        </div>
      </div>
    </div>
  )
}

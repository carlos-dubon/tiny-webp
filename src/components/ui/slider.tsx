import * as React from "react"
import { Slider as RadixSlider } from "radix-ui"
import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentProps<typeof RadixSlider.Root> {
  showValue?: boolean
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof RadixSlider.Root>,
  SliderProps
>(({ className, showValue, ...props }, ref) => (
  <RadixSlider.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className
    )}
    {...props}
  >
    <RadixSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
      <RadixSlider.Range className="absolute h-full bg-primary" />
    </RadixSlider.Track>
    <RadixSlider.Thumb className="block size-5 cursor-grab rounded-full border-2 border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50" />
  </RadixSlider.Root>
))
Slider.displayName = RadixSlider.Root.displayName

export { Slider }

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { configAtom, ImageQuality } from "@/state/config"
import { useAtom } from "jotai"

export function Controls() {
  const [config, setConfig] = useAtom(configAtom)

  return (
    <div className="mt-6 rounded-lg bg-card p-4">
      <Field className="w-full max-w-xs">
        <FieldLabel htmlFor="quality-select">
          Quality: {config.quality * 100}%
        </FieldLabel>
        <NativeSelect
          id="quality-select"
          defaultValue={0.6}
          onChange={(e) => {
            setConfig((prev) => ({
              ...prev,
              quality: +e.target.value as unknown as keyof typeof ImageQuality,
            }))
          }}
        >
          {Object.entries(ImageQuality).map(([option, label]) => (
            <NativeSelectOption key={option} value={option}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldDescription>Select the output quality</FieldDescription>
      </Field>
    </div>
  )
}

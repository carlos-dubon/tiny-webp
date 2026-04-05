import { atom } from "jotai"

export const ImageQuality = {
  0.2: "20% - Smallest file",
  0.4: "40% - Low quality",
  0.6: "60% - Balanced",
  0.8: "80% - High quality",
  1.0: "100% - Best quality",
} as const satisfies Record<number, string>

export type Config = {
  quality: keyof typeof ImageQuality
}

export const configAtom = atom<Config>({ quality: 0.6 })

import { Settings } from "@/ui/types"
import { useLocalStorage } from "usehooks-ts"

const defaultSettings: Settings = {
  apiUrl: "",
}

export default function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "settings",
    defaultSettings
  )
  return { settings, setSettings }
}

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { Button } from './ui/button'

const options = [
  { value: 'light' as const, icon: Sun, label: 'Clar' },
  { value: 'dark' as const, icon: Moon, label: 'Fosc' },
  { value: 'system' as const, icon: Monitor, label: 'Sistema' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const idx = options.findIndex((o) => o.value === theme)
    const next = options[(idx + 1) % options.length]
    setTheme(next.value)
  }

  const current = options.find((o) => o.value === theme) ?? options[0]
  const Icon = current.icon

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Tema: ${current.label}`}
      title={`Tema: ${current.label}`}
      className="shrink-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}

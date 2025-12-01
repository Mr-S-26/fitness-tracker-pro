"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

// ✅ FIXED: Named export
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by only rendering after mount
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      aria-label="Toggle theme"
    >
      {/* Sun Icon (Show in Light Mode) */}
      <Sun className="h-5 w-5 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      
      {/* Moon Icon (Show in Dark Mode) */}
      <Moon className="absolute top-2 left-2 h-5 w-5 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
    </button>
  )
}
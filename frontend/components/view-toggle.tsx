"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const currentView = searchParams.get("view") || "grid"

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
      <button
        onClick={() => setView("grid")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          currentView === 'grid' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
        title="Vista a Griglia"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-1.5 rounded-md transition-all duration-200 ${
          currentView === 'list' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
        title="Vista a Lista"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
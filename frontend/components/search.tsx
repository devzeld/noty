"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search } from "lucide-react"

export function TopSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearch = (value: string) => {
    setSearchTerm(value)

    const params = new URLSearchParams()
    if (value) {
      params.set("q", value)
    }

    if (pathname !== '/home') {
      router.push(`/home?${params.toString()}`)
    } else {
      router.replace(`/home?${params.toString()}`)
    }
  }

  return (
    <div className="relative w-full max-w-md transition-all">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Cerca nei tuoi documenti..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-muted/40 border border-transparent hover:bg-muted/60 focus:border-primary focus:bg-background focus:shadow-sm h-9 rounded-md pl-9 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground"
      />
    </div>
  )
}
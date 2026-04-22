"use client"

import { useLanguage } from "@/hooks/useLanguage"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Cambia lingua</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLang("it")}
          className={lang === "it" ? "bg-muted" : ""}
        >
          Italiano
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLang("en")}
          className={lang === "en" ? "bg-muted" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLang("es")}
          className={lang === "es" ? "bg-muted" : ""}
        >
          Español
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLang("jap")}
          className={lang === "jap" ? "bg-muted" : ""}
        >
          日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
import type { Metadata } from "next"
import { Roboto, JetBrains_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import { LanguageProvider } from "@/hooks/use-language"
import { ThemeProvider } from "@/components/theme-provider"

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'})

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'})

export const metadata: Metadata = {
  title: "Noty - La tua dashboard di appunti",
  description: " Noty è un'applicazione web per prendere appunti in modo semplice e organizzato. Crea, gestisci e condividi i tuoi appunti con facilità.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", roboto.variable, jetbrainsMonoHeading.variable)}>
      <body
        className={cn("antialiased select-none")}
      >
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          </LanguageProvider>
      </body>
    </html>
  )
}
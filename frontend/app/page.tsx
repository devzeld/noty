"use client"

import Link from "next/link"
import { useLanguage } from "@/hooks/useLanguage"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { NotebookPen, ArrowRight, Cloud, Shield, Zap } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-provider"
import { Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card"

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">{t.nav.title}</span>
          </div>
          <nav className="flex items-center gap-4">
        
            <LanguageSwitcher /> 

            <ThemeSwitcher/>
            
            <Link href="/auth">
              <Button variant="outline">{t.nav.login}</Button>
            </Link>
            <Link href="/auth">
              <Button variant="default">{t.nav.register}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative px-4 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48 overflow-hidden">
          <div className="container mx-auto text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              {t.hero.title1} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                {t.hero.title2}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                  {t.hero.ctaPrimary}
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                  {t.hero.ctaSecondary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
      <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.features.title}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{t.features.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t.features.items.performance.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t.features.items.performance.description}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t.features.items.security.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t.features.items.security.description}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t.features.items.sync.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t.features.items.sync.description}
                  </CardDescription>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
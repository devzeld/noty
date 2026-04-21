"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { useAuth } from "@/hooks/useAuth"
import { apiFetch } from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2, "Il nome deve contenere almeno 2 caratteri."),
  email: z.string().email("Inserisci un indirizzo email valido."),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono.",
  path: ["confirmPassword"],
})

export default function RegisterForm() {
  const router = useRouter()
  const { checkAuth } = useAuth()
  
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setGlobalError(null)

    try {
      const { confirmPassword, ...dataToSend } = values;

      const response = await apiFetch("/auth/register.php", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore durante la registrazione.")
      }

      await checkAuth()
      router.push("/")
      
    } catch (error: any) {
      console.error("Errore di registrazione:", error)
      setGlobalError(error.message || "Qualcosa è andato storto. Riprova.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full sm:max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crea un account</CardTitle>
          <CardDescription className="text-center">
            Inserisci i tuoi dati per registrarti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-name">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="register-name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Mario Rossi"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="register-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="mario.rossi@esempio.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="register-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-confirm-password">Conferma Password</FieldLabel>
                    <Input
                      {...field}
                      id="register-confirm-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

            </FieldGroup>

            {globalError && (
              <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                {globalError}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            form="register-form" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrazione in corso..." : "Registrati"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Hai già un account?{" "}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Accedi qui
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
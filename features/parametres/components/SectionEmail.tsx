'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputPassword } from './InputPassword'
import { useEmail } from '../hooks/useEmail'

export function SectionEmail() {
  const {
    etape,
    enEdition,
    setEnEdition,
    formMotDePasse,
    formEmail,
    verifierMotDePasseMutation,
    changerEmailMutation,
    reinitialiser
  } = useEmail()

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Email</h2>
            <p className="text-sm text-gray-500">Gérez votre adresse email</p>
          </div>
          {!enEdition && (
            <Button onClick={() => setEnEdition(true)}>
              Modifier
            </Button>
          )}
        </div>

        {enEdition && etape === 'motdepasse' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formMotDePasse.handleSubmit()
            }}
            className="space-y-4"
          >
            <formMotDePasse.Field name="motdepasse">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="motdepasse">Mot de passe actuel</Label>
                  <InputPassword
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </formMotDePasse.Field>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={verifierMotDePasseMutation.isPending}
              >
                {verifierMotDePasseMutation.isPending
                  ? "Vérification..."
                  : "Continuer"
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={reinitialiser}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {enEdition && etape === 'email' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formEmail.handleSubmit()
            }}
            className="space-y-4"
          >
            <formEmail.Field name="nouvelEmail">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="nouvelEmail">Nouvel email</Label>
                  <Input
                    id="nouvelEmail"
                    type="email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </formEmail.Field>
            <formEmail.Field name="codeverification">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="codeVerification">Code de vérification</Label>
                  <Input
                    id="codeVerification"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {field.state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </formEmail.Field>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={changerEmailMutation.isPending}
              >
                {changerEmailMutation.isPending
                  ? "Modification en cours..."
                  : "Changer l'email"
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={reinitialiser}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}

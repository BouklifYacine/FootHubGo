'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputPassword } from './InputPassword'
import { useMotDePasse } from '../hooks/useMotDePasse'

export function SectionMotDePasse() {
  const {
    etape,
    enEdition,
    setEnEdition,
    formVerification,
    formChangement,
    verifierMotDePasseMutation,
    changerMotDePasseMutation,
    reinitialiser
  } = useMotDePasse()

  if (!enEdition) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Mot de passe</h2>
            <p className="text-sm text-gray-500">Modifiez votre mot de passe</p>
          </div>
          <Button onClick={() => setEnEdition(true)}>
            Modifier
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {etape === 'verification' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formVerification.handleSubmit()
            }}
            className="space-y-4"
          >
            <formVerification.Field name="motdepasse">
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
            </formVerification.Field>
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

        {etape === 'changement' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formChangement.handleSubmit()
            }}
            className="space-y-4"
          >
            <formChangement.Field name="motdepasse">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="motdepasse">Nouveau mot de passe</Label>
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
            </formChangement.Field>
            <formChangement.Field name="codeverification">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="codeverification">Code de vérification</Label>
                  <Input
                    id="codeverification"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Entrez le code reçu par email"
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
            </formChangement.Field>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={changerMotDePasseMutation.isPending}
              >
                {changerMotDePasseMutation.isPending
                  ? "Modification en cours..."
                  : "Changer le mot de passe"
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

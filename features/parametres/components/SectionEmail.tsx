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
            onSubmit={formMotDePasse.handleSubmit((data) => 
              verifierMotDePasseMutation.mutate(data.motdepasse)
            )} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="motdepasse">Mot de passe actuel</Label>
              <InputPassword
                {...formMotDePasse.register('motdepasse')}
              />
              {formMotDePasse.formState.errors.motdepasse && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formMotDePasse.formState.errors.motdepasse.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
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
            onSubmit={formEmail.handleSubmit((data) => 
              changerEmailMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="nouvelEmail">Nouvel email</Label>
              <Input
                id="nouvelEmail"
                type="email"
                {...formEmail.register('nouvelEmail')}
              />
              {formEmail.formState.errors.nouvelEmail && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formEmail.formState.errors.nouvelEmail.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeVerification">Code de vérification</Label>
              <Input
                id="codeVerification"
                {...formEmail.register('codeverification')}
              />
              {formEmail.formState.errors.codeverification && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formEmail.formState.errors.codeverification.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
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